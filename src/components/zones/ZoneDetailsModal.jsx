import { useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { GoogleMap, Polygon } from "@react-google-maps/api";
import {
  FiX,
  FiEdit2,
  FiMapPin,
  FiLayers,
  FiMaximize2,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiUser,
  FiPower,
} from "react-icons/fi";

const detailsMapContainerStyle = {
  width: "100%",
  height: "340px",
  borderRadius: "14px",
};

const DEFAULT_CENTER = {
  lat: 17.385,
  lng: 78.4867,
};

function ZoneDetailsModal({
  isOpen,
  zone,
  onClose,
  onEdit,
  onToggleStatus,
  isLoaded = true,
}) {
  const mapRef = useRef(null);

  // Helper to check if zone is active
  const isActive = useMemo(() => {
    if (!zone) return false;
    const s = zone.status;
    if (typeof s === "string") {
      const upper = s.toUpperCase().trim();
      return upper === "ACTIVE" || upper === "Y" || upper === "TRUE";
    }
    return Boolean(s);
  }, [zone]);

  // Parse boundary coordinates into arrays of { lat, lng }
  const parsedPolygons = useMemo(() => {
    if (!zone || !zone.boundary || !Array.isArray(zone.boundary)) return [];

    const result = [];

    const extractPointsFromRing = (ring) => {
      if (!Array.isArray(ring)) return [];
      return ring
        .map((p) => {
          if (!p) return null;
          const lat = Number(p.latitude !== undefined ? p.latitude : p.lat);
          const lng = Number(p.longitude !== undefined ? p.longitude : p.lng);
          if (isNaN(lat) || isNaN(lng)) return null;
          return { lat, lng };
        })
        .filter(Boolean);
    };

    // Case 1: MultiPolygon: [[[{longitude, latitude}, ...]]]
    if (
      zone.boundary.length > 0 &&
      Array.isArray(zone.boundary[0]) &&
      Array.isArray(zone.boundary[0][0])
    ) {
      zone.boundary.forEach((poly) => {
        poly.forEach((ring) => {
          const pts = extractPointsFromRing(ring);
          if (pts.length >= 3) result.push(pts);
        });
      });
    }
    // Case 2: Polygon: [[{longitude, latitude}, ...]]
    else if (zone.boundary.length > 0 && Array.isArray(zone.boundary[0])) {
      zone.boundary.forEach((ring) => {
        const pts = extractPointsFromRing(ring);
        if (pts.length >= 3) result.push(pts);
      });
    }
    // Case 3: Ring: [{longitude, latitude}, ...]
    else if (zone.boundary.length > 0) {
      const pts = extractPointsFromRing(zone.boundary);
      if (pts.length >= 3) result.push(pts);
    }

    return result;
  }, [zone]);

  // Total vertices across all polygons
  const totalVertices = useMemo(() => {
    return parsedPolygons.reduce((acc, poly) => acc + poly.length, 0);
  }, [parsedPolygons]);

  // Calculate approximate area in km²
  const estimatedAreaKm2 = useMemo(() => {
    if (!parsedPolygons || parsedPolygons.length === 0) return "0.00";

    const RADIUS = 6378137;
    let totalAreaSqMeters = 0;

    parsedPolygons.forEach((polygon) => {
      if (polygon.length < 3) return;
      let total = 0;
      const len = polygon.length;
      for (let i = 0; i < len; i++) {
        const j = (i + 1) % len;
        const lat1 = (polygon[i].lat * Math.PI) / 180;
        const lng1 = (polygon[i].lng * Math.PI) / 180;
        const lat2 = (polygon[j].lat * Math.PI) / 180;
        const lng2 = (polygon[j].lng * Math.PI) / 180;
        total += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
      }
      totalAreaSqMeters += Math.abs((total * RADIUS * RADIUS) / 2.0);
    });

    return (totalAreaSqMeters / 1000000).toFixed(2);
  }, [parsedPolygons]);

  // Centroid
  const mapCenter = useMemo(() => {
    if (parsedPolygons.length > 0 && parsedPolygons[0].length > 0) {
      const firstPoly = parsedPolygons[0];
      const sumLat = firstPoly.reduce((acc, p) => acc + p.lat, 0);
      const sumLng = firstPoly.reduce((acc, p) => acc + p.lng, 0);
      return {
        lat: sumLat / firstPoly.length,
        lng: sumLng / firstPoly.length,
      };
    }
    return DEFAULT_CENTER;
  }, [parsedPolygons]);

  // Fit bounds when map or polygons change
  const fitMapToBounds = () => {
    if (!mapRef.current || !window.google || parsedPolygons.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    parsedPolygons.forEach((poly) => {
      poly.forEach((pt) => {
        bounds.extend({ lat: pt.lat, lng: pt.lng });
      });
    });
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  };

  useEffect(() => {
    if (isOpen && mapRef.current) {
      setTimeout(fitMapToBounds, 250);
    }
  }, [isOpen, parsedPolygons]);

  if (!isOpen || !zone) return null;

  return (
    <div className="zone-modal-backdrop" onClick={onClose}>
      <div
        className="zone-modal-card details-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-details-title"
      >
        {/* HEADER */}
        <div className="details-modal-header">
          <div className="details-modal-title-group">
            <div className="details-modal-avatar">
              <FiMapPin size={22} />
            </div>
            <div>
              <div className="details-modal-breadcrumbs">
                <span>Delivery Zones</span> / <span>Zone Details</span>
              </div>
              <div className="details-modal-name-row">
                <h2 id="zone-details-title">
                  {zone.zoneName || "Unnamed Delivery Zone"}
                </h2>
                <span className="zone-id-tag-pill">ID #{zone.zoneId}</span>
                <span
                  className={`zone-status-badge ${
                    isActive ? "active" : "inactive"
                  }`}
                >
                  <span className="zone-badge-dot" />
                  {isActive ? "Active Zone" : "Inactive Zone"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="zone-modal-close"
            onClick={onClose}
            aria-label="Close details"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="details-modal-body">
          {/* STATS OVERVIEW CARDS */}
          <div className="details-stats-grid">
            <div className="details-stat-card">
              <div className="details-stat-icon purple">
                <FiMaximize2 size={16} />
              </div>
              <div>
                <span className="details-stat-label">Coverage Area</span>
                <strong>{estimatedAreaKm2} km²</strong>
              </div>
            </div>

            <div className="details-stat-card">
              <div className="details-stat-icon blue">
                <FiLayers size={16} />
              </div>
              <div>
                <span className="details-stat-label">Polygons</span>
                <strong>{parsedPolygons.length || 1} Area(s)</strong>
              </div>
            </div>

            <div className="details-stat-card">
              <div className="details-stat-icon emerald">
                <FiMapPin size={16} />
              </div>
              <div>
                <span className="details-stat-label">Boundary Vertices</span>
                <strong>{totalVertices} Points</strong>
              </div>
            </div>

            <div className="details-stat-card">
              <div
                className={`details-stat-icon ${
                  isActive ? "green" : "amber"
                }`}
              >
                {isActive ? (
                  <FiCheckCircle size={16} />
                ) : (
                  <FiAlertCircle size={16} />
                )}
              </div>
              <div>
                <span className="details-stat-label">Current Status</span>
                <strong style={{ color: isActive ? "#16a34a" : "#d97706" }}>
                  {isActive ? "Taking Orders" : "Service Paused"}
                </strong>
              </div>
            </div>
          </div>

          {/* NON-EDITABLE MAP VIEW */}
          <div className="details-map-section">
            <div className="details-map-header">
              <span className="details-map-title">
                Geographic MultiPolygon Boundary (Read-Only)
              </span>
              <span className="details-map-badge">WGS84 EPSG:4326</span>
            </div>

            <div className="details-map-container">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={detailsMapContainerStyle}
                  center={mapCenter}
                  zoom={12}
                  onLoad={(map) => {
                    mapRef.current = map;
                    setTimeout(fitMapToBounds, 200);
                  }}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    draggable: true,
                    zoomControl: true,
                    scrollwheel: true,
                    disableDefaultUI: false,
                  }}
                >
                  {parsedPolygons.map((poly, idx) => (
                    <Polygon
                      key={`details-poly-${idx}`}
                      paths={poly}
                      options={{
                        fillColor: isActive ? "#6366f1" : "#94a3b8",
                        fillOpacity: 0.28,
                        strokeColor: isActive ? "#4f46e5" : "#64748b",
                        strokeOpacity: 1,
                        strokeWeight: 2.8,
                        editable: false,
                        draggable: false,
                        zIndex: 2,
                      }}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="details-map-placeholder">
                  <FiMapPin size={32} />
                  <p>Loading Map Viewport...</p>
                </div>
              )}
            </div>
          </div>

          {/* METADATA STRIP */}
          <div className="details-meta-footer">
            {zone.createdAt && (
              <div className="meta-item">
                <FiCalendar size={13} />
                <span>Created: <strong>{zone.createdAt}</strong></span>
              </div>
            )}
            {zone.createdBy && (
              <div className="meta-item">
                <FiUser size={13} />
                <span>Created By: <strong>Admin #{zone.createdBy}</strong></span>
              </div>
            )}
            {zone.updatedAt && (
              <div className="meta-item">
                <FiCalendar size={13} />
                <span>Updated: <strong>{zone.updatedAt}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="details-modal-footer">
          <div className="details-footer-left">
            <button
              type="button"
              className={`details-status-btn ${
                isActive ? "btn-deactivate" : "btn-activate"
              }`}
              onClick={() => {
                onClose();
                onToggleStatus(zone);
              }}
              title={isActive ? "Deactivate this zone" : "Activate this zone"}
            >
              <FiPower size={15} />
              <span>{isActive ? "Deactivate Zone" : "Activate Zone"}</span>
            </button>
          </div>

          <div className="details-footer-right">
            <button
              type="button"
              className="details-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="details-btn-primary"
              onClick={() => {
                onClose();
                onEdit(zone);
              }}
              title="Edit zone boundary and name"
            >
              <FiEdit2 size={15} />
              <span>Edit Zone</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ZoneDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  zone: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool,
};

export default ZoneDetailsModal;
