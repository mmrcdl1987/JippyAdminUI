import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiLoader,
  FiCheck,
} from "react-icons/fi";

import "../styles/DriverDetails.css";

import {
  getDriverById,
  getTotalDriverEarnings,
  getDriverIncentiveHistory,
  getDriverIncentiveHistoryPage,
} from "../services/driverService";


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
     TABS
     ========================================================= */

  const tabs = [
    {
      id: "details",
      label: "Driver Details",
    },
    {
      id: "orders",
      label: "Orders",
    },
    {
      id: "incentives",
      label: "Incentives",
    },
    {
      id: "incentiveHistory",
      label: "Incentive History",
    },
    {
      id: "earnings",
      label: "Earnings",
    },
    {
      id: "attendance",
      label: "Attendance",
    },
    {
      id: "documents",
      label: "Documents",
    },
    {
      id: "payments",
      label: "Payments",
    },
    {
      id: "activity",
      label: "Activity",
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
  }) => (
    <div
      className="jippy-driver-details-card"
      style={{
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#777",
          fontSize: "13px",
        }}
      >
        {message}
      </p>
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

    return (
      <>
        {/* BASIC DETAILS */}

        <div className="jippy-driver-details-card">

          <div className="jippy-driver-details-title">

            <div>
              <h3>
                {driverName ||
                  "Driver"}
              </h3>

              <span>
                Driver ID:{" "}
                {details?.driverId ||
                  details?.id ||
                  "-"}
              </span>
            </div>

            <span
              className={`jippy-status-badge ${
                details?.isActive
                  ? "active"
                  : "inactive"
              }`}
            >
              {details?.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </div>


          <div className="jippy-driver-details-grid">

            <Detail
              label="Driver ID"
              value={
                details?.driverId ||
                details?.id
              }
            />

            <Detail
              label="First Name"
              value={
                details?.firstName
              }
            />

            <Detail
              label="Last Name"
              value={
                details?.lastName
              }
            />

            <Detail
              label="Email"
              value={
                details?.email
              }
            />

            <Detail
              label="Phone Number"
              value={
                details?.phoneNumber
              }
            />

            <Detail
              label="Area"
              value={
                details?.areaName ||
                details?.areaId
              }
            />

            <Detail
              label="Gender"
              value={
                details?.gender
              }
            />

            <Detail
              label="Date of Birth"
              value={
                details?.dateOfBirth
              }
            />

          </div>

        </div>


        {/* NOMINEE */}

        <div className="jippy-driver-details-card">

          <h3>
            Nominee &amp; Family Details
          </h3>

          <div className="jippy-driver-details-grid">

            <Detail
              label="Nominee Name"
              value={
                details?.nomineeName
              }
            />

            <Detail
              label="Nominee Phone"
              value={
                details?.nomineePhoneNumber ||
                details?.nomineePhone
              }
            />

            <Detail
              label="Nominee Verified"
              value={
                details?.isNomineeVerified
                  ? "Yes"
                  : "No"
              }
              valueClass={
                details?.isNomineeVerified
                  ? "jippy-driver-verified"
                  : "jippy-driver-not-verified"
              }
            />

            <Detail
              label="Family Member"
              value={
                details?.familyMemberName
              }
            />

            <Detail
              label="Family Phone"
              value={
                details?.familyMemberPhoneNumber ||
                details?.familyPhone
              }
            />

            <Detail
              label="Family Member Verified"
              value={
                details?.isFamilyMemberVerified
                  ? "Yes"
                  : "No"
              }
              valueClass={
                details?.isFamilyMemberVerified
                  ? "jippy-driver-verified"
                  : "jippy-driver-not-verified"
              }
            />

          </div>

        </div>


        {/* KYC */}

        <div className="jippy-driver-details-card">

          <h3>
            KYC Details
          </h3>

          <div className="jippy-driver-details-grid">

            <Detail
              label="Driver KYC ID"
              value={
                details?.driverKycId
              }
            />

            <Detail
              label="Aadhaar Number"
              value={
                details?.aadharNumber ||
                details?.aadhaarNumber
              }
            />

            <Detail
              label="Driving License"
              value={
                details?.drivingLicenseNumber ||
                details?.drivingLicense
              }
            />

            <Detail
              label="RC Number"
              value={
                details?.rcNumber ||
                details?.rcCopy
              }
            />

          </div>

        </div>


        {/* ADDRESS */}

        <div className="jippy-driver-details-card">

          <h3>
            Address Details
          </h3>

          <div className="jippy-driver-details-grid">

            <Detail
              label="Building Number"
              value={
                details?.buildingNumber
              }
            />

            <Detail
              label="Road"
              value={
                details?.road
              }
            />

            <Detail
              label="Landmark"
              value={
                details?.landmark
              }
            />

            <Detail
              label="State ID"
              value={
                details?.stateId
              }
            />

            <Detail
              label="City ID"
              value={
                details?.cityId
              }
            />

            <Detail
              label="Area ID"
              value={
                details?.areaId
              }
            />

            <Detail
              label="Address"
              value={
                details?.address
              }
            />

            <Detail
              label="Pincode"
              value={
                details?.pincode ||
                details?.pinCode
              }
            />

          </div>

        </div>


        {/* APPROVAL */}

        {details?.isApproved !==
          undefined &&
          details?.isApproved !==
            null && (

          <div className="jippy-driver-details-card">

            <h3>
              Verification Status
            </h3>

            <div
              className={
                details?.isApproved
                  ? "jippy-driver-approved-badge"
                  : "jippy-driver-pending-badge"
              }
            >

              {details?.isApproved && (
                <FiCheck />
              )}

              {details?.isApproved
                ? "Approved"
                : "Pending"}

            </div>

          </div>
        )}


        {/* PROFILE */}

        <div className="jippy-driver-details-card">

          <h3>
            Profile Picture
          </h3>

          <div className="jippy-driver-details-profile">

            {profileImage ? (
              <img
                src={profileImage}
                alt="Driver Profile"
              />
            ) : (
              <div className="jippy-driver-details-no-image">
                No Image
              </div>
            )}

          </div>

        </div>

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
     TAB CONTENT
     ========================================================= */

  const renderTabContent = () => {

    switch (activeTab) {

      case "details":
        return renderDriverDetails();

      case "orders":
        return (
          <EmptyTab
            title="Orders"
            message="Driver order details will be displayed here."
          />
        );

      case "incentives":
        return renderIncentives();

      case "incentiveHistory":
        return renderIncentiveHistory();

      case "earnings":
        return renderEarnings();

      case "attendance":
        return (
          <EmptyTab
            title="Attendance"
            message="Driver attendance details will be displayed here."
          />
        );

      case "documents":
        return (
          <EmptyTab
            title="Documents"
            message="Driver documents will be displayed here."
          />
        );

      case "payments":
        return (
          <EmptyTab
            title="Payments"
            message="Driver payment details will be displayed here."
          />
        );

      case "activity":
        return (
          <EmptyTab
            title="Activity"
            message="Driver activity history will be displayed here."
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
      <div className="jippy-driver-details-loading">

        <FiLoader
          className="jippy-driver-loader"
        />

        <span>
          Loading driver details...
        </span>

      </div>
    );
  }


  /* =========================================================
     NO DRIVER
     ========================================================= */

  if (!details) {
    return (
      <div className="jippy-driver-details-page">

        <button
          type="button"
          className="jippy-driver-back-btn"
          onClick={handleBack}
        >
          <FiArrowLeft />
          Back to Drivers
        </button>

        <h2>
          Driver Details
        </h2>

        <p>
          {errorMessage ||
            "Driver details not found."}
        </p>

      </div>
    );
  }


  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="jippy-driver-details-page">

      {/* HEADER */}

      <div className="jippy-driver-details-header">

        <div>

          <button
            type="button"
            className="jippy-driver-back-btn"
            onClick={handleBack}
          >
            <FiArrowLeft />
            Back to Drivers
          </button>

          <h2>
            Driver Details
          </h2>

          <p>
            View complete information
            about the driver
          </p>

        </div>

      </div>


      {/* ERROR */}

      {errorMessage && (
        <div
          style={{
            marginBottom:
              "15px",
            padding:
              "10px 15px",
            borderRadius:
              "6px",
            background:
              "#fff3cd",
            color:
              "#856404",
            fontSize:
              "14px",
          }}
        >
          {errorMessage}
        </div>
      )}


      {/* TABS */}

      <div
        className="jippy-driver-tabs"
        style={{
          display:
            "flex",
          alignItems:
            "center",
          background:
            "#fff",
          border:
            "1px solid #e1e5e9",
          borderRadius:
            "7px",
          marginBottom:
            "15px",
          overflowX:
            "auto",
          whiteSpace:
            "nowrap",
        }}
      >

        {tabs.map((tab) => {

          const isActive =
            activeTab ===
            tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {

                setActiveTab(
                  tab.id
                );


                if (
                  tab.id ===
                  "earnings"
                ) {
                  setEarningsError(
                    ""
                  );
                }


                if (
                  tab.id ===
                  "incentives"
                ) {
                  setIncentiveError(
                    ""
                  );

                  setIncentivePage(
                    0
                  );
                }


                if (
                  tab.id ===
                  "incentiveHistory"
                ) {
                  setIncentiveHistoryError(
                    ""
                  );

                  setIncentiveHistoryPage(
                    0
                  );
                }

              }}
              style={{
                position:
                  "relative",
                border:
                  "none",
                background:
                  "transparent",
                padding:
                  "14px 18px",
                fontSize:
                  "13px",
                fontWeight:
                  isActive
                    ? "600"
                    : "500",
                color:
                  isActive
                    ? "#ff6b00"
                    : "#555",
                cursor:
                  "pointer",
                whiteSpace:
                  "nowrap",
              }}
            >

              {tab.label}

              {isActive && (
                <span
                  style={{
                    position:
                      "absolute",
                    left:
                      "10px",
                    right:
                      "10px",
                    bottom:
                      "0",
                    height:
                      "2px",
                    background:
                      "#ff6b00",
                    borderRadius:
                      "2px 2px 0 0",
                  }}
                />
              )}

            </button>
          );
        })}

      </div>


      {/* CONTENT */}

      <div className="jippy-driver-tab-content">
        {renderTabContent()}
      </div>

    </div>
  );
}


/* =========================================================
   DETAIL COMPONENT
   ========================================================= */

function Detail({
  label,
  value,
  valueClass = "",
}) {
  return (
    <div className="jippy-driver-detail-item">

      <span>
        {label}
      </span>

      <strong
        className={valueClass}
      >
        {formatValue(value)}
      </strong>

    </div>
  );
}


/* =========================================================
   LOADING CARD
   ========================================================= */

function LoadingCard({
  text,
}) {
  return (
    <div
      className="jippy-driver-details-card"
      style={{
        minHeight:
          "180px",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        gap:
          "10px",
      }}
    >

      <FiLoader
        className="jippy-driver-loader"
      />

      <span>
        {text}
      </span>

    </div>
  );
}


/* =========================================================
   ERROR CARD
   ========================================================= */

function ErrorCard({
  title,
  message,
}) {
  return (
    <div className="jippy-driver-details-card">

      <h3>
        {title}
      </h3>

      <p
        style={{
          color:
            "#dc3545",
          fontSize:
            "14px",
          marginTop:
            "12px",
        }}
      >
        {message}
      </p>

    </div>
  );
}


/* =========================================================
   DYNAMIC TABLE
   ========================================================= */

function DynamicTable({
  title,
  rows,
  driverId,
}) {

  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return (
      <div
        className="jippy-driver-details-card"
      >
        No data available.
      </div>
    );
  }


  const columns =
    Object.keys(
      rows[0] || {}
    );


  return (
    <div
      className={
        title
          ? "jippy-driver-details-card"
          : ""
      }
    >

      {title && (
        <div
          className="jippy-driver-details-title"
        >

          <div>

            <h3>
              {title}
            </h3>

            <span>
              Driver ID:{" "}
              {driverId ||
                "-"}
            </span>

          </div>

        </div>
      )}


      <div
        style={{
          overflowX:
            "auto",
          marginTop:
            title
              ? "15px"
              : "18px",
        }}
      >

        <table
          style={{
            width:
              "100%",
            borderCollapse:
              "collapse",
            fontSize:
              "13px",
          }}
        >

          <thead>

            <tr>

              {columns.map(
                (key) => (

                  <th
                    key={key}
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "11px 10px",
                      borderBottom:
                        "1px solid #ddd",
                      background:
                        "#f8f9fa",
                      fontWeight:
                        "600",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {formatKey(key)}
                  </th>

                )
              )}

            </tr>

          </thead>


          <tbody>

            {rows.map(
              (row, index) => (

                <tr
                  key={
                    row?.id ||
                    row?.historyId ||
                    row?.incentiveId ||
                    index
                  }
                >

                  {columns.map(
                    (key) => (

                      <td
                        key={key}
                        style={{
                          padding:
                            "11px 10px",
                          borderBottom:
                            "1px solid #eee",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatValue(
                          row?.[key]
                        )}
                      </td>

                    )
                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


/* =========================================================
   OBJECT CARD
   ========================================================= */

function DynamicObjectCard({
  title,
  data,
  driverId,
}) {

  const entries =
    Object.entries(
      data || {}
    );


  return (
    <div className="jippy-driver-details-card">

      <div className="jippy-driver-details-title">

        <div>

          <h3>
            {title}
          </h3>

          <span>
            Driver ID:{" "}
            {driverId ||
              "-"}
          </span>

        </div>

      </div>


      <div className="jippy-driver-details-grid">

        {entries.map(
          ([key, value]) => (

            <Detail
              key={key}
              label={formatKey(key)}
              value={value}
            />

          )
        )}

      </div>

    </div>
  );
}


/* =========================================================
   GLOBAL HELPERS
   ========================================================= */

function formatKey(key) {
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
}


function formatValue(value) {

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
}


export default DriverDetails;