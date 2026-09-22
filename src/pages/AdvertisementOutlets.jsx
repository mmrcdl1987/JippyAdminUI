import { useEffect, useState } from "react";
import Select from "react-select";

import API, {
  FM_API,
  getMealTypeTimings,
} from "../services/api";

import "../styles/AdvertisementOutlets.css";

function AdvertisementOutlets() {
  // ============================================================
  // PRICING
  // ============================================================

  const [pricingType, setPricingType] = useState("FLAT");
  const [offerAmount, setOfferAmount] = useState("");

  // ============================================================
  // MASTER DATA
  // ============================================================

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [plans, setPlans] = useState([]);

  // ============================================================
  // MEAL TYPE TIMINGS
  // ============================================================

  const [mealTypeTimings, setMealTypeTimings] = useState([]);

  const [
    selectedMealTypeTimingIds,
    setSelectedMealTypeTimingIds,
  ] = useState([]);

  const [loadingMealTypes, setLoadingMealTypes] =
    useState(false);

  // ============================================================
  // SELECTED VALUES
  // ============================================================

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ============================================================
  // DATES
  // ============================================================

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ============================================================
  // TODAY
  // ============================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchStates();
  }, []);

  // ============================================================
  // FETCH STATES
  // ============================================================

  const fetchStates = async () => {
    try {
      const response = await API.get(
        "/api/fm/location/fetchStates"
      );

      setStates(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching states:",
        error
      );

      setStates([]);
    }
  };

  // ============================================================
  // STATE CHANGE
  // ============================================================

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setSelectedState(stateId);

    setSelectedCity("");
    setSelectedArea("");
    setSelectedOutlet("");
    setSelectedPlan(null);

    setStartDate("");
    setEndDate("");

    setCities([]);
    setAreas([]);
    setOutlets([]);
    setPlans([]);

    // Reset meal types
    setMealTypeTimings([]);
    setSelectedMealTypeTimingIds([]);

    // Reset pricing
    setPricingType("FLAT");
    setOfferAmount("");

    if (!stateId) {
      return;
    }

    try {
      const response = await API.get(
        `/api/fm/location/fetchCityInState?stateId=${stateId}`
      );

      setCities(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching cities:",
        error
      );

      setCities([]);
    }
  };

  // ============================================================
  // CITY CHANGE
  // ============================================================

  const handleCityChange = async (e) => {
    const cityId = e.target.value;

    setSelectedCity(cityId);

    setSelectedArea("");
    setSelectedOutlet("");
    setSelectedPlan(null);

    setStartDate("");
    setEndDate("");

    setAreas([]);
    setOutlets([]);
    setPlans([]);

    // Reset meal types
    setMealTypeTimings([]);
    setSelectedMealTypeTimingIds([]);

    // Reset pricing
    setPricingType("FLAT");
    setOfferAmount("");

    if (!cityId) {
      return;
    }

    try {
      const response = await API.get(
        `/api/fm/location/fetchAreaInCity?cityId=${cityId}`
      );

      setAreas(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching areas:",
        error
      );

      setAreas([]);
    }
  };

  // ============================================================
  // AREA CHANGE
  // ============================================================

  const handleAreaChange = async (e) => {
    const areaId = e.target.value;

    setSelectedArea(areaId);

    setSelectedOutlet("");
    setSelectedPlan(null);

    setStartDate("");
    setEndDate("");

    setPlans([]);
    setOutlets([]);

    // Reset meal types
    setMealTypeTimings([]);
    setSelectedMealTypeTimingIds([]);

    // Reset pricing
    setPricingType("FLAT");
    setOfferAmount("");

    if (!areaId) {
      return;
    }

    await fetchSubscriptionPlans(areaId);
  };

  // ============================================================
  // FETCH OUTLETS
  // ============================================================

  const fetchOutlets = async () => {
    try {
      const response = await API.get(
        "/api/fm/outlets"
      );

      setOutlets(
        Array.isArray(response.data?.data)
          ? response.data.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching outlets:",
        error
      );

      setOutlets([]);
    }
  };

  // ============================================================
  // FETCH SUBSCRIPTION PLANS
  // ============================================================

  const fetchSubscriptionPlans = async (areaId) => {
    try {
      const response = await FM_API.get(
        `/api/fm/subscription-plans/area/${areaId}`
      );

      const planData =
        Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

      setPlans(planData);
    } catch (error) {
      console.error(
        "Error fetching subscription plans:",
        error
      );

      setPlans([]);
    }
  };

  // ============================================================
  // FETCH MEAL TYPE TIMINGS
  // ============================================================
  //
  // Backend controller:
  //
  // @RequestMapping("/api/fm/meal-reminder")
  // @GetMapping
  //
  // Endpoint:
  //
  // GET /api/fm/meal-reminder
  //
  // ============================================================

  const fetchMealTypeTimings = async () => {
    try {
      setLoadingMealTypes(true);

      console.log(
        "Fetching meal type timings..."
      );

      const data = await getMealTypeTimings();

      console.log(
        "Meal Type Timings Response:",
        data
      );

      const mealData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const formattedMealData =
        mealData.map((meal) => ({
          ...meal,
          mealTypeTimingsId: Number(
            meal.mealTypeTimingsId
          ),
        }));

      setMealTypeTimings(
        formattedMealData
      );

      // Clear old meal selection
      setSelectedMealTypeTimingIds([]);

      // Clear pricing
      setPricingType("FLAT");
      setOfferAmount("");
    } catch (error) {
      console.error(
        "Error fetching meal type timings:",
        error
      );

      setMealTypeTimings([]);
      setSelectedMealTypeTimingIds([]);

      setPricingType("FLAT");
      setOfferAmount("");
    } finally {
      setLoadingMealTypes(false);
    }
  };

  // ============================================================
  // START DATE CHANGE
  // ============================================================

  const handleStartDateChange = async (e) => {
    const selectedDate = e.target.value;

    setStartDate(selectedDate);

    // Clear old meal selection
    setSelectedMealTypeTimingIds([]);

    // Clear pricing
    setPricingType("FLAT");
    setOfferAmount("");

    // If date is cleared
    if (!selectedDate) {
      setMealTypeTimings([]);
      setEndDate("");
      return;
    }

    // ==========================================================
    // CALCULATE END DATE
    // ==========================================================

    if (
      selectedPlan &&
      selectedPlan.bannerDurationInDays
    ) {
      const date = new Date(
        `${selectedDate}T00:00:00`
      );

      date.setDate(
        date.getDate() +
          Number(
            selectedPlan.bannerDurationInDays
          )
      );

      setEndDate(
        date.toISOString().split("T")[0]
      );
    }

    // ==========================================================
    // LOAD MEAL TYPES
    // ==========================================================

    await fetchMealTypeTimings();
  };

  // ============================================================
  // MEAL TYPE SELECTION
  // ============================================================

  const handleMealTypeSelection = (
    mealTypeTimingsId
  ) => {
    const id = Number(mealTypeTimingsId);

    setSelectedMealTypeTimingIds(
      (previousIds) => {
        // Already selected -> remove
        if (previousIds.includes(id)) {
          const updatedIds =
            previousIds.filter(
              (previousId) =>
                previousId !== id
            );

          // If no meal selected,
          // clear price details
          if (updatedIds.length === 0) {
            setPricingType("FLAT");
            setOfferAmount("");
          }

          return updatedIds;
        }

        // Not selected -> add
        return [...previousIds, id];
      }
    );
  };

  // ============================================================
  // SELECT ALL MEAL TYPES
  // ============================================================

  const handleSelectAllMealTypes = () => {
    if (
      selectedMealTypeTimingIds.length ===
      mealTypeTimings.length
    ) {
      // Unselect all
      setSelectedMealTypeTimingIds([]);

      // Clear pricing
      setPricingType("FLAT");
      setOfferAmount("");
    } else {
      // Select all
      setSelectedMealTypeTimingIds(
        mealTypeTimings.map(
          (meal) =>
            Number(
              meal.mealTypeTimingsId
            )
        )
      );
    }
  };

  // ============================================================
  // PRICE DROP TYPE CHANGE
  // ============================================================

  const handlePricingTypeChange = (e) => {
    const value = e.target.value;

    setPricingType(value);

    // Clear amount when type changes
    setOfferAmount("");
  };

  // ============================================================
  // OFFER AMOUNT CHANGE
  // ============================================================

  const handleOfferAmountChange = (e) => {
    const value = e.target.value;

    // Allow only numbers and decimal
    if (
      value === "" ||
      /^\d*\.?\d*$/.test(value)
    ) {
      setOfferAmount(value);
    }
  };

  // ============================================================
  // PLAN CHANGE
  // ============================================================

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);

    // Reset dates
    setStartDate("");
    setEndDate("");

    // Reset meal types
    setMealTypeTimings([]);
    setSelectedMealTypeTimingIds([]);

    // Reset pricing
    setPricingType("FLAT");
    setOfferAmount("");
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = async () => {
    // ==========================================================
    // VALIDATIONS
    // ==========================================================

    if (!selectedState) {
      alert("Please select a state.");
      return;
    }

    if (!selectedCity) {
      alert("Please select a city.");
      return;
    }

    if (!selectedArea) {
      alert("Please select an area.");
      return;
    }

    if (!selectedOutlet) {
      alert("Please select an outlet.");
      return;
    }

    if (!selectedPlan) {
      alert(
        "Please select an advertisement plan."
      );
      return;
    }

    if (!startDate) {
      alert("Please select a start date.");
      return;
    }

    if (!endDate) {
      alert("Please select an end date.");
      return;
    }

    if (
      selectedMealTypeTimingIds.length === 0
    ) {
      alert(
        "Please select at least one meal type slot."
      );
      return;
    }

    if (
      offerAmount === "" ||
      offerAmount === null ||
      Number(offerAmount) < 0
    ) {
      alert(
        "Please enter a valid offer amount."
      );
      return;
    }

    // ==========================================================
    // USER DATA
    // ==========================================================

    let userData = {};

    try {
      userData = JSON.parse(
        localStorage.getItem("userData") ||
          "{}"
      );
    } catch (error) {
      console.error(
        "Unable to parse userData:",
        error
      );
    }

    // ==========================================================
    // USER ID
    // ==========================================================

    const userId = Number(
      userData?.userId
    );

    if (!userId) {
      alert(
        "User information not found. Please login again."
      );
      return;
    }

    // ==========================================================
    // FINAL PAYLOAD
    // ==========================================================
    //
    // IMPORTANT:
    //
    // Do NOT send:
    //
    // subscriptionFromDate
    // subscriptionToDate
    // bannerFromDate
    // bannerToDate
    //
    // because the backend DTO does not accept those fields.
    //
    // ==========================================================

    const payload = {
      outletId: Number(
        selectedOutlet
      ),

      subscriptionPlanId: Number(
        selectedPlan.subscriptionPlanId
      ),

      bannerSlotDaysId: Number(
        selectedPlan.bannerDurationInDays
      ),

      mealTypeTimingsIds:
        selectedMealTypeTimingIds.map(
          (id) => Number(id)
        ),

      priceModelType: pricingType,

      offerAmount: Number(
        offerAmount
      ),

      userId: userId,
    };

    // ==========================================================
    // DEBUG PAYLOAD
    // ==========================================================

    console.log(
      "=========================================="
    );

    console.log(
      "SAVE ADVERTISEMENT PAYLOAD"
    );

    console.log(
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "=========================================="
    );

    // ==========================================================
    // SAVE API
    // ==========================================================

    try {
      const response = await API.post(
        "/api/fm/outlet-subscription-plans",
        payload
      );

      console.log(
        "Save Response:",
        response.data
      );

      alert(
        response.data?.message ||
          "Successfully saved!"
      );

      // ========================================================
      // RESET AFTER SUCCESS
      // ========================================================

      setSelectedMealTypeTimingIds([]);

      setPricingType("FLAT");

      setOfferAmount("");
    } catch (error) {
      console.error(
        "Save advertisement error:",
        error
      );

      console.error(
        "Backend error response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Unable to save advertisement outlet."
      );
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    setStartDate("");
    setEndDate("");

    setMealTypeTimings([]);
    setSelectedMealTypeTimingIds([]);

    setPricingType("FLAT");
    setOfferAmount("");
  };

  // ============================================================
  // OUTLET OPTIONS
  // ============================================================

  const outletOptions = outlets.map(
    (outlet) => ({
      value: Number(
        outlet.outletId
      ),
      label:
        outlet.outletName,
    })
  );

  // ============================================================
  // PROGRESS STEPS (purely presentational)
  // ============================================================

  const progressSteps = [
    { label: "Location & Outlet", done: Boolean(selectedOutlet) },
    { label: "Plan", done: Boolean(selectedPlan) },
    { label: "Schedule", done: Boolean(startDate && endDate) },
    { label: "Meal Slots", done: selectedMealTypeTimingIds.length > 0 },
    { label: "Pricing", done: offerAmount !== "" },
  ];

  const currentStepIndex = progressSteps.findIndex(
    (step) => !step.done
  );

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="advertisement-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <div>

          <h2>
            Advertisement Outlets
          </h2>

          <p>
            Manage advertisement plans
            for outlets
          </p>

        </div>

      </div>

      {/* ======================================================
          PROGRESS TRAIL
      ====================================================== */}

      <div className="ad-progress">

        {progressSteps.map((step, index) => {
          const isComplete = step.done;
          const isCurrent =
            !isComplete && index === currentStepIndex;

          return (
            <div
              key={step.label}
              style={{ display: "contents" }}
            >
              <div
                className={`ad-progress-step ${
                  isComplete ? "is-complete" : ""
                } ${isCurrent ? "is-current" : ""}`}
              >
                <span className="ad-progress-dot" />
                <span className="ad-progress-label">
                  {step.label}
                </span>
              </div>

              {index < progressSteps.length - 1 && (
                <span className="ad-progress-rule" />
              )}
            </div>
          );
        })}

      </div>

      {/* ======================================================
          OUTLET REGISTRATION
      ====================================================== */}

      <div className="advertisement-card">

        <h3>
          <span className="ad-card-badge">1</span>
          Advertisement Outlet Registration
        </h3>

        <div className="form-grid">

          {/* ==================================================
              STATE
          ================================================== */}

          <div className="form-group">

            <label>
              State{" "}
              <span className="required-star">
                *
              </span>
            </label>

            <select
              value={selectedState}
              onChange={
                handleStateChange
              }
            >

              <option value="">
                Select State
              </option>

              {states.map(
                (state) => (

                  <option
                    key={
                      state.stateId
                    }
                    value={
                      state.stateId
                    }
                  >
                    {
                      state.stateName
                    }
                  </option>

                )
              )}

            </select>

          </div>

          {/* ==================================================
              CITY
          ================================================== */}

          <div className="form-group">

            <label>
              City{" "}
              <span className="required-star">
                *
              </span>
            </label>

            <select
              value={selectedCity}
              onChange={
                handleCityChange
              }
              disabled={!selectedState}
            >

              <option value="">
                Select City
              </option>

              {cities.map(
                (city) => (

                  <option
                    key={
                      city.cityId
                    }
                    value={
                      city.cityId
                    }
                  >
                    {
                      city.cityName
                    }
                  </option>

                )
              )}

            </select>

          </div>

          {/* ==================================================
              AREA
          ================================================== */}

          <div className="form-group">

            <label>
              Area{" "}
              <span className="required-star">
                *
              </span>
            </label>

            <select
              value={selectedArea}
              onChange={
                handleAreaChange
              }
              disabled={!selectedCity}
            >

              <option value="">
                Select Area
              </option>

              {areas.map(
                (area) => (

                  <option
                    key={
                      area.areaId
                    }
                    value={
                      area.areaId
                    }
                  >
                    {
                      area.areaName
                    }
                  </option>

                )
              )}

            </select>

          </div>

          {/* ==================================================
              OUTLET
          ================================================== */}

          <div className="form-group">

            <label>
              Outlet{" "}
              <span className="required-star">
                *
              </span>
            </label>

            <Select
              className="ad-select-outlet"
              classNamePrefix="ad-select"
              options={
                outletOptions
              }
              placeholder="Select Outlet"
              value={
                outletOptions.find(
                  (option) =>
                    option.value ===
                    Number(
                      selectedOutlet
                    )
                ) || null
              }
              onMenuOpen={
                fetchOutlets
              }
              onChange={(
                selectedOption
              ) =>
                setSelectedOutlet(
                  selectedOption
                    ? Number(
                        selectedOption.value
                      )
                    : ""
                )
              }
              isSearchable
            />

          </div>

        </div>

      </div>

      {/* ======================================================
          ADVERTISEMENT PLANS
      ====================================================== */}

      {selectedArea &&
        plans.length > 0 && (

          <div className="advertisement-card">

            <h3>
              <span className="ad-card-badge">2</span>
              Available Advertisement Plans
            </h3>

            <div className="plans-table-wrapper">

              <table className="plans-table">

                <thead>

                  <tr>

                    <th>
                      Select
                    </th>

                    <th>
                      Plan Name
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Duration (Days)
                    </th>

                    <th>
                      Radius (KM)
                    </th>

                    <th>
                      Banner Duration Days
                    </th>

                    <th>
                      Banner Slots
                    </th>

                    <th>
                      Best Restaurant Slot
                    </th>

                    <th>
                      Deals Slot
                    </th>

                    <th>
                      WhatsApp Broadcast
                    </th>

                    <th>
                      Video Credits
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {plans.map(
                    (plan) => {

                      const isSelected =
                        selectedPlan?.subscriptionPlanId ===
                        plan.subscriptionPlanId;

                      return (

                        <tr
                          key={
                            plan.subscriptionPlanId
                          }
                          className={
                            isSelected
                              ? "selected-plan-row"
                              : ""
                          }
                          onClick={() =>
                            handlePlanChange(plan)
                          }
                        >

                          <td>

                            <span className="plan-radio">
                              <input
                                type="radio"
                                name="selectedPlan"
                                checked={
                                  isSelected
                                }
                                onChange={() =>
                                  handlePlanChange(
                                    plan
                                  )
                                }
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              />
                              <span className="plan-radio-mark" />
                            </span>

                          </td>

                          <td>
                            {
                              plan.planName
                            }
                          </td>

                          <td className="plan-price">
                            {
                              plan.price
                            }
                          </td>

                          <td>
                            {
                              plan.durationInDays
                            }
                          </td>

                          <td>
                            {
                              plan.radiusInKms
                            }
                          </td>

                          <td>
                            {
                              plan.bannerDurationInDays
                            }
                          </td>

                          <td>
                            {
                              plan.bannerSlot
                            }
                          </td>

                          <td>
                            {
                              plan.bestRestaurantSlot
                            }
                          </td>

                          <td>
                            {
                              plan.dealsSlot
                            }
                          </td>

                          <td>
                            {
                              plan.whatsappBroadcast
                            }
                          </td>

                          <td>
                            {
                              plan.videoCredits
                            }
                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      {/* ======================================================
          DATES
      ====================================================== */}

      {selectedPlan && (

        <>

          <div className="advertisement-bottom-grid">

            <div className="advertisement-card">

              <h3>
                <span className="ad-card-badge">3</span>
                Advertisement Dates
              </h3>

              <div className="form-grid">

                {/* ============================================
                    START DATE
                ============================================ */}

                <div className="form-group">

                  <label>
                    Start Date{" "}
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={
                      handleStartDateChange
                    }
                  />

                </div>

                {/* ============================================
                    END DATE
                ============================================ */}

                <div className="form-group">

                  <label>
                    End Date{" "}
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    min={
                      startDate ||
                      today
                    }
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              MEAL TYPE SLOTS
          ================================================== */}

          {startDate && (

            <div className="advertisement-card meal-type-card">

              {/* ==============================================
                  HEADER
              ============================================== */}

              <div className="meal-type-header">

                <h3>
                  <span className="ad-card-badge">4</span>
                  Meal Type Slots
                </h3>

                {/* SELECT ALL */}

                {mealTypeTimings.length >
                  0 && (

                  <label className="select-all-pill">

                    <input
                      type="checkbox"
                      checked={
                        selectedMealTypeTimingIds.length ===
                          mealTypeTimings.length &&
                        mealTypeTimings.length >
                          0
                      }
                      onChange={
                        handleSelectAllMealTypes
                      }
                    />

                    Select All

                  </label>

                )}

              </div>

              {/* ==============================================
                  LOADING
              ============================================== */}

              {loadingMealTypes && (

                <div className="meal-type-loading-state">
                  Loading meal type
                  slots...
                </div>

              )}

              {/* ==============================================
                  NO DATA
              ============================================== */}

              {!loadingMealTypes &&
                mealTypeTimings.length ===
                  0 && (

                <div className="meal-type-empty-state">
                  No meal type slots
                  available.
                </div>

              )}

              {/* ==============================================
                  MEAL TYPE LIST
              ============================================== */}

              {!loadingMealTypes &&
                mealTypeTimings.length >
                  0 && (

                <div className="meal-type-grid">

                  {mealTypeTimings.map(
                    (meal) => {

                      const mealId =
                        Number(
                          meal.mealTypeTimingsId
                        );

                      const isSelected =
                        selectedMealTypeTimingIds.includes(
                          mealId
                        );

                      return (

                        <div
                          key={
                            mealId
                          }
                          className={`meal-type-chip ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            handleMealTypeSelection(
                              mealId
                            )
                          }
                        >

                          {/* MEAL NAME */}

                          <div className="meal-type-chip-head">

                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleMealTypeSelection(
                                  mealId
                                )
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            />

                            <span className="meal-type-chip-name">
                              {
                                meal.mealType
                              }
                            </span>

                          </div>

                          {/* TIME */}

                          <div className="meal-type-chip-time">

                            {
                              meal.fromTime
                            }

                            {" – "}

                            {
                              meal.toTime
                            }

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

              {/* ==============================================
                  SELECTED COUNT
              ============================================== */}

              {!loadingMealTypes &&
                mealTypeTimings.length >
                  0 && (

                <div className="meal-type-selected-count">

                  Selected Meal Slots:{" "}

                  {
                    selectedMealTypeTimingIds.length
                  }

                </div>

              )}

            </div>

          )}

          {/* ==================================================
              PRICE DROP DETAILS
          ================================================== */}

          {selectedMealTypeTimingIds.length >
            0 && (

            <div
              className="advertisement-card"
              style={{
                marginTop:
                  "20px",
              }}
            >

              <h3>
                <span className="ad-card-badge">5</span>
                Price Drop Details
              </h3>

              <div className="form-grid">

                {/* ==========================================
                    PRICE DROP TYPE
                ========================================== */}

                <div className="form-group">

                  <label>
                    Price Drop Type{" "}
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <select
                    value={
                      pricingType
                    }
                    onChange={
                      handlePricingTypeChange
                    }
                  >

                    <option value="FLAT">
                      Flat
                    </option>

                    <option value="PERCENTAGE">
                      Percentage
                    </option>

                  </select>

                </div>

                {/* ==========================================
                    OFFER AMOUNT
                ========================================== */}

                <div className="form-group">

                  <label>
                    Offer Amount{" "}
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={
                      pricingType ===
                      "PERCENTAGE"
                        ? "Enter percentage"
                        : "Enter amount"
                    }
                    value={
                      offerAmount
                    }
                    onChange={
                      handleOfferAmountChange
                    }
                  />

                  {pricingType ===
                    "PERCENTAGE" && (

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#847A73",
                      }}
                    >
                      Enter percentage
                      value
                    </small>

                  )}

                </div>

              </div>

            </div>

          )}

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="advertisement-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={
                handleCancel
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={
                handleSave
              }
            >
              Save
            </button>

          </div>

        </>

      )}

    </div>
  );
}

export default AdvertisementOutlets;
