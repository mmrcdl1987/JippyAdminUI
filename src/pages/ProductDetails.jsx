import { useState } from "react";
import { getProductDetailById } from "../services/productDetailService";
import "../styles/ProductDetails.css";

function ProductDetails() {
  // ─── State ─────────────────────────────────────────────────
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isIdValid = productId !== "" && !isNaN(productId) && Number(productId) > 0;

  // ─── Fetch Product Detail ─────────────────────────────────
  const handleFetch = async () => {
    if (!isIdValid) {
      setError("Please enter a valid Product ID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProduct(null);

      console.log("[PRODUCT-DETAIL] Fetching product:", productId);

      const data = await getProductDetailById(Number(productId));

      console.log("[PRODUCT-DETAIL] Received:", data);

      setProduct(data);
    } catch (err) {
      console.error("[PRODUCT-DETAIL] Error:", err);

      const status = err?.response?.status;
      if (status === 404) {
        setError(`Product with ID ${productId} was not found.`);
      } else {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch product details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Enter key handler ────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isIdValid && !loading) {
      handleFetch();
    }
  };

  // ─── Check if imageLink is a real URL ─────────────────────
  const isImageUrl = (link) => {
    if (!link) return false;
    try {
      const url = new URL(link);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(link);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="product-detail-page">

      {/* HEADER */}
      <div className="pd-header">
        <p className="pd-tag">PRODUCT CATALOGUE</p>
        <h1>
          Product
          <span> Details</span>
        </h1>
      </div>

      {/* SEARCH CARD */}
      <div className="pd-search-card">
        <h2>🔍 Lookup Product</h2>
        <p className="card-hint">
          Enter a product ID and click Fetch to load its full details.
        </p>

        <div className="pd-input-group">
          <input
            type="number"
            className="pd-id-input"
            placeholder="Enter Product ID"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            min="1"
            disabled={loading}
          />

          <button
            type="button"
            className="pd-fetch-btn"
            onClick={handleFetch}
            disabled={!isIdValid || loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Fetching...
              </>
            ) : (
              "🔎 Fetch Details"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="pd-error">
            <span>❌ {error}</span>
          </div>
        )}
      </div>

      {/* PRODUCT DETAIL CARD */}
      {product && (
        <>
          <div className="pd-product-card">

            {/* Product Banner */}
            <div className="pd-product-banner">

              {/* Image or placeholder */}
              {isImageUrl(product.imageLink) ? (
                <img
                  className="pd-product-image"
                  src={product.imageLink}
                  alt={product.productName}
                />
              ) : (
                <div className="pd-product-image-placeholder">
                  <span className="placeholder-icon">🍽️</span>
                  <span>No Image</span>
                </div>
              )}

              {/* Product Info */}
              <div className="pd-product-info">
                <h2>{product.productName || "Unnamed Product"}</h2>
                <p className="pd-product-id-label">
                  Product ID: #{product.productId}
                </p>

                <div className="pd-meta-grid">
                  <div className="pd-meta-item">
                    <p className="meta-label">Merchant Price</p>
                    <p className="meta-value price">
                      ₹{product.merchantPrice ?? "—"}
                    </p>
                  </div>

                  <div className="pd-meta-item">
                    <p className="meta-label">Has Variants</p>
                    <p
                      className={`meta-value ${
                        product.hasProductVariants
                          ? "has-variants"
                          : "no-variants"
                      }`}
                    >
                      {product.hasProductVariants ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="pd-meta-item">
                    <p className="meta-label">Variant Groups</p>
                    <p className="meta-value has-variants">
                      {product.variantGroups?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image link / description */}
            {product.imageLink && !isImageUrl(product.imageLink) && (
              <div className="pd-image-link-section">
                <p className="pd-image-link-label">Image Link / Description</p>
                <p className="pd-image-link-text">{product.imageLink}</p>
              </div>
            )}
          </div>

          {/* VARIANT GROUPS */}
          <div className="pd-variants-section">

            <div className="pd-variants-header">
              <h3>🧩 Variant Groups</h3>
              <span className="pd-variants-count">
                {product.variantGroups?.length || 0} group
                {(product.variantGroups?.length || 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {/* No variants */}
            {(!product.variantGroups ||
              product.variantGroups.length === 0) && (
              <div className="pd-no-variants">
                <div className="empty-icon">📭</div>
                <p>No variant groups configured for this product.</p>
              </div>
            )}

            {/* Variant Group Cards */}
            {product.variantGroups &&
              product.variantGroups.map((group) => (
                <div
                  className="pd-variant-group"
                  key={group.productVariantGroupsId}
                >
                  {/* Group Header */}
                  <div className="pd-vg-header">
                    <div className="pd-vg-header-left">
                      <div className="pd-vg-icon">🏷️</div>
                      <div>
                        <p className="pd-vg-name">
                          {group.groupName || "Unnamed Group"}
                        </p>
                        <p className="pd-vg-id">
                          Group ID: {group.productVariantGroupsId}
                        </p>
                      </div>
                    </div>
                    <span className="pd-vg-option-count">
                      {group.options?.length || 0} option
                      {(group.options?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Options Table */}
                  {group.options && group.options.length > 0 && (
                    <table className="pd-options-table">
                      <thead>
                        <tr>
                          <th>Variant Name</th>
                          <th>Price Type</th>
                          <th>Variant Price</th>
                          <th>IDs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.options.map((opt) => (
                          <tr key={opt.productVariantOptionsId}>
                            <td className="pd-option-name">
                              {opt.variantName || "—"}
                            </td>
                            <td>
                              {opt.priceType ? (
                                <span className="pd-price-type-chip">
                                  {opt.priceType}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="pd-variant-price">
                              {opt.variantPrice !== null &&
                              opt.variantPrice !== undefined
                                ? `₹${opt.variantPrice}`
                                : "—"}
                            </td>
                            <td className="pd-option-ids">
                              Option: {opt.productVariantOptionsId} ·
                              Value: {opt.productVariantGroupValuesId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductDetails;
