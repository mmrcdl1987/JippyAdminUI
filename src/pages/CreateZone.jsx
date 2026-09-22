import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polygon,
  Autocomplete,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiArrowLeft,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiTrash2,
  FiPlus,
  FiMove,
  FiRefreshCw,
  FiSearch,
  FiHelpCircle,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiMaximize2,
  FiMinimize2,
  FiSliders,
  FiRotateCcw,
  FiEdit3,
} from "react-icons/fi";

import API from "../services/api";
import CoordinatePreview from "../components/zones/CoordinatePreview";
import "../styles/CreateZone.css";

const libraries = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "580px",
  borderRadius: "14px",
};

const DEFAULT_CENTER = {
  lat: 17.385,
  lng: 78.4867,
};

function CreateZone({ setActivePage }) {
  // =========================================================
  // GOOGLE MAPS LOADER HOOK
  // =========================================================
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // =========================================================
  // NAVIGATION
  // =========================================================
  const navigate = useNavigate();

  // =========================================================
  // BASIC ZONE STATE
  // =========================================================
  const [zoneName, setZoneName] = useState("");
  const [center, setCenter] = useState(null);

  // Current manually created polygon points
  const [boundary, setBoundary] = useState([]);

  // Saved/manual polygons
  const [polygons, setPolygons] = useState([]);

  // =========================================================
  // CITY / AREA BOUNDARY
  // =========================================================
  const [searchedBoundaryPolygons, setSearchedBoundaryPolygons] = useState([]);
  const [loadingBoundary, setLoadingBoundary] = useState(false);
  const [boundarySourceName, setBoundarySourceName] = useState("");
  const [boundaryType, setBoundaryType] = useState("city"); // "city" | "area"
  const [isOfficialBoundary, setIsOfficialBoundary] = useState(false);

  // =========================================================
  // OTHER STATE
  // =========================================================
  const [mode, setMode] = useState("hand"); // "hand" | "polygon"
  const [isEdit, setIsEdit] = useState(false);
  const [zoneId, setZoneId] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [toast, setToast] = useState(null);

  // =========================================================
  // ZONE RESIZING & EDITING STATE
  // =========================================================
  const [isEditable, setIsEditable] = useState(true); // Direct vertex handles on map
  const [scalePercent, setScalePercent] = useState(100);
  const [polygonKey, setPolygonKey] = useState(0);

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // =========================================================
  // REFS
  // =========================================================
  const mapRef = useRef(null);
  const autoCompleteRef = useRef(null);
  const originalPolygonsRef = useRef([]);
  const polygonRefs = useRef([]);
  const polygonListenersRef = useRef([]);

  // =========================================================
  // CLOSE / BACK HANDLER
  // =========================================================
  const handleClose = useCallback(() => {
    localStorage.removeItem("editZoneId");
    if (typeof setActivePage === "function") {
      setActivePage("zones");
    } else {
      navigate("/dashboard/zones");
    }
  }, [setActivePage, navigate]);

  // =========================================================
  // LOAD ZONE BY ID (FOR EDIT MODE)
  // GET /api/driver/zones/{zoneId}
  // =========================================================
  const loadZoneById = useCallback(async (id) => {
    try {
      const response = await API.get(`/api/driver/zones/${id}`);
      const zone = response.data;

      console.log("Loaded Zone:", zone);

      setZoneId(zone.zoneId);
      setZoneName(zone.zoneName || "");

      // Existing boundary parsing
      if (Array.isArray(zone.boundary)) {
        let loadedPolygons = [];

        if (zone.boundary.length > 0 && Array.isArray(zone.boundary[0])) {
          loadedPolygons = zone.boundary.map((poly) =>
            Array.isArray(poly[0]) ? poly[0] : poly
          );
        } else {
          loadedPolygons = [zone.boundary];
        }

        setPolygons(loadedPolygons);
        originalPolygonsRef.current = JSON.parse(JSON.stringify(loadedPolygons));
        setScalePercent(100);
        setIsEditable(true);

        // Center map on the first point of loaded polygon
        if (
          loadedPolygons.length > 0 &&
          loadedPolygons[0].length > 0 &&
          loadedPolygons[0][0].latitude !== undefined
        ) {
          setCenter({
            lat: Number(loadedPolygons[0][0].latitude),
            lng: Number(loadedPolygons[0][0].longitude),
          });
        }

        // Fit bounds if map is already loaded
        setTimeout(() => {
          if (!mapRef.current || !window.google) return;

          const bounds = new window.google.maps.LatLngBounds();

          loadedPolygons.forEach((polygon) => {
            polygon.forEach((point) => {
              if (point.latitude !== undefined && point.longitude !== undefined) {
                bounds.extend({
                  lat: Number(point.latitude),
                  lng: Number(point.longitude),
                });
              }
            });
          });

          if (!bounds.isEmpty()) {
            mapRef.current.fitBounds(bounds);
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error loading zone:", error);
      setToast({
        type: "error",
        message: "Failed to load existing zone details.",
      });
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    const editZoneId = localStorage.getItem("editZoneId");

    if (editZoneId) {
      setIsEdit(true);
      loadZoneById(editZoneId);
    }

    // Get current browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter((prev) => {
            // If already set by loadZoneById, keep it
            if (prev) return prev;
            return {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          });
        },
        () => {
          setCenter((prev) => prev || DEFAULT_CENTER);
        }
      );
    } else {
      setCenter((prev) => prev || DEFAULT_CENTER);
    }
  }, [loadZoneById]);

  // =========================================================
  // MAP LOAD
  // =========================================================
  const onMapLoad = (map) => {
    mapRef.current = map;

    // If polygons are already loaded, fit bounds immediately
    if (polygons.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      polygons.forEach((polygon) => {
        polygon.forEach((point) => {
          if (point.latitude !== undefined && point.longitude !== undefined) {
            bounds.extend({
              lat: Number(point.latitude),
              lng: Number(point.longitude),
            });
          }
        });
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  };

  // =========================================================
  // CONVERT GEOJSON COORDINATES
  // =========================================================
  const convertPolygonCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return null;
    }

    const convertRing = (ring) => {
      if (!Array.isArray(ring) || ring.length < 3) {
        return [];
      }

      return ring
        .map((coordinate) => {
          if (!Array.isArray(coordinate) || coordinate.length < 2) {
            return null;
          }

          const longitude = Number(coordinate[0]);
          const latitude = Number(coordinate[1]);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return {
            lat: latitude,
            lng: longitude,
          };
        })
        .filter(Boolean);
    };

    const outer = convertRing(coordinates[0]);

    if (outer.length < 3) {
      return null;
    }

    const holes = coordinates
      .slice(1)
      .map(convertRing)
      .filter((hole) => hole.length >= 3);

    return {
      outer,
      holes,
    };
  };

  const convertGeoJsonToGooglePolygons = (geojson) => {
    const polys = [];

    if (!geojson || !geojson.type) {
      return polys;
    }

    if (geojson.type === "Polygon") {
      const polygon = convertPolygonCoordinates(geojson.coordinates);
      if (polygon) {
        polys.push(polygon);
      }
    } else if (geojson.type === "MultiPolygon") {
      geojson.coordinates.forEach((polygonCoordinates) => {
        const polygon = convertPolygonCoordinates(polygonCoordinates);
        if (polygon) {
          polys.push(polygon);
        }
      });
    } else if (geojson.type === "GeometryCollection") {
      if (Array.isArray(geojson.geometries)) {
        geojson.geometries.forEach((geometry) => {
          const childPolygons = convertGeoJsonToGooglePolygons(geometry);
          polys.push(...childPolygons);
        });
      }
    }

    return polys;
  };

  // =========================================================
  // FIT MAP TO POLYGONS
  // =========================================================
  const fitMapToPolygons = (polygonsList) => {
    if (!mapRef.current || !window.google || !polygonsList || polygonsList.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();

    polygonsList.forEach((polygon) => {
      if (polygon.outer) {
        polygon.outer.forEach((point) => {
          bounds.extend({ lat: Number(point.lat), lng: Number(point.lng) });
        });
      }
      if (polygon.holes) {
        polygon.holes.forEach((hole) => {
          hole.forEach((point) => {
            bounds.extend({ lat: Number(point.lat), lng: Number(point.lng) });
          });
        });
      }
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  };

  // =========================================================
  // GET OSM / AREA BOUNDARY (CITIES & LOCALITIES)
  // =========================================================
  const getOSMBoundary = async (place) => {
    try {
      setLoadingBoundary(true);
      setSearchedBoundaryPolygons([]);
      setBoundarySourceName("");

      const placeName = place.name || "";
      const address = place.formatted_address || placeName || "";

      if (!address.trim() && !place.geometry) {
        console.warn("No address or geometry available for place");
        setLoadingBoundary(false);
        return false;
      }

      // Determine whether search is a city/district vs an area/locality
      const types = place.types || [];
      const isSublocality =
        types.includes("sublocality") ||
        types.includes("sublocality_level_1") ||
        types.includes("sublocality_level_2") ||
        types.includes("neighborhood") ||
        types.includes("route") ||
        types.includes("premise") ||
        types.includes("postal_code");

      const detectedType = isSublocality ? "area" : "city";
      setBoundaryType(detectedType);

      // Extract address components for targeted search
      const getComponent = (type) => {
        if (!Array.isArray(place.address_components)) return "";
        const item = place.address_components.find(
          (c) => Array.isArray(c.types) && c.types.includes(type)
        );
        return item ? item.long_name : "";
      };

      const sublocality1 = getComponent("sublocality_level_1");
      const locality = getComponent("locality");
      const adminArea3 = getComponent("administrative_area_level_3");
      const postalCode = getComponent("postal_code");
      const country = getComponent("country") || "India";

      // Build prioritized query candidates
      const queryCandidates = [];

      if (sublocality1 && locality) {
        queryCandidates.push(`${sublocality1}, ${locality}`);
      }
      if (placeName && locality && placeName !== locality) {
        queryCandidates.push(`${placeName}, ${locality}`);
      }
      if (sublocality1) {
        queryCandidates.push(sublocality1);
        queryCandidates.push(`${sublocality1} mandal`);
      }
      if (adminArea3 && !queryCandidates.includes(adminArea3)) {
        queryCandidates.push(adminArea3);
      }
      if (placeName && !queryCandidates.includes(placeName)) {
        queryCandidates.push(placeName);
      }
      if (address && !queryCandidates.includes(address)) {
        queryCandidates.push(address);
      }
      if (postalCode) {
        queryCandidates.push(`${postalCode}, ${country}`);
      }

      console.log("Boundary search candidates:", queryCandidates);

      let foundOfficialPolygon = false;

      // 1. Search OpenStreetMap Nominatim for official Polygon/MultiPolygon
      for (const query of queryCandidates.slice(0, 4)) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2600);

          const url =
            `https://nominatim.openstreetmap.org/search` +
            `?format=json` +
            `&q=${encodeURIComponent(query)}` +
            `&polygon_geojson=1` +
            `&limit=5`;

          const res = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!res.ok) continue;
          const items = await res.json();
          if (!Array.isArray(items) || items.length === 0) continue;

          // Find an item that actually contains Polygon or MultiPolygon geometry
          const resultWithPolygon = items.find(
            (item) =>
              item.geojson &&
              (item.geojson.type === "Polygon" ||
                item.geojson.type === "MultiPolygon" ||
                item.geojson.type === "GeometryCollection")
          );

          if (resultWithPolygon) {
            console.log("Found official polygon in OSM for:", query, resultWithPolygon);
            const converted = convertGeoJsonToGooglePolygons(resultWithPolygon.geojson);
            if (converted && converted.length > 0) {
              setSearchedBoundaryPolygons(converted);
              setBoundarySourceName(resultWithPolygon.display_name || query);
              setIsOfficialBoundary(true);
              fitMapToPolygons(converted);
              foundOfficialPolygon = true;
              break;
            }
          }
        } catch (candidateErr) {
          console.warn(`Query "${query}" search error:`, candidateErr);
        }
      }

      if (foundOfficialPolygon) {
        setLoadingBoundary(false);
        return true;
      }

      // =========================================================
      // 2. FALLBACK: GENERATE AREA BOUNDARY FROM GOOGLE VIEWPORT / BOUNDS
      // =========================================================
      console.log("No official polygon found in OSM, constructing area boundary from viewport/bounds...");

      let north, south, east, west;

      if (place.geometry && place.geometry.viewport) {
        const ne = place.geometry.viewport.getNorthEast();
        const sw = place.geometry.viewport.getSouthWest();
        north = typeof ne.lat === "function" ? ne.lat() : ne.lat;
        east = typeof ne.lng === "function" ? ne.lng() : ne.lng;
        south = typeof sw.lat === "function" ? sw.lat() : sw.lat;
        west = typeof sw.lng === "function" ? sw.lng() : sw.lng;
      } else if (place.geometry && place.geometry.bounds) {
        const ne = place.geometry.bounds.getNorthEast();
        const sw = place.geometry.bounds.getSouthWest();
        north = typeof ne.lat === "function" ? ne.lat() : ne.lat;
        east = typeof ne.lng === "function" ? ne.lng() : ne.lng;
        south = typeof sw.lat === "function" ? sw.lat() : sw.lat;
        west = typeof sw.lng === "function" ? sw.lng() : sw.lng;
      }

      if (
        typeof north === "number" &&
        typeof south === "number" &&
        typeof east === "number" &&
        typeof west === "number" &&
        !isNaN(north) &&
        !isNaN(south) &&
        !isNaN(east) &&
        !isNaN(west)
      ) {
        const midLat = (north + south) / 2;
        const midLng = (east + west) / 2;
        const dLat = (north - south) * 0.15;
        const dLng = (east - west) * 0.15;

        const areaBoundary = [
          {
            outer: [
              { lat: north, lng: midLng },
              { lat: north - dLat, lng: east - dLng },
              { lat: midLat, lng: east },
              { lat: south + dLat, lng: east - dLng },
              { lat: south, lng: midLng },
              { lat: south + dLat, lng: west + dLng },
              { lat: midLat, lng: west },
              { lat: north - dLat, lng: west + dLng },
            ],
            holes: [],
          },
        ];

        console.log("Generated area boundary polygon from viewport:", areaBoundary);
        setSearchedBoundaryPolygons(areaBoundary);
        setBoundarySourceName(place.formatted_address || placeName || "Area Delivery Perimeter");
        setIsOfficialBoundary(false);
        fitMapToPolygons(areaBoundary);
        setLoadingBoundary(false);
        return true;
      }

      console.warn("Could not determine boundary or viewport for place:", place);
      setLoadingBoundary(false);
      return false;
    } catch (error) {
      console.error("Boundary Error:", error);
      setLoadingBoundary(false);
      return false;
    }
  };

  // =========================================================
  // GOOGLE PLACE SEARCH CHANGED
  // =========================================================
  const onPlaceChanged = async () => {
    if (!autoCompleteRef.current) return;

    const place = autoCompleteRef.current.getPlace();
    console.log("Google Selected Place:", place);

    if (!place || !place.geometry || !place.geometry.location) {
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setCenter(location);
    setSelectedLocationName(place.formatted_address || place.name || "");
    setSearchedBoundaryPolygons([]);
    setBoundarySourceName("");
    setBoundary([]);

    // Auto-fill zone name if currently empty
    if (!zoneName.trim() && place.name) {
      setZoneName(place.name);
    }

    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(14);
    }

    await getOSMBoundary(place);
  };

  // =========================================================
  // USE CITY / AREA BOUNDARY AS ZONE
  // =========================================================
  const useCityBoundary = () => {
    if (searchedBoundaryPolygons.length === 0) {
      setToast({
        type: "error",
        message: "Please search and select a city or area first.",
      });
      return;
    }

    const cityPolygons = searchedBoundaryPolygons
      .map((polygon) => {
        return polygon.outer.map((point) => ({
          latitude: point.lat,
          longitude: point.lng,
        }));
      })
      .filter((polygon) => polygon.length >= 3);

    if (cityPolygons.length === 0) {
      setToast({
        type: "error",
        message: "No valid boundary coordinates found to apply.",
      });
      return;
    }

    setPolygons(cityPolygons);
    originalPolygonsRef.current = JSON.parse(JSON.stringify(cityPolygons));
    setScalePercent(100);
    setIsEditable(true);
    setBoundary([]);
    setMode("hand");

    setToast({
      type: "success",
      message: `${
        boundaryType === "city" ? "City" : "Area"
      } boundary successfully applied to this delivery zone!`,
    });
  };

  // =========================================================
  // MAP CLICK (MANUAL POLYGON DRAWING)
  // =========================================================
  const handleMapClick = (event) => {
    if (mode !== "polygon") return;
    if (!event.latLng) return;

    const point = {
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    };

    setBoundary((prev) => [...prev, point]);
  };

  // =========================================================
  // ENABLE DRAWING MODE
  // =========================================================
  const enablePolygonMode = () => {
    setMode("polygon");
    setToast({
      type: "info",
      message: "Drawing Mode active: Click points on the map to create boundary.",
    });
  };

  // =========================================================
  // SAVE CURRENT MANUAL POLYGON
  // =========================================================
  const createNewPolygon = () => {
    if (boundary.length < 3) {
      setToast({
        type: "error",
        message: "At least 3 points are required to close and form a polygon.",
      });
      return;
    }

    const closedBoundary = [
      ...boundary,
      {
        latitude: boundary[0].latitude,
        longitude: boundary[0].longitude,
      },
    ];

    setPolygons((prev) => {
      const updated = [...prev, closedBoundary];
      originalPolygonsRef.current = JSON.parse(JSON.stringify(updated));
      return updated;
    });
    setScalePercent(100);
    setIsEditable(true);
    setBoundary([]);
    setMode("hand");

    setToast({
      type: "success",
      message: "Polygon completed and added to zone.",
    });
  };

  // =========================================================
  // CLEAR POLYGONS
  // =========================================================
  const clearPolygon = () => {
    setBoundary([]);
    setPolygons([]);
    originalPolygonsRef.current = [];
    setScalePercent(100);
    setMode("hand");
    setToast({
      type: "info",
      message: "All polygons and points have been cleared.",
    });
  };

  // =========================================================
  // ZONE SIZE & AREA CALCULATIONS
  // =========================================================
  const calculatePolygonAreaSqKm = (coords) => {
    if (!coords || coords.length < 3) return "0.00";

    if (window.google?.maps?.geometry?.spherical) {
      try {
        const path = coords.map(
          (p) =>
            new window.google.maps.LatLng(
              Number(p.latitude),
              Number(p.longitude)
            )
        );
        const sqMeters =
          window.google.maps.geometry.spherical.computeArea(path);
        return (sqMeters / 1000000).toFixed(2);
      } catch {
        // use fallback below
      }
    }

    // Geodesic spherical projection formula fallback
    const RADIUS = 6378137;
    let total = 0;
    const len = coords.length;
    for (let i = 0; i < len; i++) {
      const j = (i + 1) % len;
      const lat1 = (Number(coords[i].latitude) * Math.PI) / 180;
      const lng1 = (Number(coords[i].longitude) * Math.PI) / 180;
      const lat2 = (Number(coords[j].latitude) * Math.PI) / 180;
      const lng2 = (Number(coords[j].longitude) * Math.PI) / 180;
      total += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    const sqMeters = Math.abs((total * RADIUS * RADIUS) / 2.0);
    return (sqMeters / 1000000).toFixed(2);
  };

  const getPolygonCentroid = (polygon) => {
    if (!polygon || polygon.length === 0) return { lat: 0, lng: 0 };
    let pts = polygon;
    if (
      pts.length > 3 &&
      pts[0].latitude === pts[pts.length - 1].latitude &&
      pts[0].longitude === pts[pts.length - 1].longitude
    ) {
      pts = pts.slice(0, -1);
    }

    let sumLat = 0;
    let sumLng = 0;
    pts.forEach((pt) => {
      sumLat += Number(pt.latitude);
      sumLng += Number(pt.longitude);
    });

    return {
      lat: sumLat / pts.length,
      lng: sumLng / pts.length,
    };
  };

  const scalePolygonFromCentroid = (polygon, factor) => {
    if (!polygon || polygon.length < 3) return polygon;
    const centroid = getPolygonCentroid(polygon);

    return polygon.map((pt) => ({
      latitude: centroid.lat + (Number(pt.latitude) - centroid.lat) * factor,
      longitude: centroid.lng + (Number(pt.longitude) - centroid.lng) * factor,
    }));
  };

  // SCALE POLYGONS BY A FACTOR (e.g. 1.10 for +10%, 0.90 for -10%)
  const handleScalePolygons = (factor) => {
    if (!polygons || polygons.length === 0) {
      setToast({
        type: "info",
        message: "Please draw or select a zone boundary first before scaling.",
      });
      return;
    }

    if (!originalPolygonsRef.current || originalPolygonsRef.current.length === 0) {
      originalPolygonsRef.current = JSON.parse(JSON.stringify(polygons));
    }

    const currentPolys = getLatestPolygons();
    const scaled = currentPolys.map((poly) =>
      scalePolygonFromCentroid(poly, factor)
    );

    setPolygons(scaled);
    setPolygonKey((prev) => prev + 1);

    const newScale = Math.round(scalePercent * factor);
    const clampedScale = Math.max(30, Math.min(300, newScale));
    setScalePercent(clampedScale);

    const changePercent = Math.round(Math.abs((factor - 1) * 100));
    setToast({
      type: "info",
      message: `Zone size ${
        factor > 1 ? "increased" : "reduced"
      } by ${changePercent}%!`,
    });
  };

  // SCALE POLYGON USING SMOOTH RANGE SLIDER (e.g. 50% to 200%)
  const handleSliderChange = (newPercent) => {
    setScalePercent(newPercent);
    if (!originalPolygonsRef.current || originalPolygonsRef.current.length === 0) {
      originalPolygonsRef.current = JSON.parse(JSON.stringify(polygons));
    }

    const factor = newPercent / 100;
    const scaled = originalPolygonsRef.current.map((poly) =>
      scalePolygonFromCentroid(poly, factor)
    );

    setPolygons(scaled);
    setPolygonKey((prev) => prev + 1);
  };

  // RESET BOUNDARY BACK TO ORIGINAL LOADED/CREATED SIZE
  const handleResetSize = () => {
    if (!originalPolygonsRef.current || originalPolygonsRef.current.length === 0) {
      setToast({
        type: "info",
        message: "Already at original size.",
      });
      return;
    }

    setPolygons(JSON.parse(JSON.stringify(originalPolygonsRef.current)));
    setScalePercent(100);
    setPolygonKey((prev) => prev + 1);
    setToast({
      type: "info",
      message: "Zone boundary restored to original size.",
    });
  };

  // =========================================================
  // GOOGLE MAPS POLYGON EDIT / DRAG HANDLERS
  // =========================================================
  const extractCoordinatesFromPolygon = (polygonInstance, index) => {
    if (!polygonInstance) return;
    const path = polygonInstance.getPath();
    if (!path) return;
    const newCoords = [];
    for (let i = 0; i < path.getLength(); i++) {
      const pt = path.getAt(i);
      newCoords.push({
        latitude: pt.lat(),
        longitude: pt.lng(),
      });
    }
    if (newCoords.length >= 3) {
      setPolygons((prev) => {
        const updated = [...prev];
        updated[index] = newCoords;
        return updated;
      });
    }
  };

  const handlePolygonLoad = (polygonInstance, index) => {
    polygonRefs.current[index] = polygonInstance;

    // Clear previous listeners
    if (polygonListenersRef.current[index]) {
      polygonListenersRef.current[index].forEach((l) => {
        window.google?.maps?.event?.removeListener(l);
      });
    }
    polygonListenersRef.current[index] = [];

    const path = polygonInstance.getPath();
    if (!path) return;

    const onPathChanged = () => {
      extractCoordinatesFromPolygon(polygonInstance, index);
    };

    const l1 = path.addListener("set_at", onPathChanged);
    const l2 = path.addListener("insert_at", onPathChanged);
    const l3 = path.addListener("remove_at", onPathChanged);
    polygonListenersRef.current[index] = [l1, l2, l3];
  };

  const handlePolygonUnmount = (index) => {
    if (polygonListenersRef.current[index]) {
      polygonListenersRef.current[index].forEach((l) => {
        window.google?.maps?.event?.removeListener(l);
      });
      polygonListenersRef.current[index] = [];
    }
    polygonRefs.current[index] = null;
  };

  const handlePolygonMouseUp = (index) => {
    const polyInstance = polygonRefs.current[index];
    if (polyInstance) {
      extractCoordinatesFromPolygon(polyInstance, index);
    }
  };

  const getLatestPolygons = () => {
    if (polygonRefs.current && polygonRefs.current.length > 0) {
      const extracted = polygonRefs.current
        .map((polyInstance, idx) => {
          if (!polyInstance) return polygons[idx] || [];
          const path = polyInstance.getPath();
          if (!path) return polygons[idx] || [];
          const coords = [];
          for (let i = 0; i < path.getLength(); i++) {
            const pt = path.getAt(i);
            coords.push({
              latitude: pt.lat(),
              longitude: pt.lng(),
            });
          }
          return coords.length >= 3 ? coords : polygons[idx] || [];
        })
        .filter((p) => p && p.length >= 3);

      if (extracted.length > 0) return extracted;
    }
    return polygons;
  };

  // =========================================================
  // VALIDATE & CONVERT TO MULTIPOLYGON (SECTION 4, 5, 6)
  // MultiPolygon → Polygon → Ring → CoordinateDTO { longitude, latitude }
  // =========================================================
  const validateAndFormatMultiPolygon = (polygonsList) => {
    if (!Array.isArray(polygonsList) || polygonsList.length === 0) {
      return {
        valid: false,
        error: "At least one delivery polygon boundary is required.",
      };
    }

    const multiPolygon = [];

    for (let i = 0; i < polygonsList.length; i++) {
      const rawRing = polygonsList[i];
      if (!Array.isArray(rawRing) || rawRing.length < 3) {
        return {
          valid: false,
          error: `Polygon #${i + 1} must contain at least 3 points before closure.`,
        };
      }

      // Map each coordinate ensuring longitude first and latitude second
      const cleanRing = rawRing
        .map((pt) => {
          const lng = Number(pt.longitude !== undefined ? pt.longitude : pt.lng);
          const lat = Number(pt.latitude !== undefined ? pt.latitude : pt.lat);

          if (isNaN(lng) || isNaN(lat)) return null;
          if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;

          return {
            longitude: Number(lng.toFixed(6)),
            latitude: Number(lat.toFixed(6)),
          };
        })
        .filter(Boolean);

      if (cleanRing.length < 3) {
        return {
          valid: false,
          error: `Polygon #${i + 1} contains invalid geographic coordinates.`,
        };
      }

      // Rule: The first and last coordinates of each exterior ring must be identical.
      const first = cleanRing[0];
      const last = cleanRing[cleanRing.length - 1];
      if (first.longitude !== last.longitude || first.latitude !== last.latitude) {
        cleanRing.push({
          longitude: first.longitude,
          latitude: first.latitude,
        });
      }

      // Rule: Each exterior ring must contain at least four coordinates (including closure).
      if (cleanRing.length < 4) {
        return {
          valid: false,
          error: `Polygon #${i + 1} exterior ring must contain at least 4 coordinates.`,
        };
      }

      // MultiPolygon → Polygon → Exterior Ring
      multiPolygon.push([cleanRing]);
    }

    return { valid: true, boundary: multiPolygon };
  };

  // =========================================================
  // SAVE / UPDATE ZONE
  // POST /api/driver/zones OR PUT /api/driver/zones/{zoneId}
  // =========================================================
  const saveZone = async () => {
    // 1. Validate zone name
    const trimmedName = zoneName.trim();
    if (!trimmedName) {
      setToast({
        type: "error",
        message: "Zone Name is required and cannot be empty or only spaces.",
      });
      return;
    }

    // 2. Gather all active and saved polygons
    const currentPolygons = getLatestPolygons();
    const allPolygons = [...currentPolygons];

    // Include unfinished manual drawing polygon if it has >= 3 points
    if (boundary.length >= 3) {
      const closedBoundary = [
        ...boundary,
        {
          latitude: boundary[0].latitude,
          longitude: boundary[0].longitude,
        },
      ];
      allPolygons.push(closedBoundary);
    }

    // 3. Validate boundary and build MultiPolygon structure
    const validation = validateAndFormatMultiPolygon(allPolygons);
    if (!validation.valid) {
      setToast({
        type: "error",
        message: validation.error,
      });
      return;
    }

    const createdById = Number(
      localStorage.getItem("userId") ||
      localStorage.getItem("loggedInUserId") ||
      1
    );

    try {
      setIsSaving(true);
      let response;

      if (isEdit) {
        // PUT /api/driver/zones/{zoneId}
        const putPayload = {
          zoneName: trimmedName,
          boundary: validation.boundary,
        };

        console.log("PUT ZONE PAYLOAD (/api/driver/zones/{zoneId}):", putPayload);
        response = await API.put(`/api/driver/zones/${zoneId}`, putPayload);
        console.log("UPDATE RESPONSE:", response.data);

        setToast({
          type: "success",
          message: `Zone "${trimmedName}" updated successfully!`,
        });

        setTimeout(() => {
          handleClose();
        }, 1200);
        return;
      }

      // POST /api/driver/zones
      const postPayload = {
        zoneName: trimmedName,
        createdBy: createdById,
        boundary: validation.boundary,
      };

      console.log("POST ZONE PAYLOAD (/api/driver/zones):", postPayload);
      response = await API.post("/api/driver/zones", postPayload);
      console.log("CREATE RESPONSE:", response.data);

      setToast({
        type: "success",
        message: `Zone "${trimmedName}" created successfully!`,
      });

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (error) {
      console.error("Zone Save Error:", error);

      // Extract user-friendly error without exposing raw stack traces
      let errMsg = "Error saving delivery zone. Please check your inputs and try again.";
      if (error?.response?.data) {
        const d = error.response.data;
        if (typeof d === "string") {
          errMsg = d;
        } else if (d.errorMessage) {
          errMsg = d.errorMessage;
        } else if (d.message) {
          errMsg = d.message;
        } else if (d.error) {
          errMsg = d.error;
        } else if (Array.isArray(d.errors) && d.errors.length > 0) {
          errMsg = d.errors
            .map((e) => e.defaultMessage || e.message || String(e))
            .join(", ");
        }
      }

      setToast({
        type: "error",
        message: errMsg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // LOADING / ERROR SCREEN
  // =========================================================
  if (loadError) {
    return (
      <div className="zone-loading-screen">
        <div className="zone-loading-box">
          <FiAlertCircle size={36} color="#ef4444" />
          <p>Failed to load Google Maps script. Please verify your API Key in .env</p>
          <button
            type="button"
            className="create-zone-back-btn"
            onClick={handleClose}
            style={{ marginTop: "12px" }}
          >
            <FiArrowLeft size={16} />
            <span>Back to Zones</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded || !center) {
    return (
      <div className="zone-loading-screen">
        <div className="zone-loading-box">
          <FiRefreshCw className="zone-spin" size={32} />
          <p>Initializing Google Maps & Location...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="create-zone-page">
      {/* =====================================================
          FLOATING TOAST NOTIFICATION
      ====================================================== */}
      {toast && (
        <div
          className={`zone-toast ${
            toast.type === "success"
              ? "zone-toast-success"
              : toast.type === "error"
              ? "zone-toast-error"
              : "zone-toast-info"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheck size={18} />
          ) : toast.type === "error" ? (
            <FiAlertCircle size={18} />
          ) : (
            <FiInfo size={18} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="zone-toast-close"
            onClick={() => setToast(null)}
            title="Dismiss notification"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* =====================================================
          PAGE HEADER WITH CLOSE & BACK BUTTONS
      ====================================================== */}
      <div className="create-zone-header">
        <div className="create-zone-header-left">
          <div className="create-zone-header-icon">
            <FiMapPin />
          </div>

          <div className="create-zone-header-titles">
            <div className="create-zone-eyebrow-row">
              <span className="create-zone-eyebrow">Outlets & Logistics</span>
              <span className="create-zone-divider">/</span>
              <span className="create-zone-breadcrumb">Zone Management</span>
            </div>

            <h2>
              {isEdit ? "Edit Delivery Zone" : "Create Delivery Zone"}
              {isEdit && zoneId && (
                <span className="create-zone-id-badge">#{zoneId}</span>
              )}
            </h2>

            <p>
              {isEdit
                ? "Update polygon boundaries, adjust zone coordinates, or rename your delivery region."
                : "Search a city/area to detect its official boundary, or draw custom polygon perimeters on the map."}
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS (CLOSE & BACK) */}
        <div className="create-zone-header-actions">
          <button
            type="button"
            className="create-zone-back-btn"
            onClick={handleClose}
            title="Return to Zone List"
          >
            <FiArrowLeft size={16} />
            <span>Back to Zones</span>
          </button>

          <button
            type="button"
            className="create-zone-close-icon-btn"
            onClick={handleClose}
            title="Close"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT CONTAINER
      ====================================================== */}
      <div className="create-zone-content-grid">
        {/* LEFT COLUMN / FORM & INSTRUCTIONS */}
        <div className="create-zone-left-col">
          {/* CARD: ZONE INFORMATION */}
          <div className="create-zone-card">
            <div className="create-zone-card-header">
              <div className="create-zone-card-title-group">
                <span className="create-zone-step-tag">Step 1</span>
                <h3>Zone Identification</h3>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="zoneNameInput">
                Zone Name <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <FiMapPin className="field-icon" />
                <input
                  id="zoneNameInput"
                  type="text"
                  value={zoneName}
                  placeholder="e.g. Hyderabad Central, Sector 4, North Zone"
                  onChange={(event) => setZoneName(event.target.value)}
                  className="create-zone-input"
                />
              </div>
              <small className="field-hint">
                Provide a descriptive name that drivers and outlets will recognize.
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: "8px" }}>
              <label htmlFor="locationSearchInput">
                Search City or Locality
              </label>

              <Autocomplete
                onLoad={(autocomplete) => {
                  autoCompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
              >
                <div className="input-with-icon">
                  <FiSearch className="field-icon" />
                  <input
                    id="locationSearchInput"
                    type="text"
                    value={selectedLocationName}
                    onChange={(e) => setSelectedLocationName(e.target.value)}
                    placeholder="Search area (e.g., Banjara Hills, Gachibowli)..."
                    className="create-zone-input location-search-input"
                  />
                  {selectedLocationName && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setSelectedLocationName("");
                        setSearchedBoundaryPolygons([]);
                        setBoundarySourceName("");
                      }}
                      title="Clear search"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </Autocomplete>
              <small className="field-hint">
                Google Places autocomplete centers the map and searches for area boundaries.
              </small>
            </div>

            {/* BOUNDARY LOADING INDICATOR */}
            {loadingBoundary && (
              <div className="boundary-status-banner loading">
                <FiRefreshCw className="zone-spin" size={16} />
                <span>Detecting boundary for {selectedLocationName || "area"}...</span>
              </div>
            )}

            {/* DETECTED BOUNDARY BANNER */}
            {searchedBoundaryPolygons.length > 0 && (
              <div className="boundary-status-banner detected">
                <div className="boundary-detected-header">
                  <div className="boundary-badge">
                    <FiCheckCircle size={15} />
                    <span>
                      {boundaryType === "city"
                        ? "City Boundary Detected"
                        : "Area Boundary Detected"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={useCityBoundary}
                    className="apply-boundary-btn"
                    title={`Apply this ${boundaryType === "city" ? "city" : "area"} boundary to the delivery zone`}
                  >
                    <FiCheck size={16} />
                    <span>
                      {boundaryType === "city"
                        ? "Use City Boundary"
                        : "Use Area Boundary"}
                    </span>
                  </button>
                </div>

                <p className="boundary-source-name">{boundarySourceName}</p>
                <div className="boundary-stats-subtext">
                  {isOfficialBoundary
                    ? `Detected official administrative boundary (${searchedBoundaryPolygons.length} segment).`
                    : `Detected area coverage perimeter.`}{" "}
                  Click button to apply as zone boundary.
                </div>
              </div>
            )}
          </div>

          {/* CARD: ZONE SIZE & BOUNDARY ADJUSTMENT */}
          {polygons.length > 0 && (
            <div className="create-zone-card zone-sizing-card">
              <div className="create-zone-card-header">
                <div className="create-zone-card-title-group">
                  <span className="create-zone-step-tag purple">
                    <FiMaximize2 size={12} style={{ marginRight: 4 }} />
                    Size & Scale
                  </span>
                  <h3>Zone Size Adjustment</h3>
                </div>
                <span className="scale-indicator-badge">
                  {scalePercent}% Size
                </span>
              </div>

              {/* LIVE METRICS ROW */}
              <div className="zone-size-metrics-row">
                <div className="zone-metric-card">
                  <span className="zone-metric-label">Estimated Area</span>
                  <span className="zone-metric-val">
                    {calculatePolygonAreaSqKm(polygons[0])} <small>km²</small>
                  </span>
                </div>
                <div className="zone-metric-card">
                  <span className="zone-metric-label">Boundary Points</span>
                  <span className="zone-metric-val">
                    {polygons[0]?.length || 0} <small>vertices</small>
                  </span>
                </div>
              </div>

              {/* QUICK EXPAND (INCREASE SIZE) */}
              <div className="zone-sizing-section">
                <label className="sizing-section-label">
                  <FiMaximize2 size={13} />
                  <span>Increase Zone Size (Expand)</span>
                </label>
                <div className="quick-scale-btns-grid">
                  <button
                    type="button"
                    className="scale-btn scale-up"
                    onClick={() => handleScalePolygons(1.05)}
                    title="Increase boundary by +5%"
                  >
                    +5%
                  </button>
                  <button
                    type="button"
                    className="scale-btn scale-up featured"
                    onClick={() => handleScalePolygons(1.10)}
                    title="Increase boundary by +10%"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    className="scale-btn scale-up"
                    onClick={() => handleScalePolygons(1.20)}
                    title="Increase boundary by +20%"
                  >
                    +20%
                  </button>
                  <button
                    type="button"
                    className="scale-btn scale-up"
                    onClick={() => handleScalePolygons(1.50)}
                    title="Increase boundary by +50%"
                  >
                    +50%
                  </button>
                </div>
              </div>

              {/* QUICK SHRINK (DECREASE SIZE) */}
              <div className="zone-sizing-section">
                <label className="sizing-section-label">
                  <FiMinimize2 size={13} />
                  <span>Decrease Zone Size (Shrink)</span>
                </label>
                <div className="quick-scale-btns-grid">
                  <button
                    type="button"
                    className="scale-btn scale-down"
                    onClick={() => handleScalePolygons(0.95)}
                    title="Shrink boundary by -5%"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    className="scale-btn scale-down featured"
                    onClick={() => handleScalePolygons(0.90)}
                    title="Shrink boundary by -10%"
                  >
                    -10%
                  </button>
                  <button
                    type="button"
                    className="scale-btn scale-down"
                    onClick={() => handleScalePolygons(0.80)}
                    title="Shrink boundary by -20%"
                  >
                    -20%
                  </button>
                  <button
                    type="button"
                    className="scale-btn scale-reset"
                    onClick={handleResetSize}
                    title="Reset back to original size"
                  >
                    <FiRotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* SMOOTH SCALE SLIDER */}
              <div className="zone-sizing-section slider-section">
                <div className="slider-header-row">
                  <label className="sizing-section-label">
                    <FiSliders size={13} />
                    <span>Smooth Scale Range</span>
                  </label>
                  <span className="slider-value-pill">
                    {scalePercent}%
                    {scalePercent !== 100 && (
                      <small>
                        (
                        {scalePercent > 100
                          ? `+${scalePercent - 100}%`
                          : `-${100 - scalePercent}%`}
                        )
                      </small>
                    )}
                  </span>
                </div>
                <div className="slider-control-row">
                  <span className="slider-end-label">50%</span>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="1"
                    value={scalePercent}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="zone-scale-range"
                  />
                  <span className="slider-end-label">200%</span>
                </div>
              </div>

              {/* DIRECT VERTEX DRAGGING TOGGLE */}
              <div className="vertex-drag-toggle-row">
                <div className="toggle-info">
                  <FiEdit3 size={16} className="toggle-icon" />
                  <div>
                    <strong>Direct Vertex Dragging</strong>
                    <small>Drag white corner dots on the map</small>
                  </div>
                </div>
                <button
                  type="button"
                  className={`switch-btn ${
                    isEditable ? "switch-on" : "switch-off"
                  }`}
                  onClick={() => setIsEditable((prev) => !prev)}
                  title={
                    isEditable
                      ? "Disable corner handles"
                      : "Enable corner handles"
                  }
                >
                  <span className="switch-slider" />
                </button>
              </div>
            </div>
          )}

          {/* CARD: COORDINATE & BOUNDARY PREVIEW */}
          <CoordinatePreview
            polygons={polygons}
            activeDrawingPoints={boundary}
            onClear={clearPolygon}
            onReset={handleResetSize}
          />

          {/* CARD: INSTRUCTIONS GUIDE */}
          <div className="create-zone-card instructions-card">
            <div
              className="instructions-header"
              onClick={() => setShowInstructions((prev) => !prev)}
            >
              <div className="instructions-title-left">
                <div className="instructions-icon-badge">
                  <FiHelpCircle />
                </div>
                <div>
                  <h4>Boundary Guide & Tips</h4>
                  <small>How to construct precise delivery boundaries</small>
                </div>
              </div>
              <button
                type="button"
                className="instructions-toggle-btn"
                aria-label="Toggle instructions"
              >
                {showInstructions ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {showInstructions && (
              <div className="instructions-body">
                <div className="guide-step-item">
                  <div className="guide-step-num purple">1</div>
                  <div className="guide-step-text">
                    <strong>Search Locality</strong>
                    <p>Enter an area or city name in the search box to focus the map.</p>
                  </div>
                </div>

                <div className="guide-step-item">
                  <div className="guide-step-num emerald">2</div>
                  <div className="guide-step-text">
                    <strong>Auto-Boundary</strong>
                    <p>
                      The boundary will appear in red. Click{" "}
                      <em>Use Area / City Boundary</em> to automatically load it.
                    </p>
                  </div>
                </div>

                <div className="guide-step-item">
                  <div className="guide-step-num blue">3</div>
                  <div className="guide-step-text">
                    <strong>Custom Drawing</strong>
                    <p>
                      Select the <strong>Shape Tool (➕)</strong> from the map
                      toolbar and click on the map to drop points.
                    </p>
                  </div>
                </div>

                <div className="guide-step-item">
                  <div className="guide-step-num amber">4</div>
                  <div className="guide-step-text">
                    <strong>Finish & Save</strong>
                    <p>
                      Click the <strong>Check Tool (✔)</strong> to close the
                      polygon, then hit <strong>Save Zone</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN / MAP CANVAS & CONTROLS */}
        <div className="create-zone-right-col">
          <div className="create-zone-card map-card">
            {/* MAP HEADER BAR */}
            <div className="map-card-header">
              <div className="map-card-title-group">
                <span className="create-zone-step-tag">Step 2</span>
                <h3>Interactive Polygon Map</h3>
              </div>

              <div className="map-header-badges">
                <div
                  className={`mode-badge ${
                    mode === "polygon" ? "drawing-active" : "hand-active"
                  }`}
                >
                  <span className="mode-dot" />
                  {mode === "polygon"
                    ? "Drawing Active (Click map to add points)"
                    : "Pan & Explore Mode"}
                </div>
              </div>
            </div>

            {/* GOOGLE MAP WRAPPER */}
            <div className="map-view-wrapper">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                onLoad={onMapLoad}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                  draggableCursor: mode === "polygon" ? "crosshair" : "grab",
                  draggingCursor: "grabbing",
                }}
              >
                {/* SEARCHED AREA BOUNDARY (RED) */}
                {searchedBoundaryPolygons.map((polygon, index) => (
                  <Polygon
                    key={`searched-${index}`}
                    paths={[polygon.outer, ...polygon.holes]}
                    options={{
                      fillColor: "#ef4444",
                      fillOpacity: 0.12,
                      strokeColor: "#dc2626",
                      strokeOpacity: 0.95,
                      strokeWeight: 2.5,
                      clickable: false,
                      zIndex: 1,
                    }}
                  />
                ))}

                {/* SAVED / SELECTED ZONE (BLUE/PURPLE) */}
                {polygons.map((polygon, index) => (
                  <Polygon
                    key={`saved-${index}-${polygonKey}`}
                    paths={polygon.map((point) => ({
                      lat: Number(point.latitude),
                      lng: Number(point.longitude),
                    }))}
                    onLoad={(poly) => handlePolygonLoad(poly, index)}
                    onUnmount={() => handlePolygonUnmount(index)}
                    onMouseUp={() => handlePolygonMouseUp(index)}
                    options={{
                      fillColor: "#6366f1",
                      fillOpacity: 0.28,
                      strokeColor: "#4f46e5",
                      strokeOpacity: 1,
                      strokeWeight: 3,
                      zIndex: 2,
                      editable: isEditable,
                      draggable: false,
                    }}
                  />
                ))}

                {/* CURRENT MANUAL POLYGON UNDER CREATION */}
                {boundary.length > 0 && (
                  <>
                    {boundary.map((point, index) => (
                      <Marker
                        key={`point-${index}`}
                        position={{
                          lat: Number(point.latitude),
                          lng: Number(point.longitude),
                        }}
                      />
                    ))}

                    {boundary.length >= 3 && (
                      <Polygon
                        paths={boundary.map((point) => ({
                          lat: Number(point.latitude),
                          lng: Number(point.longitude),
                        }))}
                        options={{
                          fillColor: "#10b981",
                          fillOpacity: 0.25,
                          strokeColor: "#059669",
                          strokeOpacity: 1,
                          strokeWeight: 2.5,
                          zIndex: 3,
                        }}
                      />
                    )}
                  </>
                )}
              </GoogleMap>

              {/* ON-MAP FLOATING RESIZE CONTROLLER */}
              {polygons.length > 0 && (
                <div className="floating-map-resize-bar">
                  <div className="resize-bar-info">
                    <span className="resize-bar-title">Zone Area</span>
                    <strong className="resize-bar-area">
                      {calculatePolygonAreaSqKm(polygons[0])} km²
                    </strong>
                  </div>

                  <div className="resize-bar-divider" />

                  <div className="resize-bar-actions">
                    <button
                      type="button"
                      className="resize-pill-btn shrink"
                      onClick={() => handleScalePolygons(0.9)}
                      title="Shrink zone size by 10%"
                    >
                      <FiMinimize2 size={13} />
                      <span>-10%</span>
                    </button>

                    <button
                      type="button"
                      className="resize-pill-btn expand"
                      onClick={() => handleScalePolygons(1.1)}
                      title="Increase / Expand zone size by 10%"
                    >
                      <FiMaximize2 size={13} />
                      <span>+10% Expand</span>
                    </button>

                    <button
                      type="button"
                      className="resize-pill-btn reset"
                      onClick={handleResetSize}
                      title="Reset to original boundary"
                    >
                      <FiRotateCcw size={13} />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      className={`resize-pill-btn toggle-handles ${
                        isEditable ? "active-pill" : ""
                      }`}
                      onClick={() => setIsEditable((prev) => !prev)}
                      title="Toggle vertex drag handles on map"
                    >
                      <FiEdit3 size={13} />
                      <span>{isEditable ? "Handles On" : "Handles Off"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FLOATING MAP TOOLBAR */}
              <div className="floating-map-tools">
                {/* HAND TOOL */}
                <button
                  type="button"
                  className={`tool-btn ${mode === "hand" ? "tool-active" : ""}`}
                  title="Pan / Hand Tool: Move and explore the map"
                  onClick={() => setMode("hand")}
                >
                  <FiMove size={18} />
                  <span className="tool-tooltip">Pan Mode</span>
                </button>

                {/* EDIT VERTICES / RESIZE HANDLES TOOL */}
                {polygons.length > 0 && (
                  <button
                    type="button"
                    className={`tool-btn ${isEditable ? "tool-active" : ""}`}
                    title="Corner Handles: Drag white points on polygon to reshape"
                    onClick={() => {
                      setIsEditable((prev) => !prev);
                      setToast({
                        type: "info",
                        message: !isEditable
                          ? "Corner handles enabled: Drag white dots to reshape boundary."
                          : "Corner handles hidden.",
                      });
                    }}
                  >
                    <FiEdit3 size={18} />
                    <span className="tool-tooltip">
                      {isEditable ? "Handles Active" : "Edit Points"}
                    </span>
                  </button>
                )}

                {/* SHAPE TOOL */}
                <button
                  type="button"
                  className={`tool-btn ${
                    mode === "polygon" ? "tool-active" : ""
                  }`}
                  title="Draw Tool: Click on the map to add boundary points"
                  onClick={enablePolygonMode}
                >
                  <FiPlus size={20} />
                  <span className="tool-tooltip">Draw Polygon</span>
                </button>

                {/* CHECK TOOL */}
                <button
                  type="button"
                  className="tool-btn finish-btn"
                  title="Finish Polygon: Close manual points and save to zone"
                  onClick={createNewPolygon}
                >
                  <FiCheck size={18} />
                  <span className="tool-tooltip">Finish Shape</span>
                </button>

                {/* TRASH TOOL */}
                <button
                  type="button"
                  className="tool-btn delete-btn"
                  title="Clear Polygons: Reset all drawn polygons and points"
                  onClick={clearPolygon}
                >
                  <FiTrash2 size={18} />
                  <span className="tool-tooltip">Clear All</span>
                </button>
              </div>
            </div>

            {/* MAP FOOTER METRICS & ACTIONS */}
            <div className="map-footer-bar">
              <div className="metrics-group">
                <div className="metric-pill">
                  <FiMapPin size={14} className="metric-icon" />
                  <span>
                    Selected Points: <strong>{boundary.length}</strong>
                  </span>
                </div>

                <div className="metric-pill">
                  <FiLayers size={14} className="metric-icon" />
                  <span>
                    Saved Polygons: <strong>{polygons.length}</strong>
                  </span>
                </div>

                {polygons.length > 0 && (
                  <div className="metric-pill area-pill">
                    <FiMaximize2 size={14} className="metric-icon" />
                    <span>
                      Area: <strong>{calculatePolygonAreaSqKm(polygons[0])} km²</strong>
                      {scalePercent !== 100 && (
                        <span className="scale-tag">({scalePercent}%)</span>
                      )}
                    </span>
                  </div>
                )}

                {searchedBoundaryPolygons.length > 0 && (
                  <div className="metric-pill boundary-pill">
                    <FiCheckCircle size={14} className="metric-icon green" />
                    <span>
                      {boundaryType === "city"
                        ? "City Boundary Active"
                        : "Area Boundary Active"}
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS (CANCEL & SAVE) */}
              <div className="form-action-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleClose}
                  disabled={isSaving}
                  title="Cancel and return to zone management"
                >
                  <FiX size={16} />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  className="btn-save-zone"
                  onClick={saveZone}
                  disabled={isSaving}
                  title={isEdit ? "Update Delivery Zone" : "Save Delivery Zone"}
                >
                  {isSaving ? (
                    <>
                      <FiRefreshCw className="zone-spin" size={16} />
                      <span>{isEdit ? "Updating..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={17} />
                      <span>{isEdit ? "Update Zone" : "Save Zone"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CreateZone.propTypes = {
  setActivePage: PropTypes.func,
};

export default CreateZone;