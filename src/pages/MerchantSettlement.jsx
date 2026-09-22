import React, { useMemo, useState } from "react";

import {
  FiCalendar,
  FiChevronDown,
  FiRefreshCw,
  FiFilter,
  FiUpload,
  FiDownload,
  FiCreditCard,
  FiShoppingBag,
  FiHome,
  FiFileText,
  FiArrowRight,
  FiSearch,
  FiTag,
  FiX,
  FiMapPin,
  FiPhone,
  FiActivity,
} from "react-icons/fi";

import "../styles/MerchantSettlement.css";


function MerchantSettlement() {

  /* =====================================================
     FILTER STATES
  ===================================================== */

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("Pending");

  const [year, setYear] = useState("2026");
  const [week, setWeek] = useState("");

  const [settlementStatus, setSettlementStatus] =
    useState("Open");


  /* =====================================================
     DETAILS MODAL STATES
  ===================================================== */

  const [selectedMerchant, setSelectedMerchant] =
    useState(null);

  const [selectedOutlet, setSelectedOutlet] =
    useState(null);

  const [orderSearch, setOrderSearch] =
    useState("");


  /* =====================================================
     MERCHANT DATA
     
     Each merchant can have MULTIPLE OUTLETS.
  ===================================================== */

  const merchants = [
    {
      id: 1,
      initials: "SF",
      name: "Sai Fast Foods",
      phone: "9640464690",
      status: "Pending",

      outlets: [
        {
          id: 101,
          name: "Ongole (Main Outlet)",
          address:
            "#12, Main Road, Ongole, Andhra Pradesh - 523001",
          contact: "9640464690",
          zone: "Ongole",
          gst: "Unaccepted",
          gstAccepted: false,
          active: true,

          orders: 1,
          merchantPrice: 0,
          promotionPrice: 0,
          totalPrice: 40,
          settlement: 40,

          orderDetails: [
            {
              date: "23/2/2026",
              orderId: "Jippy33001569",
              items:
                "Mini Bucket Biryani (5 pcs) x1",
              merchantPrice: 0,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 0,
            },

            {
              date: "23/2/2026",
              orderId: "Jippy33001577",
              items:
                "Wings Biryani (4 Pcs) x2",
              merchantPrice: 0,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 0,
            },

            {
              date: "24/2/2026",
              orderId: "Jippy33001582",
              items:
                "Mini Bucket Biryani (5 pcs) x1",
              merchantPrice: 475,
              promotionPrice: 475,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 475,
            },

            {
              date: "24/2/2026",
              orderId: "Jippy33001587",
              items:
                "Chicken 65 Biryani x1",
              merchantPrice: 169,
              promotionPrice: 169,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 169,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33001618",
              items:
                "Lollipop Biryani x2",
              merchantPrice: 338,
              promotionPrice: 338,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 338,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001621",
              items:
                "Chicken 65 Biryani x3",
              merchantPrice: 507,
              promotionPrice: 507,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 507,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001622",
              items:
                "Fry Piece Biryani (1 person) x1",
              merchantPrice: 0,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 0,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001625",
              items:
                "Chicken 65 Biryani x1",
              merchantPrice: 169,
              promotionPrice: 169,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 169,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001627",
              items:
                "Curry Biryani (1 person) x1",
              merchantPrice: 200,
              promotionPrice: 200,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001631",
              items:
                "Chicken 65 Biryani x1",
              merchantPrice: 0,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 0,
            },
          ],
        },

        {
          id: 102,
          name: "Chirala Outlet",
          address:
            "Main Road, Chirala, Andhra Pradesh - 523155",
          contact: "9640464690",
          zone: "Chirala",
          gst: "Accepted",
          gstAccepted: true,
          active: true,

          orders: 5,
          merchantPrice: 1200,
          promotionPrice: 100,
          totalPrice: 1300,
          settlement: 1200,

          orderDetails: [
            {
              date: "23/2/2026",
              orderId: "Jippy33001701",
              items:
                "Chicken Biryani x1",
              merchantPrice: 250,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 250,
            },

            {
              date: "24/2/2026",
              orderId: "Jippy33001702",
              items:
                "Chicken 65 Biryani x1",
              merchantPrice: 250,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },

            {
              date: "25/2/2026",
              orderId: "Jippy33001703",
              items:
                "Mutton Biryani x1",
              merchantPrice: 300,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 300,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33001704",
              items:
                "Chicken Fry x2",
              merchantPrice: 200,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 150,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001705",
              items:
                "Biryani Combo x1",
              merchantPrice: 200,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },
          ],
        },

        {
          id: 103,
          name: "Bapatla Outlet",
          address:
            "NH16 Road, Bapatla, Andhra Pradesh - 522101",
          contact: "9640464690",
          zone: "Bapatla",
          gst: "Accepted",
          gstAccepted: true,
          active: true,

          orders: 8,
          merchantPrice: 1800,
          promotionPrice: 150,
          totalPrice: 1950,
          settlement: 1800,

          orderDetails: [
            {
              date: "23/2/2026",
              orderId: "Jippy33001801",
              items:
                "Chicken Biryani x1",
              merchantPrice: 250,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 250,
            },

            {
              date: "24/2/2026",
              orderId: "Jippy33001802",
              items:
                "Chicken 65 x1",
              merchantPrice: 200,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 150,
            },

            {
              date: "25/2/2026",
              orderId: "Jippy33001803",
              items:
                "Special Biryani x1",
              merchantPrice: 300,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 300,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33001804",
              items:
                "Biryani Combo x1",
              merchantPrice: 250,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33001805",
              items:
                "Chicken Fry x1",
              merchantPrice: 200,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001806",
              items:
                "Mutton Biryani x1",
              merchantPrice: 300,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 250,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001807",
              items:
                "Chicken 65 x2",
              merchantPrice: 200,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001808",
              items:
                "Veg Biryani x1",
              merchantPrice: 100,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 100,
            },
          ],
        },

        {
          id: 104,
          name: "Guntur Outlet",
          address:
            "Brodipet Main Road, Guntur, Andhra Pradesh - 522002",
          contact: "9640464690",
          zone: "Guntur",
          gst: "Accepted",
          gstAccepted: true,
          active: true,

          orders: 4,
          merchantPrice: 900,
          promotionPrice: 100,
          totalPrice: 1000,
          settlement: 900,

          orderDetails: [
            {
              date: "24/2/2026",
              orderId: "Jippy33001901",
              items:
                "Chicken Biryani x1",
              merchantPrice: 300,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 300,
            },

            {
              date: "25/2/2026",
              orderId: "Jippy33001902",
              items:
                "Chicken 65 x1",
              merchantPrice: 200,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 150,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33001903",
              items:
                "Biryani Combo x1",
              merchantPrice: 250,
              promotionPrice: 50,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 200,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33001904",
              items:
                "Mutton Biryani x1",
              merchantPrice: 250,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 250,
            },
          ],
        },
      ],
    },


    {
      id: 2,
      initials: "MN",
      name: "Madina Nethi Dum Biryani",
      phone: "7993254649",
      status: "Pending",

      outlets: [
        {
          id: 201,
          name: "Ongole (Main Outlet)",
          address:
            "Kurnool Road, Ongole, Andhra Pradesh - 523001",
          contact: "7993254649",
          zone: "Ongole",
          gst: "Accepted",
          gstAccepted: true,
          active: true,

          orders: 3,
          merchantPrice: 0,
          promotionPrice: 0,
          totalPrice: 1030,
          settlement: 980,

          orderDetails: [
            {
              date: "24/2/2026",
              orderId: "Jippy33002001",
              items:
                "Chicken Biryani x1",
              merchantPrice: 350,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 350,
            },

            {
              date: "25/2/2026",
              orderId: "Jippy33002002",
              items:
                "Special Biryani x1",
              merchantPrice: 330,
              promotionPrice: 30,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 300,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33002003",
              items:
                "Chicken 65 x1",
              merchantPrice: 330,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 330,
            },
          ],
        },
      ],
    },


    {
      id: 3,
      initials: "RM",
      name: "Royal Mini Hindustan",
      phone: "9666222581",
      status: "Pending",

      outlets: [
        {
          id: 301,
          name: "Bapatla Outlet",
          address:
            "Main Market Road, Bapatla, Andhra Pradesh - 522101",
          contact: "9666222581",
          zone: "Bapatla",
          gst: "Unaccepted",
          gstAccepted: false,
          active: true,

          orders: 5,
          merchantPrice: 1175,
          promotionPrice: 0,
          totalPrice: 1175,
          settlement: 1175,

          orderDetails: [
            {
              date: "24/2/2026",
              orderId: "Jippy33003001",
              items:
                "Mini Biryani x1",
              merchantPrice: 250,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 250,
            },

            {
              date: "25/2/2026",
              orderId: "Jippy33003002",
              items:
                "Chicken Biryani x2",
              merchantPrice: 500,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 500,
            },

            {
              date: "26/2/2026",
              orderId: "Jippy33003003",
              items:
                "Mutton Biryani x1",
              merchantPrice: 425,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 425,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33003004",
              items:
                "Chicken 65 x1",
              merchantPrice: 0,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 0,
            },

            {
              date: "27/2/2026",
              orderId: "Jippy33003005",
              items:
                "Biryani Combo x1",
              merchantPrice: 0,
              promotionPrice: 0,
              jippyPercentage: "0%",
              gstPercentage: "0%",
              settlementAmount: 0,
            },
          ],
        },
      ],
    },


    {
      id: 4,
      initials: "BB",
      name: "Best Biryani House",
      phone: "9876543210",
      status: "Pending",

      outlets: [
        {
          id: 401,
          name: "Guntur Main Outlet",
          address:
            "Lakshmipuram Main Road, Guntur, Andhra Pradesh - 522007",
          contact: "9876543210",
          zone: "Guntur",
          gst: "Accepted",
          gstAccepted: true,
          active: true,

          orders: 12,
          merchantPrice: 2450,
          promotionPrice: 150,
          totalPrice: 2600,
          settlement: 2480,

          orderDetails: [],
        },
      ],
    },


    {
      id: 5,
      initials: "TK",
      name: "Tasty Kitchen",
      phone: "9123456780",
      status: "Pending",

      outlets: [
        {
          id: 501,
          name: "Tenali Outlet",
          address:
            "Railway Station Road, Tenali, Andhra Pradesh - 522201",
          contact: "9123456780",
          zone: "Tenali",
          gst: "Unaccepted",
          gstAccepted: false,
          active: true,

          orders: 8,
          merchantPrice: 980,
          promotionPrice: 50,
          totalPrice: 1030,
          settlement: 980,

          orderDetails: [],
        },
      ],
    },


    {
      id: 6,
      initials: "FC",
      name: "Food Court",
      phone: "9988776655",
      status: "Pending",

      outlets: [
        {
          id: 601,
          name: "Nellore Main Outlet",
          address:
            "Trunk Road, Nellore, Andhra Pradesh - 524001",
          contact: "9988776655",
          zone: "Nellore",
          gst: "Accepted",
          gstAccepted: true,
          active: true,

          orders: 15,
          merchantPrice: 3200,
          promotionPrice: 200,
          totalPrice: 3400,
          settlement: 3200,

          orderDetails: [],
        },
      ],
    },
  ];


  /* =====================================================
     FORMAT AMOUNT
  ===================================================== */

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };


  /* =====================================================
     GET MERCHANT TOTALS
     
     Merchant card totals are calculated from outlets.
  ===================================================== */

  const getMerchantTotals = (merchant) => {

    const outlets = merchant.outlets || [];

    return {
      orders: outlets.reduce(
        (sum, outlet) =>
          sum + Number(outlet.orders || 0),
        0
      ),

      merchantPrice: outlets.reduce(
        (sum, outlet) =>
          sum + Number(outlet.merchantPrice || 0),
        0
      ),

      promotionPrice: outlets.reduce(
        (sum, outlet) =>
          sum + Number(outlet.promotionPrice || 0),
        0
      ),

      totalPrice: outlets.reduce(
        (sum, outlet) =>
          sum + Number(outlet.totalPrice || 0),
        0
      ),

      settlement: outlets.reduce(
        (sum, outlet) =>
          sum + Number(outlet.settlement || 0),
        0
      ),
    };
  };


  /* =====================================================
     FILTER MERCHANTS
  ===================================================== */

  const filteredMerchants = useMemo(() => {

    return merchants.filter((merchant) => {

      const totals =
        getMerchantTotals(merchant);

      const zoneMatch =
        !zone ||
        merchant.outlets.some(
          (outlet) =>
            outlet.zone.toLowerCase() ===
            zone.toLowerCase()
        );

      const statusMatch =
        !status ||
        merchant.status === status;

      return (
        zoneMatch &&
        statusMatch &&
        totals
      );
    });

  }, [zone, status]);


  /* =====================================================
     SUMMARY CALCULATIONS
  ===================================================== */

  const totalOrders =
    filteredMerchants.reduce(
      (total, merchant) =>
        total +
        getMerchantTotals(merchant).orders,
      0
    );

  const totalSettlement =
    filteredMerchants.reduce(
      (total, merchant) =>
        total +
        getMerchantTotals(merchant).settlement,
      0
    );

  const totalRestaurants =
    filteredMerchants.reduce(
      (total, merchant) =>
        total +
        merchant.outlets.length,
      0
    );


  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const resetFilters = () => {

    setFromDate("");
    setToDate("");
    setZone("");
    setStatus("Pending");
    setYear("2026");
    setWeek("");
    setSettlementStatus("Open");
  };


  const handleFilter = () => {

    console.log(
      "Settlement filters:",
      {
        fromDate,
        toDate,
        zone,
        status,
        year,
        week,
        settlementStatus,
      }
    );
  };


  const handleRefresh = () => {

    console.log(
      "Refreshing merchant settlements..."
    );
  };


  /* =====================================================
     IMPORT PAYMENT SHEET
  ===================================================== */

  const handleImport = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    console.log(
      "Payment sheet selected:",
      file.name
    );

    alert(
      `Payment sheet "${file.name}" selected successfully.`
    );

    event.target.value = "";
  };


  /* =====================================================
     EXPORT MERCHANT SETTLEMENT
  ===================================================== */

  const handleExport = () => {

    const headers = [
      "Merchant",
      "Outlet",
      "Phone",
      "Zone",
      "GST",
      "Orders",
      "Merchant Price",
      "Promotion Price",
      "Total Price",
      "Settlement",
      "Status",
    ];

    const rows = [];

    filteredMerchants.forEach(
      (merchant) => {

        merchant.outlets.forEach(
          (outlet) => {

            rows.push([
              merchant.name,
              outlet.name,
              outlet.contact,
              outlet.zone,
              outlet.gst,
              outlet.orders,
              outlet.merchantPrice,
              outlet.promotionPrice,
              outlet.totalPrice,
              outlet.settlement,
              merchant.status,
            ]);

          }
        );

      }
    );


    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      ),
    ].join("\n");


    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );


    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "merchant-settlement.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  /* =====================================================
     BULK PAYMENT
  ===================================================== */

  const handleBulkPayment = () => {

    if (
      filteredMerchants.length === 0
    ) {

      alert(
        "No merchants available for payment."
      );

      return;
    }

    alert(
      `Process bulk payment for ${filteredMerchants.length} merchant(s).`
    );
  };


  /* =====================================================
     OPEN DETAILS
     
     IMPORTANT:
     First outlet is selected automatically.
  ===================================================== */

  const handleDetails = (merchant) => {

    setSelectedMerchant(merchant);

    const firstOutlet =
      merchant.outlets?.[0] || null;

    setSelectedOutlet(firstOutlet);

    setOrderSearch("");
  };


  /* =====================================================
     CLOSE DETAILS
  ===================================================== */

  const closeDetails = () => {

    setSelectedMerchant(null);

    setSelectedOutlet(null);

    setOrderSearch("");
  };


  /* =====================================================
     CHANGE OUTLET
  ===================================================== */

  const handleOutletChange = (event) => {

    if (!selectedMerchant) {
      return;
    }

    const outletId =
      Number(event.target.value);

    const outlet =
      selectedMerchant.outlets.find(
        (item) =>
          item.id === outletId
      );

    if (!outlet) {
      return;
    }

    setSelectedOutlet(outlet);

    setOrderSearch("");
  };


  /* =====================================================
     CURRENT OUTLET ORDERS
  ===================================================== */

  const currentOrders =
    selectedOutlet?.orderDetails || [];


  /* =====================================================
     FILTER CURRENT OUTLET ORDERS
  ===================================================== */

  const filteredOrders =
    currentOrders.filter(
      (order) => {

        const search =
          orderSearch
            .trim()
            .toLowerCase();

        if (!search) {
          return true;
        }

        return (
          order.orderId
            .toLowerCase()
            .includes(search) ||
          order.items
            .toLowerCase()
            .includes(search)
        );
      }
    );


  /* =====================================================
     EXPORT SELECTED OUTLET ORDERS
  ===================================================== */

  const handleOrderExport = () => {

    if (
      !selectedMerchant ||
      !selectedOutlet
    ) {
      return;
    }


    const headers = [
      "DATE",
      "ORDER ID",
      "ITEMS",
      "MERCHANT PRICE",
      "PROMOTION PRICE",
      "JIPPY %",
      "GST %",
      "SETTLEMENT AMOUNT",
    ];


    const rows =
      currentOrders.map(
        (order) => [
          order.date,
          order.orderId,
          order.items,
          order.merchantPrice,
          order.promotionPrice,
          order.jippyPercentage,
          order.gstPercentage,
          order.settlementAmount,
        ]
      );


    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      ),
    ].join("\n");


    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );


    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${selectedMerchant.name
        .replace(/\s+/g, "-")
        .toLowerCase()}-${selectedOutlet.name
        .replace(/\s+/g, "-")
        .toLowerCase()}-orders.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  /* =====================================================
     JSX
  ===================================================== */

  return (
    <div className="merchant-settlement-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="merchant-page-header">

        <div className="merchant-title-section">

          <div className="merchant-title-icon">
            <FiCreditCard />
          </div>

          <div>

            <h1>
              Merchant Settlement
            </h1>

            <p>
              Manage restaurant settlements,
              view earnings and process payments
            </p>

          </div>

        </div>


        <div className="merchant-breadcrumb">

          <span>
            Dashboard
          </span>

          <span className="breadcrumb-arrow">
            ›
          </span>

          <strong>
            Merchant Settlement
          </strong>

        </div>

      </div>


      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="merchant-filter-container">

        <div className="date-filter-group">

          <div className="date-input-box">

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
            />

            <FiCalendar />

          </div>

          <span className="date-to">
            to
          </span>

          <div className="date-input-box">

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
            />

            <FiCalendar />

          </div>

        </div>


        <button
          type="button"
          className="merchant-filter-btn"
          onClick={handleFilter}
        >

          <FiFilter />

          Filter

        </button>


        <button
          type="button"
          className="merchant-reset-btn"
          onClick={resetFilters}
        >

          <FiRefreshCw />

          Reset

        </button>


        <div className="zone-select-box">

          <select
            value={zone}
            onChange={(e) =>
              setZone(e.target.value)
            }
          >

            <option value="">
              Select Zone
            </option>

            <option value="Ongole">
              Ongole
            </option>

            <option value="Chirala">
              Chirala
            </option>

            <option value="Bapatla">
              Bapatla
            </option>

            <option value="Guntur">
              Guntur
            </option>

            <option value="Tenali">
              Tenali
            </option>

            <option value="Nellore">
              Nellore
            </option>

          </select>

          <FiChevronDown />

        </div>


        <div className="status-radio-group">

          <label className="status-radio">

            <input
              type="radio"
              name="merchant-status"
              value="Pending"
              checked={
                status === "Pending"
              }
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            />

            <span>
              Pending
            </span>

          </label>


          <label className="status-radio">

            <input
              type="radio"
              name="merchant-status"
              value="Settled"
              checked={
                status === "Settled"
              }
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            />

            <span>
              Settled
            </span>

          </label>

        </div>


        <div className="filter-action-buttons">

          <label className="import-payment-btn">

            <FiUpload />

            Import Payment Sheet

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={handleImport}
            />

          </label>


          <button
            type="button"
            className="export-excel-btn"
            onClick={handleExport}
          >

            <FiDownload />

            Export to Excel

          </button>


          <button
            type="button"
            className="bulk-payment-btn"
            onClick={
              handleBulkPayment
            }
          >

            <FiCreditCard />

            Process Bulk Payment

          </button>

        </div>

      </div>


      {/* =================================================
          SETTLEMENT WEEK
      ================================================= */}

      <div className="settlement-week-container">

        <div className="settlement-week-title">

          Select Settlement Week ({year})

        </div>


        <div className="settlement-week-controls">

          <div className="year-select-box">

            <select
              value={year}
              onChange={(e) =>
                setYear(e.target.value)
              }
            >

              <option value="2026">
                2026
              </option>

              <option value="2025">
                2025
              </option>

              <option value="2024">
                2024
              </option>

            </select>

            <FiChevronDown />

          </div>


          <div className="week-select-box">

            <select
              value={week}
              onChange={(e) =>
                setWeek(e.target.value)
              }
            >

              <option value="">
                -- Select Week --
              </option>

              <option value="week-1">
                2026-01-01 - 2026-01-07
              </option>

              <option value="week-2">
                2026-02-23 - 2026-03-01
              </option>

              <option value="week-3">
                2026-03-02 - 2026-03-08
              </option>

              <option value="week-4">
                2026-03-09 - 2026-03-15
              </option>

            </select>

            <FiChevronDown />

          </div>

        </div>

      </div>


      {/* =================================================
          SETTLEMENT SUMMARY
      ================================================= */}

      <div className="settlement-summary-container">

        <div className="summary-week-icon">
          <FiCalendar />
        </div>


        <div className="summary-week-info">

          <span>
            Settlement Week
          </span>

          <strong>
            2026-02-23 - 2026-03-01
          </strong>

          <small>
            Settlement Date: 2026-03-06
          </small>

        </div>


        <div className="summary-divider" />


        <div className="summary-stat">

          <div className="summary-stat-icon restaurant-icon">
            <FiHome />
          </div>

          <div>

            <strong>
              {totalRestaurants}
            </strong>

            <span>
              Restaurants
            </span>

          </div>

        </div>


        <div className="summary-divider" />


        <div className="summary-stat">

          <div className="summary-stat-icon order-icon">
            <FiShoppingBag />
          </div>

          <div>

            <strong>
              {totalOrders}
            </strong>

            <span>
              Orders
            </span>

          </div>

        </div>


        <div className="summary-divider" />


        <div className="summary-stat">

          <div className="summary-stat-icon money-icon">
            <FiCreditCard />
          </div>

          <div>

            <strong>
              {formatAmount(
                totalSettlement
              )}
            </strong>

            <span>
              To Settle
            </span>

          </div>

        </div>


        <div className="summary-status">

          <select
            value={settlementStatus}
            onChange={(e) =>
              setSettlementStatus(
                e.target.value
              )
            }
          >

            <option value="Open">
              Open
            </option>

            <option value="Closed">
              Closed
            </option>

          </select>

          <span>
            Settlement Status
          </span>

        </div>


        <button
          type="button"
          className="summary-refresh-btn"
          onClick={handleRefresh}
          title="Refresh"
        >

          <FiRefreshCw />

        </button>

      </div>


      {/* =================================================
          MERCHANT CARDS
      ================================================= */}

      <div className="merchant-card-grid">

        {filteredMerchants.map(
          (merchant) => {

            const totals =
              getMerchantTotals(
                merchant
              );

            return (

              <div
                className="merchant-settlement-card"
                key={merchant.id}
              >


                {/* CARD HEADER */}

                <div className="merchant-card-header">

                  <div className="merchant-avatar">
                    {merchant.initials}
                  </div>


                  <div className="merchant-basic-info">

                    <div className="merchant-name-row">

                      <h3>
                        {merchant.name}
                      </h3>

                      <span className="merchant-phone">
                        ({merchant.phone})
                      </span>

                    </div>


                    <div className="merchant-tags">

                      <span className="zone-tag">

                        {merchant.outlets.length === 1
                          ? merchant.outlets[0].zone
                          : `${merchant.outlets.length} Outlets`}

                      </span>


                      <span
                        className={`gst-tag ${
                          merchant.outlets.every(
                            (outlet) =>
                              outlet.gstAccepted
                          )
                            ? "gst-accepted"
                            : "gst-unaccepted"
                        }`}
                      >

                        {merchant.outlets.length === 1
                          ? merchant.outlets[0].gst
                          : "Multiple GST Status"}

                      </span>

                    </div>

                  </div>


                  <span className="merchant-pending-badge">

                    {merchant.status}

                  </span>

                </div>


                {/* ORDERS */}

                <div className="merchant-orders-row">

                  <span>

                    {totals.orders}{" "}

                    {totals.orders === 1
                      ? "Order"
                      : "Orders"}

                  </span>

                  <span className="order-separator">
                    |
                  </span>

                  <span>
                    0%
                  </span>

                </div>


                {/* PRICE GRID */}

                <div className="merchant-price-grid">

                  <div className="price-column merchant-price">

                    <span>
                      MERCHANT PRICE
                    </span>

                    <strong>
                      {formatAmount(
                        totals.merchantPrice
                      )}
                    </strong>

                  </div>


                  <div className="price-column promotion-price">

                    <span>
                      PROMOTION PRICE
                    </span>

                    <strong>
                      {formatAmount(
                        totals.promotionPrice
                      )}
                    </strong>

                  </div>


                  <div className="price-column total-price">

                    <span>
                      TOTAL PRICE
                    </span>

                    <strong>
                      {formatAmount(
                        totals.totalPrice
                      )}
                    </strong>

                  </div>


                  <div className="price-column settlement-price">

                    <span>
                      SETTLEMENT
                    </span>

                    <strong>
                      {formatAmount(
                        totals.settlement
                      )}
                    </strong>

                  </div>

                </div>


                {/* DETAILS BUTTON */}

                <button
                  type="button"
                  className="merchant-details-btn"
                  onClick={() =>
                    handleDetails(
                      merchant
                    )
                  }
                >

                  <FiFileText />

                  <span>
                    DETAILS
                  </span>

                  <FiArrowRight />

                </button>

              </div>

            );
          }
        )}

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {filteredMerchants.length === 0 && (

        <div className="merchant-empty-state">

          <FiHome />

          <h3>
            No Merchant Settlements Found
          </h3>

          <p>
            Try changing the selected
            zone or settlement status.
          </p>

        </div>

      )}


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedMerchant && selectedOutlet && (

        <div
          className="merchant-details-overlay"
          onClick={closeDetails}
        >

          <div
            className="merchant-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =========================================
                MODAL HEADER
            ========================================== */}

            <div className="details-modal-top">

              <div className="details-merchant-avatar">
                {selectedMerchant.initials}
              </div>


              <div className="details-merchant-heading">

                <h2>
                  Settlement Details
                </h2>


                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    marginTop: "5px",
                  }}
                >

                  <strong
                    style={{
                      color: "#17243b",
                      fontSize: "17px",
                    }}
                  >
                    {selectedMerchant.name}
                  </strong>

                  <span
                    style={{
                      color: "#657288",
                      fontSize: "12px",
                    }}
                  >
                    ({selectedMerchant.phone})
                  </span>


                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: "#dff6eb",
                      color: "#15936d",
                      fontSize: "10px",
                      fontWeight: "700",
                    }}
                  >
                    Active
                  </span>

                </div>


                {/* =====================================
                    OUTLET DROPDOWN
                ====================================== */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >

                  <span
                    style={{
                      color: "#657288",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Select Outlet:
                  </span>


                  <div
                    style={{
                      position: "relative",
                      width: "195px",
                      height: "35px",
                    }}
                  >

                    <FiMapPin
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "9px",
                        zIndex: 2,
                        color: "#287bd0",
                        fontSize: "16px",
                        pointerEvents: "none",
                      }}
                    />


                    <select
                      value={
                        selectedOutlet.id
                      }
                      onChange={
                        handleOutletChange
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        padding:
                          "0 30px 0 30px",
                        border:
                          "1px solid #cfd9e5",
                        borderRadius: "6px",
                        outline: "none",
                        appearance: "none",
                        background:
                          "#ffffff",
                        color: "#344258",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >

                      {selectedMerchant.outlets.map(
                        (outlet) => (

                          <option
                            key={outlet.id}
                            value={outlet.id}
                          >
                            {outlet.name}
                          </option>

                        )
                      )}

                    </select>


                    <FiChevronDown
                      style={{
                        position: "absolute",
                        right: "9px",
                        top: "9px",
                        color: "#526176",
                        pointerEvents: "none",
                      }}
                    />

                  </div>

                </div>

              </div>


              <button
                type="button"
                className="details-top-close"
                onClick={closeDetails}
                title="Close"
              >

                <FiX />

              </button>

            </div>


            {/* =========================================
                OUTLET STATUS TAGS
            ========================================== */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding:
                  "0 22px 10px",
              }}
            >

              <span
                className={
                  selectedOutlet.gstAccepted
                    ? "details-gst details-gst-accepted"
                    : "details-gst details-gst-unaccepted"
                }
              >

                GST -{" "}
                {selectedOutlet.gst}

              </span>


              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  background: "#fff0d8",
                  color: "#f18419",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                {selectedMerchant.status}
              </span>

            </div>


            {/* =========================================
                OUTLET SUMMARY
            ========================================== */}

            <div className="details-summary-grid">


              {/* ORDERS */}

              <div className="details-summary-box">

                <div className="details-summary-icon orders">
                  <FiShoppingBag />
                </div>

                <div>

                  <strong>
                    {selectedOutlet.orders}
                  </strong>

                  <span>
                    Total Orders
                  </span>

                </div>

              </div>


              {/* MERCHANT PRICE */}

              <div className="details-summary-box">

                <div className="details-summary-icon merchant">
                  <FiCalendar />
                </div>

                <div>

                  <strong>
                    {formatAmount(
                      selectedOutlet.merchantPrice
                    )}
                  </strong>

                  <span>
                    Merchant Price
                  </span>

                </div>

              </div>


              {/* PROMOTION */}

              <div className="details-summary-box">

                <div className="details-summary-icon promotion">
                  <FiTag />
                </div>

                <div>

                  <strong>
                    {formatAmount(
                      selectedOutlet.promotionPrice
                    )}
                  </strong>

                  <span>
                    Promotion Price
                  </span>

                </div>

              </div>


              {/* TOTAL */}

              <div className="details-summary-box">

                <div className="details-summary-icon total">
                  <FiShoppingBag />
                </div>

                <div>

                  <strong>
                    {formatAmount(
                      selectedOutlet.totalPrice
                    )}
                  </strong>

                  <span>
                    Total Price
                  </span>

                </div>

              </div>


              {/* SETTLEMENT */}

              <div className="details-summary-box">

                <div className="details-summary-icon settlement">
                  <FiCreditCard />
                </div>

                <div>

                  <strong>
                    {formatAmount(
                      selectedOutlet.settlement
                    )}
                  </strong>

                  <span>
                    Settlement Amount
                  </span>

                </div>

              </div>

            </div>


            {/* =========================================
                OUTLET INFORMATION
            ========================================== */}

            <div
              style={{
                margin:
                  "12px 20px 0",
                padding:
                  "11px 14px",
                display: "grid",
                gridTemplateColumns:
                  "2fr 1fr 1fr 1fr",
                alignItems: "center",
                gap: "12px",
                background:
                  "#f3f7fd",
                border:
                  "1px solid #dce6f1",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            >

              {/* ADDRESS */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  minWidth: 0,
                }}
              >

                <FiMapPin
                  style={{
                    color: "#287bd0",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >

                  <span
                    style={{
                      display: "block",
                      color: "#69768a",
                      fontSize: "10px",
                      marginBottom: "3px",
                    }}
                  >
                    Outlet Address
                  </span>

                  <strong
                    style={{
                      display: "block",
                      color: "#526075",
                      fontSize: "11px",
                      whiteSpace:
                        "nowrap",
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                    }}
                    title={
                      selectedOutlet.address
                    }
                  >
                    {selectedOutlet.address}
                  </strong>

                </div>

              </div>


              {/* CONTACT */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >

                <FiPhone
                  style={{
                    color: "#287bd0",
                    fontSize: "17px",
                  }}
                />

                <div>

                  <span
                    style={{
                      display: "block",
                      color: "#69768a",
                      fontSize: "10px",
                    }}
                  >
                    Contact
                  </span>

                  <strong
                    style={{
                      color: "#526075",
                      fontSize: "11px",
                    }}
                  >
                    {selectedOutlet.contact}
                  </strong>

                </div>

              </div>


              {/* ZONE */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >

                <FiActivity
                  style={{
                    color: "#287bd0",
                    fontSize: "17px",
                  }}
                />

                <div>

                  <span
                    style={{
                      display: "block",
                      color: "#69768a",
                      fontSize: "10px",
                    }}
                  >
                    Zone
                  </span>

                  <strong
                    style={{
                      color: "#526075",
                      fontSize: "11px",
                    }}
                  >
                    {selectedOutlet.zone}
                  </strong>

                </div>

              </div>


              {/* GST */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >

                <FiCreditCard
                  style={{
                    color: "#287bd0",
                    fontSize: "17px",
                  }}
                />

                <div>

                  <span
                    style={{
                      display: "block",
                      color: "#69768a",
                      fontSize: "10px",
                    }}
                  >
                    GST Status
                  </span>

                  <strong
                    style={{
                      color:
                        selectedOutlet.gstAccepted
                          ? "#16845d"
                          : "#e05247",
                      fontSize: "11px",
                    }}
                  >
                    {selectedOutlet.gst}
                  </strong>

                </div>

              </div>

            </div>


            {/* =========================================
                ORDER WISE DETAILS
            ========================================== */}

            <div className="order-wise-section">

              <div className="order-wise-header">

                <h3>
                  Order Wise Details (
                  {selectedOutlet.zone}
                  )
                </h3>


                <div className="order-wise-right">

                  <span className="total-records">

                    Total Records:{" "}
                    {currentOrders.length}

                  </span>


                  <div className="order-search-box">

                    <FiSearch />

                    <input
                      type="text"
                      placeholder="Search by Order ID or Item..."
                      value={orderSearch}
                      onChange={(e) =>
                        setOrderSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>


              {/* =====================================
                  ORDER TABLE
              ====================================== */}

              <div className="order-table-wrapper">

                <table className="order-details-table">

                  <thead>

                    <tr>

                      <th>
                        DATE
                      </th>

                      <th>
                        ORDER ID
                      </th>

                      <th>
                        ITEMS
                      </th>

                      <th>
                        MERCHANT PRICE
                      </th>

                      <th>
                        PROMOTION PRICE
                      </th>

                      <th>
                        JIPPY %
                      </th>

                      <th>
                        GST %
                      </th>

                      <th>
                        SETTLEMENT AMOUNT
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredOrders.map(
                      (order, index) => (

                        <tr
                          key={`${order.orderId}-${index}`}
                        >

                          <td>
                            {order.date}
                          </td>

                          <td className="order-id-cell">
                            {order.orderId}
                          </td>

                          <td className="order-items-cell">
                            {order.items}
                          </td>

                          <td>
                            {formatAmount(
                              order.merchantPrice
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              order.promotionPrice
                            )}
                          </td>

                          <td>
                            {order.jippyPercentage}
                          </td>

                          <td>
                            {order.gstPercentage}
                          </td>

                          <td className="order-settlement-cell">
                            {formatAmount(
                              order.settlementAmount
                            )}
                          </td>

                        </tr>

                      )
                    )}


                    {filteredOrders.length === 0 && (

                      <tr>

                        <td
                          colSpan="8"
                          className="no-order-results"
                        >
                          {currentOrders.length === 0
                            ? "No order details available for this outlet."
                            : "No order details found."}
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* =========================================
                MODAL FOOTER
            ========================================== */}

            <div className="details-modal-footer">

              <button
                type="button"
                className="details-export-btn"
                onClick={
                  handleOrderExport
                }
              >

                <FiDownload />

                Export to Excel

              </button>


              <button
                type="button"
                className="details-close-bottom-btn"
                onClick={closeDetails}
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default MerchantSettlement;