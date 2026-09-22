import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiLoader,
  FiCheck,
  FiUser,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiRefreshCw,
} from "react-icons/fi";

import "../styles/DriverDetails.css";

import {
  getDriverById,
  getTotalDriverEarnings,
  getDriverIncentiveHistory,
  getDriverIncentiveHistoryPage,
} from "../services/driverService";

import {
  getStates,
  getCitiesByState,
  getAreasByCity,
  getAllAreas,
} from "../services/managerAreaService";



function DriverDetails({ setActivePage }) {

  /* =========================================================
     DRIVER
     ========================================================= */

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  /* =========================================================
     TAB
     ========================================================= */

  const [activeTab, setActiveTab] =
    useState("details");


  /* =========================================================
     EARNINGS
     ========================================================= */

  const [earningsData, setEarningsData] =
    useState(null);

  const [earningsLoading, setEarningsLoading] =
    useState(false);

  const [earningsError, setEarningsError] =
    useState("");


  /* =========================================================
     OLD INCENTIVES
     ========================================================= */

  const [incentiveData, setIncentiveData] =
    useState(null);

  const [incentiveLoading, setIncentiveLoading] =
    useState(false);

  const [incentiveError, setIncentiveError] =
    useState("");

  const [incentiveFilter, setIncentiveFilter] =
    useState("ALL");

  const [incentivePage, setIncentivePage] =
    useState(0);

  const incentiveSize = 10;


  /* =========================================================
     SEPARATE INCENTIVE HISTORY
     ========================================================= */

  const [
    incentiveHistoryData,
    setIncentiveHistoryData,
  ] = useState(null);

  const [
    incentiveHistoryLoading,
    setIncentiveHistoryLoading,
  ] = useState(false);

  const [
    incentiveHistoryError,
    setIncentiveHistoryError,
  ] = useState("");

  const [
    incentiveHistoryFilter,
    setIncentiveHistoryFilter,
  ] = useState("ALL");

  const [
    incentiveHistoryStartDate,
    setIncentiveHistoryStartDate,
  ] = useState("");

  const [
    incentiveHistoryEndDate,
    setIncentiveHistoryEndDate,
  ] = useState("");

  const [
    incentiveHistoryPage,
    setIncentiveHistoryPage,
  ] = useState(0);

  const incentiveHistorySize = 20;


  /* =========================================================
     LOCATION RESOLUTION (Names instead of IDs)
     ========================================================= */

  const [resolvedLocation, setResolvedLocation] = useState({
    stateName: "",
    cityName: "",
    areaName: "",
  });

  useEffect(() => {
    let isMounted = true;

    const resolveLocation = async () => {
      if (!details) return;

      let sName = details.stateName || details.state || "";
      let cName = details.cityName || details.city || "";
      let aName = details.areaName || details.area || "";

      // 1. Resolve State Name if missing
      if (!sName && details.stateId) {
        try {
          const res = await getStates();
          const list = Array.isArray(res) ? res : res?.data || res?.content || [];
          const match = list.find(
            (s) => String(s.stateId || s.id) === String(details.stateId)
          );
          if (match) {
            sName = match.stateName || match.name || "";
          }
        } catch (err) {
          console.warn("Could not resolve state name:", err);
        }
      }

      // 2. Resolve City Name if missing
      if (!cName && details.cityId) {
        try {
          let list = [];
          if (details.stateId) {
            const res = await getCitiesByState(details.stateId);
            list = Array.isArray(res) ? res : res?.data || res?.content || [];
          }
          let match = list.find(
            (c) => String(c.cityId || c.id || c.city_id) === String(details.cityId)
          );
          if (match) {
            cName = match.cityName || match.name || match.city_name || "";
          }
        } catch (err) {
          console.warn("Could not resolve city name:", err);
        }
      }

      // 3. Resolve Area Name if missing
      if (!aName && details.areaId) {
        try {
          let list = [];
          if (details.cityId) {
            const res = await getAreasByCity(details.cityId);
            list = Array.isArray(res) ? res : res?.data || res?.content || [];
          }
          if (!list.length) {
            const res = await getAllAreas();
            list = Array.isArray(res) ? res : res?.data || res?.content || [];
          }
          const match = list.find(
            (a) => String(a.areaId || a.id) === String(details.areaId)
          );
          if (match) {
            aName = match.areaName || match.name || "";
          }
        } catch (err) {
          console.warn("Could not resolve area name:", err);
        }
      }

      if (isMounted) {
        setResolvedLocation({
          stateName: sName,
          cityName: cName,
          areaName: aName,
        });
      }
    };

    resolveLocation();

    return () => {
      isMounted = false;
    };
  }, [
    details?.stateId,
    details?.cityId,
    details?.areaId,
    details?.stateName,
    details?.cityName,
    details?.areaName,
  ]);


  /* =========================================================
     CLIPBOARD COPY & REFRESH
     ========================================================= */

  const [copiedField, setCopiedField] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const copyToClipboard = (text, fieldName) => {
    if (!text || text === "-") return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleRefresh = async () => {
    const driverId = details?.driverId || details?.id;
    if (!driverId) return;

    try {
      setRefreshing(true);
      const response = await getDriverById(driverId);
      setDetails((prev) => ({
        ...(prev || {}),
        ...(response || {}),
      }));
    } catch (err) {
      console.error("Refresh driver error:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };


  /* =========================================================
     TABS (Activity & Incentives Removed)
     ========================================================= */

  const tabs = [
    {
      id: "details",
      label: "Driver Details",
      icon: FiUser,
    },
    {
      id: "orders",
      label: "Orders",
      icon: FiShoppingBag,
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: FiDollarSign,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: FiCalendar,
    },
    {
      id: "documents",
      label: "Documents",
      icon: FiFileText,
    },
    {
      id: "payments",
      label: "Payments",
      icon: FiCreditCard,
    },
  ];



  /* =========================================================
     LOAD DRIVER
     ========================================================= */

  useEffect(() => {
    const loadDriver = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        let storedDriver =
          sessionStorage.getItem("selectedDriver");

        if (!storedDriver) {
          storedDriver =
            localStorage.getItem("selectedDriver");
        }

        if (!storedDriver) {
          setErrorMessage(
            "No driver was selected."
          );

          return;
        }

        let driver;

        try {
          driver = JSON.parse(
            storedDriver
          );
        } catch {
          setErrorMessage(
            "Invalid driver information."
          );

          return;
        }

        const driverId =
          driver?.driverId ||
          driver?.id;

        if (!driverId) {
          setDetails(driver);
          return;
        }

        try {
          const response =
            await getDriverById(
              driverId
            );

          setDetails({
            ...driver,
            ...(response || {}),
          });

        } catch (error) {
          console.error(
            "Driver details API error:",
            error
          );

          setDetails(driver);

          setErrorMessage(
            "Unable to load additional driver details."
          );
        }

      } catch (error) {
        console.error(
          "Load driver error:",
          error
        );

        setErrorMessage(
          "Failed to load driver details."
        );

      } finally {
        setLoading(false);
      }
    };

    loadDriver();
  }, []);


  /* =========================================================
     LOAD EARNINGS ONLY WHEN EARNINGS TAB IS CLICKED
     ========================================================= */

  useEffect(() => {
    if (
      activeTab !== "earnings" ||
      !details
    ) {
      return;
    }

    const loadEarnings = async () => {
      const driverId =
        details?.driverId ||
        details?.id;

      if (!driverId) {
        setEarningsError(
          "Driver ID not found."
        );

        return;
      }

      try {
        setEarningsLoading(true);
        setEarningsError("");

        const response =
          await getTotalDriverEarnings(
            driverId
          );

        console.log(
          "Earnings response:",
          response
        );

        setEarningsData(
          response
        );

      } catch (error) {
        console.error(
          "Earnings API error:",
          error
        );

        setEarningsData(null);

        setEarningsError(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load driver earnings."
        );

      } finally {
        setEarningsLoading(false);
      }
    };

    loadEarnings();
  }, [
    activeTab,
    details,
  ]);


  /* =========================================================
     LOAD OLD INCENTIVES API
     ========================================================= */

  useEffect(() => {
    if (
      activeTab !== "incentives" ||
      !details
    ) {
      return;
    }

    const loadIncentives = async () => {
      const driverId =
        details?.driverId ||
        details?.id;

      if (!driverId) {
        setIncentiveError(
          "Driver ID not found."
        );

        return;
      }

      try {
        setIncentiveLoading(true);
        setIncentiveError("");

        const response =
          await getDriverIncentiveHistory(
            driverId,
            incentiveFilter,
            incentivePage,
            incentiveSize
          );

        console.log(
          "Incentives response:",
          response
        );

        setIncentiveData(
          response
        );

      } catch (error) {
        console.error(
          "Incentive API error:",
          error
        );

        setIncentiveData(null);

        setIncentiveError(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load driver incentives."
        );

      } finally {
        setIncentiveLoading(false);
      }
    };

    loadIncentives();
  }, [
    activeTab,
    details,
    incentiveFilter,
    incentivePage,
  ]);


  /* =========================================================
     LOAD SEPARATE INCENTIVE HISTORY API
     ========================================================= */

  useEffect(() => {
    if (
      activeTab !== "incentiveHistory" ||
      !details
    ) {
      return;
    }

    const loadIncentiveHistory =
      async () => {

        const driverId =
          details?.driverId ||
          details?.id;

        if (!driverId) {
          setIncentiveHistoryError(
            "Driver ID not found."
          );

          return;
        }

        try {
          setIncentiveHistoryLoading(
            true
          );

          setIncentiveHistoryError("");

          const response =
            await getDriverIncentiveHistoryPage(
              {
                driverId,
                filter:
                  incentiveHistoryFilter,
                startDate:
                  incentiveHistoryStartDate,
                endDate:
                  incentiveHistoryEndDate,
                page:
                  incentiveHistoryPage,
                size:
                  incentiveHistorySize,
              }
            );

          console.log(
            "Separate Incentive History response:",
            response
          );

          setIncentiveHistoryData(
            response
          );

        } catch (error) {
          console.error(
            "Incentive History API error:",
            error
          );

          setIncentiveHistoryData(
            null
          );

          setIncentiveHistoryError(
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Unable to load incentive history."
          );

        } finally {
          setIncentiveHistoryLoading(
            false
          );
        }
      };

    loadIncentiveHistory();

  }, [
    activeTab,
    details,
    incentiveHistoryFilter,
    incentiveHistoryStartDate,
    incentiveHistoryEndDate,
    incentiveHistoryPage,
  ]);


  /* =========================================================
     BACK
     ========================================================= */

  const handleBack = () => {
    sessionStorage.removeItem(
      "selectedDriver"
    );

    localStorage.removeItem(
      "selectedDriver"
    );

    setActivePage(
      "allDrivers"
    );
  };


  /* =========================================================
     HELPERS
     ========================================================= */

  const formatKey = (key) => {
    return String(key)
      .replace(
        /([A-Z])/g,
        " $1"
      )
      .replace(
        /[_-]/g,
        " "
      )
      .replace(
        /^./,
        (char) =>
          char.toUpperCase()
      );
  };


  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (
      typeof value ===
      "object"
    ) {
      return JSON.stringify(
        value
      );
    }

    return String(value);
  };


  const getRows = (response) => {
    if (
      Array.isArray(response)
    ) {
      return response;
    }

    if (
      Array.isArray(
        response?.content
      )
    ) {
      return response.content;
    }

    if (
      Array.isArray(
        response?.data
      )
    ) {
      return response.data;
    }

    if (
      Array.isArray(
        response?.data?.content
      )
    ) {
      return response.data.content;
    }

    return [];
  };


  const getPageInfo = (response) => {
    const source =
      response?.data ??
      response ??
      {};

    return {
      totalPages:
        Number(
          source?.totalPages ??
          source?.data?.totalPages ??
          0
        ),

      totalElements:
        Number(
          source?.totalElements ??
          source?.data?.totalElements ??
          0
        ),
    };
  };


  /* =========================================================
     EMPTY TAB
     ========================================================= */

  const EmptyTab = ({
    title,
    message,
    icon: TabIcon = FiShoppingBag,
  }) => (
    <div className="driver-empty-state-card jippy-driver-details-card">
      <div className="driver-empty-state-icon">
        <TabIcon />
      </div>
      <h3 className="driver-empty-state-title">{title}</h3>
      <p className="driver-empty-state-msg">{message}</p>
    </div>
  );


  /* =========================================================
     DRIVER DETAILS
     ========================================================= */

  const renderDriverDetails = () => {
    const driverName = [
      details?.firstName,
      details?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const profileImage =
      details?.profilePicUrl ||
      details?.profilePicture ||
      details?.profileImageUrl ||
      null;

    const displayState =
      details?.stateName ||
      details?.state ||
      resolvedLocation.stateName ||
      (details?.stateId ? `State #${details.stateId}` : "-");

    const displayCity =
      details?.cityName ||
      details?.city ||
      resolvedLocation.cityName ||
      (details?.cityId ? `City #${details.cityId}` : "-");

    const displayArea =
      details?.areaName ||
      details?.area ||
      resolvedLocation.areaName ||
      (details?.areaId ? `Area #${details.areaId}` : "-");

    return (
      <>
        {/* DRIVER HERO PROFILE CARD */}
        <div className="driver-hero-card">
          <div className="driver-hero-content">
            <div className="driver-avatar-container">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={driverName || "Driver"}
                  className="driver-avatar-img"
                />
              ) : (
                <div className="driver-avatar-initials">
                  {(details?.firstName?.[0] || "D") + (details?.lastName?.[0] || "")}
                </div>
              )}
            </div>

            <div className="driver-hero-info">
              <div className="driver-hero-name-row">
                <h2 className="driver-hero-name">
                  {driverName || "Driver Details"}
                </h2>
                <span className="driver-id-badge">
                  ID: #{details?.driverId || details?.id || "-"}
                </span>
                <span
                  className={`driver-status-pill ${
                    details?.isActive ? "active" : "inactive"
                  }`}
                >
                  <span className="driver-status-dot" />
                  {details?.isActive ? "Active" : "Inactive"}
                </span>
                {details?.isApproved !== undefined && details?.isApproved !== null && (
                  <span
                    className={`driver-status-pill ${
                      details?.isApproved ? "approved" : "pending"
                    }`}
                  >
                    {details?.isApproved ? <FiCheck /> : null}
                    {details?.isApproved ? "Approved" : "Pending Verification"}
                  </span>
                )}
              </div>

              <div className="driver-hero-meta-chips">
                {details?.phoneNumber && (
                  <button
                    type="button"
                    className="driver-meta-chip"
                    onClick={() => copyToClipboard(details.phoneNumber, "hero_phone")}
                    title="Click to copy phone number"
                  >
                    <FiPhone className="chip-icon" />
                    <span>{details.phoneNumber}</span>
                    {copiedField === "hero_phone" ? (
                      <FiCheck className="chip-copy-icon copied" />
                    ) : (
                      <FiCopy className="chip-copy-icon" />
                    )}
                  </button>
                )}

                {details?.email && (
                  <button
                    type="button"
                    className="driver-meta-chip"
                    onClick={() => copyToClipboard(details.email, "hero_email")}
                    title="Click to copy email address"
                  >
                    <FiMail className="chip-icon" />
                    <span>{details.email}</span>
                    {copiedField === "hero_email" ? (
                      <FiCheck className="chip-copy-icon copied" />
                    ) : (
                      <FiCopy className="chip-copy-icon" />
                    )}
                  </button>
                )}

                {displayArea !== "-" && (
                  <div className="driver-meta-chip area-chip">
                    <FiMapPin className="chip-icon" />
                    <span>{displayArea}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="driver-details-card jippy-driver-details-card">
          <div className="driver-card-header">
            <div className="driver-card-header-left">
              <div className="driver-card-icon-box orange">
                <FiUser />
              </div>
              <div>
                <h3>Personal Information</h3>
                <p className="driver-card-subtitle">Driver identity, contact and demographic data</p>
              </div>
            </div>
          </div>

          <div className="driver-card-body">
            <div className="driver-info-grid jippy-driver-details-grid">
              <Detail
                label="Driver ID"
                value={details?.driverId || details?.id}
                icon={<FiUser />}
                copyable
                copyKey="driver_id"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="First Name"
                value={details?.firstName}
                icon={<FiUser />}
              />

              <Detail
                label="Last Name"
                value={details?.lastName}
                icon={<FiUser />}
              />

              <Detail
                label="Email"
                value={details?.email}
                icon={<FiMail />}
                copyable
                copyKey="email"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Phone Number"
                value={details?.phoneNumber}
                icon={<FiPhone />}
                copyable
                copyKey="phone"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Area"
                value={displayArea}
                icon={<FiMapPin />}
              />

              <Detail
                label="Gender"
                value={details?.gender}
                icon={<FiUser />}
              />

              <Detail
                label="Date of Birth"
                value={details?.dateOfBirth}
                icon={<FiCalendar />}
              />
            </div>
          </div>
        </div>

        {/* NOMINEE & FAMILY DETAILS */}
        <div className="driver-details-card jippy-driver-details-card">
          <div className="driver-card-header">
            <div className="driver-card-header-left">
              <div className="driver-card-icon-box purple">
                <FiShield />
              </div>
              <div>
                <h3>Nominee &amp; Family Details</h3>
                <p className="driver-card-subtitle">Registered emergency contacts and verified relatives</p>
              </div>
            </div>
          </div>

          <div className="driver-card-body">
            <div className="driver-info-grid jippy-driver-details-grid">
              <Detail
                label="Nominee Name"
                value={details?.nomineeName}
                icon={<FiUser />}
              />

              <Detail
                label="Nominee Phone"
                value={details?.nomineePhoneNumber || details?.nomineePhone}
                icon={<FiPhone />}
                copyable
                copyKey="nominee_phone"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Nominee Verified"
                value={details?.isNomineeVerified ? "Yes" : "No"}
                icon={<FiCheckCircle />}
                customRender={
                  <span
                    className={`driver-verif-chip ${
                      details?.isNomineeVerified ? "verified" : "unverified"
                    }`}
                  >
                    {details?.isNomineeVerified ? (
                      <>
                        <FiCheckCircle /> Verified
                      </>
                    ) : (
                      <>
                        <FiAlertCircle /> Unverified
                      </>
                    )}
                  </span>
                }
              />

              <Detail
                label="Family Member"
                value={details?.familyMemberName}
                icon={<FiUser />}
              />

              <Detail
                label="Family Phone"
                value={details?.familyMemberPhoneNumber || details?.familyPhone}
                icon={<FiPhone />}
                copyable
                copyKey="family_phone"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Family Member Verified"
                value={details?.isFamilyMemberVerified ? "Yes" : "No"}
                icon={<FiCheckCircle />}
                customRender={
                  <span
                    className={`driver-verif-chip ${
                      details?.isFamilyMemberVerified ? "verified" : "unverified"
                    }`}
                  >
                    {details?.isFamilyMemberVerified ? (
                      <>
                        <FiCheckCircle /> Verified
                      </>
                    ) : (
                      <>
                        <FiAlertCircle /> Unverified
                      </>
                    )}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* KYC DETAILS */}
        <div className="driver-details-card jippy-driver-details-card">
          <div className="driver-card-header">
            <div className="driver-card-header-left">
              <div className="driver-card-icon-box blue">
                <FiFileText />
              </div>
              <div>
                <h3>KYC Details</h3>
                <p className="driver-card-subtitle">Identification documents, vehicle license and registration</p>
              </div>
            </div>
          </div>

          <div className="driver-card-body">
            <div className="driver-info-grid jippy-driver-details-grid">
              <Detail
                label="Driver KYC ID"
                value={details?.driverKycId}
                icon={<FiFileText />}
              />

              <Detail
                label="Aadhaar Number"
                value={details?.aadharNumber || details?.aadhaarNumber}
                icon={<FiFileText />}
                copyable
                copyKey="aadhaar"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Driving License"
                value={details?.drivingLicenseNumber || details?.drivingLicense}
                icon={<FiFileText />}
                copyable
                copyKey="dl"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="RC Number"
                value={details?.rcNumber || details?.rcCopy}
                icon={<FiFileText />}
                copyable
                copyKey="rc"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        </div>

        {/* ADDRESS DETAILS */}
        <div className="driver-details-card jippy-driver-details-card">
          <div className="driver-card-header">
            <div className="driver-card-header-left">
              <div className="driver-card-icon-box emerald">
                <FiMapPin />
              </div>
              <div>
                <h3>Address Details</h3>
                <p className="driver-card-subtitle">Residential location, state, city and assigned coverage area</p>
              </div>
            </div>
          </div>

          <div className="driver-card-body">
            <div className="driver-info-grid jippy-driver-details-grid">
              <Detail
                label="Building Number"
                value={details?.buildingNumber}
                icon={<FiMapPin />}
                copyable
                copyKey="building"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Road"
                value={details?.road}
                icon={<FiMapPin />}
              />

              <Detail
                label="Landmark"
                value={details?.landmark}
                icon={<FiMapPin />}
              />

              <Detail
                label="State"
                value={displayState}
                icon={<FiMapPin />}
              />

              <Detail
                label="City"
                value={displayCity}
                icon={<FiMapPin />}
              />

              <Detail
                label="Area"
                value={displayArea}
                icon={<FiMapPin />}
              />

              <Detail
                label="Address"
                value={details?.address}
                icon={<FiMapPin />}
                copyable
                copyKey="address"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              <Detail
                label="Pincode"
                value={details?.pincode || details?.pinCode}
                icon={<FiMapPin />}
                copyable
                copyKey="pincode"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        </div>

        {/* VERIFICATION STATUS */}
        {details?.isApproved !== undefined && details?.isApproved !== null && (
          <div className="driver-details-card jippy-driver-details-card">
            <div className="driver-card-header">
              <div className="driver-card-header-left">
                <div className="driver-card-icon-box amber">
                  <FiCheckCircle />
                </div>
                <div>
                  <h3>Verification Status</h3>
                  <p className="driver-card-subtitle">Driver onboarding approval state</p>
                </div>
              </div>
            </div>

            <div className="driver-card-body">
              <div
                className={`driver-verif-chip large ${
                  details?.isApproved ? "verified" : "pending"
                }`}
              >
                {details?.isApproved ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>
                  {details?.isApproved
                    ? "Driver Onboarding Approved"
                    : "Onboarding Approval Pending"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE PICTURE */}
        {profileImage && (
          <div className="driver-details-card jippy-driver-details-card">
            <div className="driver-card-header">
              <div className="driver-card-header-left">
                <div className="driver-card-icon-box blue">
                  <FiUser />
                </div>
                <div>
                  <h3>Profile Picture</h3>
                  <p className="driver-card-subtitle">Photo uploaded during driver registration</p>
                </div>
              </div>
            </div>

            <div className="driver-card-body">
              <div className="driver-profile-photo-wrapper">
                <img
                  src={profileImage}
                  alt="Driver Profile"
                  className="driver-profile-photo-img"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  };


  /* =========================================================
     EARNINGS
     ========================================================= */

  const renderEarnings = () => {

    if (earningsLoading) {
      return (
        <LoadingCard
          text="Loading earnings..."
        />
      );
    }

    if (earningsError) {
      return (
        <ErrorCard
          title="Earnings"
          message={earningsError}
        />
      );
    }

    if (
      earningsData === null ||
      earningsData === undefined
    ) {
      return (
        <EmptyTab
          title="Earnings"
          message="No earnings data available for this driver."
        />
      );
    }

    const data =
      earningsData?.data ??
      earningsData;

    if (
      Array.isArray(data)
    ) {
      return (
        <DynamicTable
          title="Total Earnings"
          rows={data}
          driverId={
            details?.driverId ||
            details?.id
          }
        />
      );
    }

    if (
      typeof data ===
        "object" &&
      data !== null
    ) {
      return (
        <DynamicObjectCard
          title="Total Earnings"
          data={data}
          driverId={
            details?.driverId ||
            details?.id
          }
        />
      );
    }

    return (
      <div className="jippy-driver-details-card">
        <h3>
          Total Earnings
        </h3>

        <strong
          style={{
            display: "block",
            marginTop: "20px",
            fontSize: "24px",
          }}
        >
          {formatValue(data)}
        </strong>
      </div>
    );
  };


  /* =========================================================
     OLD INCENTIVES
     ========================================================= */

  const renderIncentives = () => {

    if (incentiveLoading) {
      return (
        <LoadingCard
          text="Loading incentives..."
        />
      );
    }

    if (incentiveError) {
      return (
        <ErrorCard
          title="Incentives"
          message={incentiveError}
        />
      );
    }

    const rows =
      getRows(
        incentiveData
      );

    return (
      <div className="jippy-driver-details-card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >

          <div>
            <h3>
              Incentives
            </h3>

            <span
              style={{
                color: "#777",
                fontSize: "12px",
              }}
            >
              Driver ID:{" "}
              {details?.driverId ||
                details?.id ||
                "-"}
            </span>
          </div>


          <select
            value={
              incentiveFilter
            }
            onChange={(event) => {

              setIncentivePage(0);

              setIncentiveData(null);

              setIncentiveFilter(
                event.target.value
              );

            }}
            style={{
              height: "34px",
              minWidth: "140px",
              border:
                "1px solid #ddd",
              borderRadius:
                "5px",
              padding:
                "0 10px",
            }}
          >

            <option value="ALL">
              ALL
            </option>

            <option value="currentMonth">
              Current Month
            </option>

          </select>

        </div>


        {rows.length === 0 ? (

          <div
            style={{
              minHeight: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
            }}
          >
            No incentive data found.
          </div>

        ) : (

          <DynamicTable
            title=""
            rows={rows}
            driverId={
              details?.driverId ||
              details?.id
            }
          />

        )}

      </div>
    );
  };


  /* =========================================================
     SEPARATE INCENTIVE HISTORY
     ========================================================= */

  const renderIncentiveHistory = () => {

    if (
      incentiveHistoryLoading
    ) {
      return (
        <LoadingCard
          text="Loading incentive history..."
        />
      );
    }


    if (
      incentiveHistoryError
    ) {
      return (
        <ErrorCard
          title="Incentive History"
          message={
            incentiveHistoryError
          }
        />
      );
    }


    const rows =
      getRows(
        incentiveHistoryData
      );


    const pageInfo =
      getPageInfo(
        incentiveHistoryData
      );


    const hasNextPage =
      pageInfo.totalPages > 0
        ? incentiveHistoryPage <
          pageInfo.totalPages - 1
        : rows.length >=
          incentiveHistorySize;


    return (
      <div className="jippy-driver-details-card">

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: "15px",
          }}
        >

          <div>

            <h3
              style={{
                margin:
                  "0 0 5px",
              }}
            >
              Incentive History
            </h3>

            <span
              style={{
                color: "#777",
                fontSize:
                  "12px",
              }}
            >
              Driver ID:{" "}
              {details?.driverId ||
                details?.id ||
                "-"}
            </span>

          </div>

        </div>


        {/* FILTERS */}

        <div
          style={{
            display: "flex",
            alignItems:
              "flex-end",
            gap: "10px",
            flexWrap:
              "wrap",
            marginTop:
              "18px",
            padding:
              "12px",
            background:
              "#f8f9fa",
            borderRadius:
              "6px",
          }}
        >

          {/* FILTER */}

          <div>

            <label
              style={{
                display:
                  "block",
                fontSize:
                  "12px",
                marginBottom:
                  "5px",
              }}
            >
              Filter
            </label>

            <select
              value={
                incentiveHistoryFilter
              }
              onChange={(event) => {

                setIncentiveHistoryPage(
                  0
                );

                setIncentiveHistoryData(
                  null
                );

                setIncentiveHistoryFilter(
                  event.target.value
                );

              }}
              style={{
                height:
                  "34px",
                minWidth:
                  "120px",
                padding:
                  "0 10px",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "5px",
                background:
                  "#fff",
              }}
            >

              <option value="ALL">
                ALL
              </option>

              <option value="currentMonth">
                Current Month
              </option>

            </select>

          </div>


          {/* START DATE */}

          <div>

            <label
              style={{
                display:
                  "block",
                fontSize:
                  "12px",
                marginBottom:
                  "5px",
              }}
            >
              Start Date
            </label>

            <input
              type="date"
              value={
                incentiveHistoryStartDate
              }
              onChange={(event) => {

                setIncentiveHistoryPage(
                  0
                );

                setIncentiveHistoryData(
                  null
                );

                setIncentiveHistoryStartDate(
                  event.target.value
                );

              }}
              style={{
                height:
                  "34px",
                padding:
                  "0 8px",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "5px",
              }}
            />

          </div>


          {/* END DATE */}

          <div>

            <label
              style={{
                display:
                  "block",
                fontSize:
                  "12px",
                marginBottom:
                  "5px",
              }}
            >
              End Date
            </label>

            <input
              type="date"
              value={
                incentiveHistoryEndDate
              }
              onChange={(event) => {

                setIncentiveHistoryPage(
                  0
                );

                setIncentiveHistoryData(
                  null
                );

                setIncentiveHistoryEndDate(
                  event.target.value
                );

              }}
              style={{
                height:
                  "34px",
                padding:
                  "0 8px",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "5px",
              }}
            />

          </div>


          {/* APPLY */}

          <button
            type="button"
            onClick={() => {

              setIncentiveHistoryPage(
                0
              );

              setIncentiveHistoryData(
                null
              );

            }}
            style={{
              height:
                "34px",
              padding:
                "0 16px",
              border:
                "none",
              borderRadius:
                "5px",
              background:
                "#ff6b00",
              color:
                "#fff",
              cursor:
                "pointer",
            }}
          >
            Apply
          </button>

        </div>


        {/* DATA */}

        {rows.length === 0 ? (

          <div
            style={{
              minHeight:
                "150px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color:
                "#777",
              fontSize:
                "13px",
            }}
          >
            No incentive history found.
          </div>

        ) : (

          <DynamicTable
            title=""
            rows={rows}
            driverId={
              details?.driverId ||
              details?.id
            }
          />

        )}


        {/* PAGINATION */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "flex-end",
            alignItems:
              "center",
            gap:
              "10px",
            marginTop:
              "15px",
          }}
        >

          <button
            type="button"
            disabled={
              incentiveHistoryPage ===
              0
            }
            onClick={() => {

              setIncentiveHistoryData(
                null
              );

              setIncentiveHistoryPage(
                (page) =>
                  Math.max(
                    0,
                    page - 1
                  )
              );

            }}
            style={{
              padding:
                "7px 14px",
              border:
                "1px solid #ddd",
              borderRadius:
                "4px",
              background:
                incentiveHistoryPage ===
                0
                  ? "#f5f5f5"
                  : "#fff",
              cursor:
                incentiveHistoryPage ===
                0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Previous
          </button>


          <span
            style={{
              fontSize:
                "13px",
              color:
                "#555",
            }}
          >
            Page{" "}
            {incentiveHistoryPage +
              1}

            {pageInfo.totalPages >
              0 &&
              ` of ${pageInfo.totalPages}`}
          </span>


          <button
            type="button"
            disabled={
              !hasNextPage
            }
            onClick={() => {

              setIncentiveHistoryData(
                null
              );

              setIncentiveHistoryPage(
                (page) =>
                  page + 1
              );

            }}
            style={{
              padding:
                "7px 14px",
              border:
                "1px solid #ddd",
              borderRadius:
                "4px",
              background:
                !hasNextPage
                  ? "#f5f5f5"
                  : "#fff",
              cursor:
                !hasNextPage
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next
          </button>

        </div>

      </div>
    );
  };


  /* =========================================================
     TAB CONTENT (Activity & Incentives Removed)
     ========================================================= */

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return renderDriverDetails();

      case "orders":
        return (
          <EmptyTab
            title="Orders"
            message="Driver order history, assigned deliveries and routes will appear here."
            icon={FiShoppingBag}
          />
        );

      case "earnings":
        return renderEarnings();

      case "attendance":
        return (
          <EmptyTab
            title="Attendance"
            message="Driver shifts, clock-in logs and active work sessions will appear here."
            icon={FiCalendar}
          />
        );

      case "documents":
        return (
          <EmptyTab
            title="Documents"
            message="Driver identification, RC, vehicle insurance and licenses will appear here."
            icon={FiFileText}
          />
        );

      case "payments":
        return (
          <EmptyTab
            title="Payments"
            message="Driver payout settlements, bank transactions and payment history will appear here."
            icon={FiCreditCard}
          />
        );

      default:
        return renderDriverDetails();
    }
  };


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="driver-loading-card jippy-driver-details-loading">
        <FiLoader className="jippy-driver-loader" />
        <span>Loading driver details...</span>
      </div>
    );
  }


  /* =========================================================
     NO DRIVER
     ========================================================= */

  if (!details) {
    return (
      <div className="driver-details-page jippy-driver-details-page">
        <div className="page-header-container">
          <div
            className="breadcrumb-header"
            onClick={handleBack}
          >
            <FiArrowLeft className="back-arrow-icon" />
            <h2>Driver Details</h2>
          </div>
          <p className="breadcrumb-trail">
            <span onClick={handleBack}>
              Drivers
            </span>
            {" > "}
            Driver Details
          </p>
        </div>

        <div className="driver-empty-state-card jippy-driver-details-card">
          <div className="driver-empty-state-icon">
            <FiUser />
          </div>
          <h3 className="driver-empty-state-title">Driver Not Found</h3>
          <p className="driver-empty-state-msg">
            {errorMessage || "The requested driver details could not be found."}
          </p>
        </div>
      </div>
    );
  }


  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="driver-details-page jippy-driver-details-page">
      {/* PAGE HEADER (Categories Style) */}
      <div className="page-header-container">
        <div className="page-header-left">
          <div
            className="breadcrumb-header"
            onClick={handleBack}
          >
            <FiArrowLeft className="back-arrow-icon" />
            <h2>Driver Details</h2>
          </div>

          <p className="breadcrumb-trail">
            <span onClick={handleBack}>
              Drivers
            </span>
            {" > "}
            Driver Details
          </p>
        </div>

        <div className="driver-header-actions">
          <button
            type="button"
            className={`btn-driver-refresh ${refreshing ? "spinning" : ""}`}
            onClick={handleRefresh}
            title="Refresh driver details"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {errorMessage && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            borderRadius: "12px",
            background: "#fff3cd",
            color: "#856404",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #ffeeba",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* SEGMENTED NAVIGATION TABS */}
      <div className="driver-nav-tabs jippy-driver-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={`driver-nav-tab ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "earnings") {
                  setEarningsError("");
                }
              }}
            >
              {Icon && <Icon className="tab-icon" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="driver-tab-content jippy-driver-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}


/* =========================================================
   DETAIL COMPONENT (Info Tile with Icons & Copy Support)
   ========================================================= */

function Detail({
  label,
  value,
  valueClass = "",
  icon = null,
  copyable = false,
  copyKey = "",
  copiedField = null,
  onCopy = null,
  customRender = null,
}) {
  const displayVal = formatValue(value);
  const canCopy = copyable && displayVal !== "-" && onCopy;

  return (
    <div className="driver-info-tile jippy-driver-detail-item">
      <div className="driver-info-label">
        {icon}
        <span>{label}</span>
      </div>

      <div className="driver-info-val-row">
        {customRender ? (
          customRender
        ) : (
          <span className={`driver-info-value ${valueClass}`}>
            {displayVal}
          </span>
        )}

        {canCopy && (
          <button
            type="button"
            className="driver-tile-copy-btn"
            onClick={() => onCopy(value, copyKey)}
            title={`Copy ${label}`}
          >
            {copiedField === copyKey ? (
              <FiCheck className="copied-check" />
            ) : (
              <FiCopy />
            )}
          </button>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   LOADING CARD
   ========================================================= */

function LoadingCard({ text }) {
  return (
    <div className="driver-loading-card jippy-driver-details-loading">
      <FiLoader className="jippy-driver-loader" />
      <span>{text}</span>
    </div>
  );
}


/* =========================================================
   ERROR CARD
   ========================================================= */

function ErrorCard({ title, message }) {
  return (
    <div className="driver-details-card jippy-driver-details-card">
      <div className="driver-card-header">
        <div className="driver-card-header-left">
          <div className="driver-card-icon-box amber">
            <FiAlertCircle />
          </div>
          <div>
            <h3>{title}</h3>
            <p className="driver-card-subtitle">An error occurred while loading data</p>
          </div>
        </div>
      </div>

      <div className="driver-card-body">
        <p style={{ color: "#dc3545", margin: 0, fontSize: "14px", fontWeight: "500" }}>
          {message}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   DYNAMIC TABLE (Executive Table with Clean Borders)
   ========================================================= */

function DynamicTable({ title, rows, driverId }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="driver-empty-state-card jippy-driver-details-card">
        <div className="driver-empty-state-icon">
          <FiDollarSign />
        </div>
        <h3 className="driver-empty-state-title">{title || "Total Earnings"}</h3>
        <p className="driver-empty-state-msg">No earnings data available for this driver.</p>
      </div>
    );
  }

  const columns = Object.keys(rows[0] || {});

  return (
    <div className="driver-details-card jippy-driver-details-card">
      {title && (
        <div className="driver-card-header">
          <div className="driver-card-header-left">
            <div className="driver-card-icon-box emerald">
              <FiDollarSign />
            </div>
            <div>
              <h3>{title}</h3>
              <p className="driver-card-subtitle">
                Driver ID: #{driverId || "-"} • {rows.length} record{rows.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="driver-table-wrapper">
        <table className="driver-modern-table">
          <thead>
            <tr>
              {columns.map((key) => (
                <th key={key}>{formatKey(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row?.id || row?.historyId || row?.incentiveId || index}>
                {columns.map((key) => (
                  <td key={key}>{formatValue(row?.[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* =========================================================
   OBJECT CARD
   ========================================================= */

function DynamicObjectCard({ title, data, driverId }) {
  const entries = Object.entries(data || {});

  return (
    <div className="driver-details-card jippy-driver-details-card">
      <div className="driver-card-header">
        <div className="driver-card-header-left">
          <div className="driver-card-icon-box emerald">
            <FiDollarSign />
          </div>
          <div>
            <h3>{title}</h3>
            <p className="driver-card-subtitle">Driver ID: #{driverId || "-"}</p>
          </div>
        </div>
      </div>

      <div className="driver-card-body">
        <div className="driver-info-grid jippy-driver-details-grid">
          {entries.map(([key, value]) => (
            <Detail
              key={key}
              label={formatKey(key)}
              value={value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   GLOBAL HELPERS
   ========================================================= */

function formatKey(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}


function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}


export default DriverDetails;