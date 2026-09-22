import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiCheck,
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiRotateCcw,
} from "react-icons/fi";

function CoordinatePreview({
  polygons = [],
  activeDrawingPoints = [],
  onClear,
  onReset,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Normalize all points into rings
  const normalizedPolygons = useMemo(() => {
    const list = [];

    // Saved polygons
    polygons.forEach((poly, polyIdx) => {
      let ring = [];
      if (Array.isArray(poly)) {
        ring = poly.map((pt) => ({
          longitude: Number(pt.longitude !== undefined ? pt.longitude : pt.lng),
          latitude: Number(pt.latitude !== undefined ? pt.latitude : pt.lat),
        }));
      }
      list.push({
        name: `Polygon #${polyIdx + 1}`,
        points: ring,
        isDraft: false,
      });
    });

    // Active in-progress drawing points
    if (activeDrawingPoints && activeDrawingPoints.length > 0) {
      list.push({
        name: "Active Drawing (In-Progress)",
        points: activeDrawingPoints.map((pt) => ({
          longitude: Number(pt.longitude !== undefined ? pt.longitude : pt.lng),
          latitude: Number(pt.latitude !== undefined ? pt.latitude : pt.lat),
        })),
        isDraft: true,
      });
    }

    return list;
  }, [polygons, activeDrawingPoints]);

  // Overall totals
  const totalPoints = useMemo(() => {
    return normalizedPolygons.reduce((acc, p) => acc + p.points.length, 0);
  }, [normalizedPolygons]);

  // Copy standard MultiPolygon JSON
  const handleCopyJson = () => {
    const multiPolygon = polygons.map((poly) => {
      const ring = poly.map((pt) => ({
        longitude: Number(Number(pt.longitude !== undefined ? pt.longitude : pt.lng).toFixed(6)),
        latitude: Number(Number(pt.latitude !== undefined ? pt.latitude : pt.lat).toFixed(6)),
      }));

      // Ensure ring closure for payload
      if (ring.length >= 3) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first.longitude !== last.longitude || first.latitude !== last.latitude) {
          ring.push({ longitude: first.longitude, latitude: first.latitude });
        }
      }

      return [ring];
    });

    navigator.clipboard.writeText(JSON.stringify(multiPolygon, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="coordinate-preview-card">
      <div
        className="coordinate-preview-header"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="coordinate-header-left">
          <div className="coordinate-icon-badge">
            <FiLayers size={16} />
          </div>
          <div>
            <div className="coordinate-header-title-row">
              <h4>Coordinate & Boundary Preview</h4>
              <span className="coord-count-pill">
                {totalPoints} {totalPoints === 1 ? "Vertex" : "Vertices"}
              </span>
            </div>
            <small className="coordinate-header-hint">
              EPSG:4326 • Longitude (X) first, Latitude (Y) second
            </small>
          </div>
        </div>

        <div className="coordinate-header-actions" onClick={(e) => e.stopPropagation()}>
          {totalPoints > 0 && (
            <button
              type="button"
              className="coord-action-btn"
              onClick={handleCopyJson}
              title="Copy MultiPolygon JSON"
            >
              {copied ? <FiCheck size={13} color="#16a34a" /> : <FiCopy size={13} />}
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>
          )}

          {typeof onReset === "function" && polygons.length > 0 && (
            <button
              type="button"
              className="coord-action-btn"
              onClick={onReset}
              title="Reset size to original"
            >
              <FiRotateCcw size={13} />
            </button>
          )}

          {typeof onClear === "function" && totalPoints > 0 && (
            <button
              type="button"
              className="coord-action-btn danger"
              onClick={onClear}
              title="Clear all points"
            >
              <FiTrash2 size={13} />
            </button>
          )}

          <button
            type="button"
            className="coord-collapse-btn"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Expand preview" : "Collapse preview"}
          >
            {isCollapsed ? <FiChevronDown size={17} /> : <FiChevronUp size={17} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="coordinate-preview-body">
          {normalizedPolygons.length === 0 ? (
            <div className="coord-empty-state">
              <FiLayers size={24} />
              <p>No boundary coordinates drawn yet.</p>
              <small>
                Search an area or click the ➕ Draw tool on the map to place vertices.
              </small>
            </div>
          ) : (
            normalizedPolygons.map((poly, polyIdx) => {
              const pts = poly.points;
              const hasAtLeast3 = pts.length >= 3;
              const isClosed =
                hasAtLeast3 &&
                pts[0].longitude === pts[pts.length - 1].longitude &&
                pts[0].latitude === pts[pts.length - 1].latitude;

              return (
                <div
                  key={`coord-poly-${polyIdx}`}
                  className={`coord-polygon-group ${poly.isDraft ? "draft" : ""}`}
                >
                  <div className="coord-polygon-header">
                    <span className="coord-poly-name">
                      {poly.name} ({pts.length} pts)
                    </span>

                    <span
                      className={`coord-closure-badge ${
                        isClosed ? "closed" : "open"
                      }`}
                    >
                      {isClosed ? (
                        <>
                          <FiCheckCircle size={12} />
                          <span>Closed Ring (4+ coords)</span>
                        </>
                      ) : (
                        <>
                          <FiAlertCircle size={12} />
                          <span>
                            {poly.isDraft ? "In-Progress (Open)" : "Auto-Closes on Save"}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="coord-table-scroll">
                    <table className="coord-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Longitude (lng)</th>
                          <th>Latitude (lat)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pts.map((pt, ptIdx) => {
                          const isFirst = ptIdx === 0;
                          const isLast = ptIdx === pts.length - 1 && pts.length > 1;
                          const isClosingVertex = isLast && isClosed;

                          return (
                            <tr
                              key={`pt-${ptIdx}`}
                              className={
                                isClosingVertex
                                  ? "row-closing"
                                  : isFirst
                                  ? "row-first"
                                  : ""
                              }
                            >
                              <td className="coord-cell-idx">#{ptIdx + 1}</td>
                              <td className="coord-cell-val">
                                {Number(pt.longitude).toFixed(6)}
                              </td>
                              <td className="coord-cell-val">
                                {Number(pt.latitude).toFixed(6)}
                              </td>
                              <td className="coord-cell-tag">
                                {isFirst && (
                                  <span className="coord-tag start">First</span>
                                )}
                                {isClosingVertex && (
                                  <span className="coord-tag close">Closing</span>
                                )}
                                {!isFirst && !isClosingVertex && (
                                  <span className="coord-tag">Vertex</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

CoordinatePreview.propTypes = {
  polygons: PropTypes.array,
  activeDrawingPoints: PropTypes.array,
  onClear: PropTypes.func,
  onReset: PropTypes.func,
};

export default CoordinatePreview;
