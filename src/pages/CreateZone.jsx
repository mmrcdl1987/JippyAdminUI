import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polygon,
  Autocomplete,
} from "@react-google-maps/api";

import API from "../services/api";
import "../styles/CreateZone.css";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "600px",
};

function CreateZone() {
  const [zoneName, setZoneName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [center, setCenter] = useState(null);
  const [boundary, setBoundary] = useState([]);
  const [mode, setMode] = useState("hand");
  const [isEdit, setIsEdit] = useState(false);
const [zoneId, setZoneId] = useState(null);
 const [polygons, setPolygons] = useState([]);

  const mapRef = useRef(null);
  const autoCompleteRef = useRef(null);

  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setCenter({
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude,
  //       });
  //     },
  //     () => {
  //       setCenter({
  //         lat: 17.385,
  //         lng: 78.4867,
  //       });
  //     }
  //   );
  // }, []);

  useEffect(() => {

  const editZoneId =
    localStorage.getItem("editZoneId");

  if (editZoneId) {
    setIsEdit(true);
    loadZoneById(editZoneId);
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    () => {
      setCenter({
        lat: 17.385,
        lng: 78.4867,
      });
    }
  );

}, []);
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // const onPlaceChanged = () => {
  //   const place = autoCompleteRef.current.getPlace();

  //   if (
  //     place &&
  //     place.geometry &&
  //     place.geometry.location
  //   ) {
  //     const location = {
  //       lat: place.geometry.location.lat(),
  //       lng: place.geometry.location.lng(),
  //     };

  //     setCenter(location);

  //     mapRef.current.panTo(location);
  //     mapRef.current.setZoom(15);
  //   }
  // };

//   const onPlaceChanged = async () => {

//   const place =
//     autoCompleteRef.current.getPlace();

//   if (
//     place &&
//     place.geometry &&
//     place.geometry.location
//   ) {

//     const location = {
//       lat: place.geometry.location.lat(),
//       lng: place.geometry.location.lng(),
//     };

//     setCenter(location);

//     mapRef.current.panTo(location);

//     mapRef.current.setZoom(15);

//     const areaName =
//       place.name;

//     console.log(
//       "Selected Area : ",
//       areaName
//     );

//     try {

//       const query = `
//       [out:json];
//       (
//         relation["name"="${areaName}"];
//       );
//       out geom;
//       `;

//       const response =
//         await fetch(
//           "https://overpass-api.de/api/interpreter",
//           {
//             method: "POST",
//             body: query,
//           }
//         );

//       const data =
//         await response.json();

//       console.log(
//         "Overpass Response : ",
//         data
//       );

//       if (
//         data.elements &&
//         data.elements.length > 0
//       ) {

//         const relation =
//           data.elements[0];

//         const coordinates =
//           relation.members
//             ?.filter(
//               (member) =>
//                 member.geometry
//             )
//             .flatMap(
//               (member) =>
//                 member.geometry.map(
//                   (point) => ({
//                     latitude:
//                       point.lat,
//                     longitude:
//                       point.lon,
//                   })
//                 )
//             );

//         if (
//           coordinates &&
//           coordinates.length > 3
//         ) {

//           setBoundary(
//             coordinates
//           );

//           console.log(
//             "Boundary Loaded : ",
//             coordinates.length
//           );
//         }
//       }

//     } catch (error) {

//       console.error(
//         "Boundary Error : ",
//         error
//       );
//     }
//   }
// };


const onPlaceChanged = async () => {

  const place = autoCompleteRef.current.getPlace();

  if (
    !place ||
    !place.geometry ||
    !place.geometry.location
  ) {
    return;
  }

  const location = {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
  };

  setCenter(location);

  mapRef.current.panTo(location);
  mapRef.current.setZoom(14);

  const areaName = place.name;

  console.log("Selected Area:", areaName);

  try {

    const query = `
      [out:json];
      (
        relation["name"="${areaName}"];
      );
      out geom;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    const data = await response.json();

    console.log("Boundary Response:", data);

    if (
      data.elements &&
      data.elements.length > 0
    ) {

      const relation = data.elements[0];

      const polygonPoints = [];

      relation.members?.forEach((member) => {

        if (member.geometry) {

          member.geometry.forEach((point) => {

            polygonPoints.push({
              lat: point.lat,
              lng: point.lon,
            });

          });

        }

      });

      console.log(
        "Polygon Points:",
        polygonPoints.length
      );

      setBoundary(
  polygonPoints.map(
    (point) => ({
      latitude: point.lat,
      longitude: point.lng,
    })
  )
);
    }

  } catch (error) {

    console.error(
      "Boundary Fetch Error:",
      error
    );
  }
};
  // const handleMapClick = (event) => {
  //   if (mode !== "polygon") return;

  //   const point = {
  //     latitude: event.latLng.lat(),
  //     longitude: event.latLng.lng(),
  //   };

  //   setBoundary((prev) => [...prev, point]);
  // };

const handleMapClick = (event) => {

  console.log("Current Mode :", mode);

  if (mode !== "polygon") {
    return;
  }

  const point = {
    latitude: event.latLng.lat(),
    longitude: event.latLng.lng(),
  };

  console.log("Point Added :", point);

  setBoundary((prev) => [
    ...prev,
    point,
  ]);
};
  const enablePolygonMode = () => {

  setMode("polygon");

  console.log(
    "Polygon Mode Enabled"
  );
};

const createNewPolygon = () => {

  if (boundary.length < 3) {
    alert("Minimum 3 points required");
    return;
  }

  const closedBoundary = [...boundary];

  closedBoundary.push({
    latitude: boundary[0].latitude,
    longitude: boundary[0].longitude,
  });

  setPolygons(prev => [
    ...prev,
    closedBoundary
  ]);

  setBoundary([]);

  setMode("hand");

  console.log(
    "Polygon Saved",
    closedBoundary
  );
};
  const clearPolygon = () => {

  setBoundary([]);

  setPolygons([]);

  console.log(
    "All Polygons Cleared"
  );
};  
  // lode by id 
const loadZoneById = async (id) => {

  try {

   const response =
  await API.get(
    `/api/driver/getZoneById/${id}`
  );
    const zone = response.data;

    setZoneId(zone.zoneId);
    setZoneName(zone.zoneName);
    setCreatedBy(zone.createdBy);
    setBoundary(zone.boundary || []);

  } catch (error) {

    console.error(
      "Error loading zone",
      error
    );
  }
};
   
const saveZone = async () => {
  if (!zoneName.trim()) {
    alert("Enter Zone Name");
    return;
  }

  if (!createdBy) {
    alert("Enter Created By");
    return;
  }

  if (boundary.length < 3) {
    alert("Minimum 3 points required");
    return;
  }

  // const closedBoundary = [...boundary];

  // closedBoundary.push({
  //   latitude: boundary[0].latitude,
  //   longitude: boundary[0].longitude,
  // });

  // const payload = {
  //   zoneName,
  //   createdBy: Number(createdBy),
  //   boundary: closedBoundary,
  // };
//   const allPolygons = [...polygons];

// if (boundary.length >= 3) {

//   const closedBoundary = [...boundary];

//   closedBoundary.push({
//     latitude: boundary[0].latitude,
//     longitude: boundary[0].longitude,
//   });

//   allPolygons.push(closedBoundary);
// }

// const payload = {
//   zoneName,
//   createdBy: Number(createdBy),

//   boundary: allPolygons.map(
//     (polygon) => [polygon]
//   ),
// };

// console.log(
//   "Final Payload:",
//   JSON.stringify(payload, null, 2)
// );
const allPolygons = [...polygons];

if (boundary.length >= 3) {

  const closedBoundary = [...boundary];

  closedBoundary.push({
    latitude: boundary[0].latitude,
    longitude: boundary[0].longitude,
  });

  allPolygons.push(closedBoundary);
}

if (allPolygons.length === 0) {
  alert("Create at least one polygon");
  return;
}

const payload = {
  zoneName,
  boundary: allPolygons.map((polygon) => [polygon]),
 
};

console.log(
  "Final Payload",
  JSON.stringify(payload, null, 2)
);

  console.log("Final Payload:", payload);

  try {

    let response;

    if (isEdit) {

    response = await API.put(
  `/api/driver/updateZone/${zoneId}`,
  payload
);

      console.log(response.data);

      alert("Zone Updated Successfully");

    } else {
response = await API.post(
  "/api/driver/createZones",
  payload
);

      console.log(response.data);

      alert("Zone Created Successfully");
    }

    setZoneName("");
    setCreatedBy("");
    setBoundary([]);

    localStorage.removeItem("editZoneId");

  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      "Error Creating Zone"
    );
  }
};

  if (!center) {
    return <h2>Loading Map...</h2>;
  }

  return (
    <div className="create-zone-container">
      <div className="create-zone-card">

        <h2 className="create-zone-title">
  {isEdit
    ? "Edit Zone"
    : "Create Zone"}
</h2>

        <div className="form-group">
          <label>Zone Name</label>

          <input
            type="text"
            value={zoneName}
            placeholder="Enter Zone Name"
            onChange={(e) =>
              setZoneName(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Created By</label>

          <input
            type="number"
            value={createdBy}
            placeholder="Enter User Id"
            onChange={(e) =>
              setCreatedBy(e.target.value)
            }
          />
        </div>

        {/* Instructions */}

        <div className="instructions-section">
          <h3>Instructions</h3>

          <p>
            Allow users to define the
            boundary of the business zone
            interactively on the map by
            clicking to add points.
          </p>

          <div className="instruction-item">
            <div className="tool-icon">
              🖐
            </div>

            <span>
              Use the Hand Tool to drag
              the map and select your
              desired location.
            </span>
          </div>

          <div className="instruction-item">
            <div className="tool-icon">
              ➕
            </div>

            <span>
              Use the Shape Tool to
              highlight areas and connect
              points. Minimum 3 points
              required.
            </span>
          </div>

          <div className="instruction-item">
            <div className="tool-icon">
              🗑
            </div>

            <span>
              Use the Trash Tool to remove
              the selected area.
            </span>
          </div>
        </div>

        <LoadScript
          googleMapsApiKey={
            import.meta.env
              .VITE_GOOGLE_MAPS_API_KEY
          }
          libraries={libraries}
        >
          <Autocomplete
            onLoad={(auto) =>
              (autoCompleteRef.current =
                auto)
            }
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Search Location"
              className="location-search"
            />
          </Autocomplete>

          <div
            style={{
              position: "relative",
            }}
          >
            <GoogleMap
              mapContainerStyle={
                mapContainerStyle
              }
              center={center}
              zoom={14}
              onLoad={onMapLoad}
              onClick={handleMapClick}
            >
              {polygons.map(
  (polygon, index) => (
    <Polygon
      key={index}
      paths={polygon.map(
        (point) => ({
          lat: point.latitude,
          lng: point.longitude,
        })
      )}
      options={{
        fillColor: "#4285F4",
        fillOpacity: 0.4,
        strokeColor: "#4285F4",
        strokeWeight: 3,
      }}
    />
  )
)}
              {boundary.map(
                (point, index) => (
                  <Marker
                    key={index}
                    position={{
                      lat: point.latitude,
                      lng: point.longitude,
                    }}
                  />
                )
              )}

              {boundary.length >= 3 && (
                <Polygon
                  paths={boundary.map(
                    (point) => ({
                      lat: point.latitude,
                      lng: point.longitude,
                    })
                  )}
                  options={{
                    fillColor:
                      "#4285F4",
                    fillOpacity: 0.4,
                    strokeColor:
                      "#4285F4",
                    strokeWeight: 3,
                  }}
                />
              )}
            </GoogleMap>

            <div className="map-tools">

  <button
    type="button"
    onClick={() =>
      setMode("hand")
    }
  >
    🖐
  </button>

  <button
    type="button"
    onClick={enablePolygonMode}
  >
    ➕
  </button>

  <button
    type="button"
    onClick={createNewPolygon}
  >
    ✔
  </button>

  <button
    type="button"
    onClick={clearPolygon}
  >
    🗑
  </button>

</div>
          </div>
        </LoadScript>

        <div className="coordinate-count">
          Selected Points :
          {boundary.length}
        </div>

        <button
  className="save-btn"
  onClick={saveZone}
>
  {isEdit
    ? "Update Zone"
    : "Save Zone"}
</button>

      </div>
    </div>
  );
}

export default CreateZone;