export const menuData = [
  {
    title: "LIVE MONITORING",
    permission: "DRIVER_READ",
    items: [
      {
        name: "Live Tracking",
        children: [
          {
            name: "Driver Tracking",
            permission: "DRIVER_READ",
          },
          {
            name: "Restaurant Tracking",
            permission: "RESTAURANT_READ",
          },
        ],
      },
    ],
  },

  {
    title: "ZONE MANAGEMENT",
    permission: "ZONE_READ",
    items: [
      {
        name: "Zone Management",
        children: [
          {
            name: "Zone Management",
            pageKey: "zones",
            permission: "ZONE_READ",
          },
        ],
      },
    ],
  },

  {
    title: "ACCESS MANAGEMENT",
    permission: "ROLE_READ",
    items: [
      {
        name: "Access Control",
        children: [
          {
            name: "Roles",
            pageKey: "roles",
            permission: "ROLE_READ",
          },
          {
            name: "Admin Users",
            pageKey: "adminUsers",
            permission: "ADMIN_USER_READ",
          },
        ],
      },
    ],
  },

  {
    title: "CUSTOMER & VENDOR MANAGEMENT",
    permission: "CUSTOMER_READ",
    items: [
      {
        name: "Users / Customers",
        pageKey: "usersCustomers",
        permission: "CUSTOMER_READ",
      },
      {
        name: "Owners / Vendors",
        children: [
          {
            name: "All Vendors",
            permission: "VENDOR_READ",
          },
          {
            name: "Approved Vendors",
            permission: "VENDOR_READ",
          },
          {
            name: "Approval Pending Vendors",
            permission: "VENDOR_READ",
          },
        ],
      },
    ],
  },

  {
    title: "MERCHANT & DRIVER MANAGEMENT",
    permission: "RESTAURANT_READ",
    items: [
      {
        name: "Merchants",
        permission: "RESTAURANT_READ",
        children: [
          {
            name: "All Merchants",
            pageKey: "outlets",
            permission: "RESTAURANT_READ",
          },
          {
            name: "Add Variants",
            pageKey: "merchantAddVariants",
            permission: "RESTAURANT_READ",
          },
        ],
      },
      // {
      //   name: "Marts",
      //   permission: "RESTAURANT_READ",
      // },
      // {
      //   name: "Drivers",
      //   children: [
      //     {
      //       name: "All Drivers",
      //       permission: "DRIVER_READ",
      //     },
      //     {
      //       name: "Approved Drivers",
      //       permission: "DRIVER_READ",
      //     },
      //     {
      //       name: "Approval Pending Drivers",
      //       permission: "DRIVER_READ",
      //     },
      //   ],
      // },
      {
        name: "Drivers",
        children: [
          {
            name: "All Drivers",
            permission: "DRIVER_READ",
          },
          {
            name: "Approved Drivers",
            permission: "DRIVER_READ",
          },
          {
            name: "Approval Pending Drivers",
            permission: "DRIVER_READ",
          },
        ],
      },
    ],
  },

  // {
  //   title: "MERCHANT & DRIVER MANAGEMENT",
  //   permission: "RESTAURANT_READ",
  //   items: [
  //     {
  //       name: "Merchants",
  //       pageKey: "outlets",   // Opens Outlets.jsx
  //       permission: "RESTAURANT_READ",
  //     },

  //   ],
  // },

  {
    title: "RESTAURANT & DRIVER MANAGEMENT",
    permission: "RESTAURANT_READ",
    items: [
      {
        name: "OUTLETS",
        permission: "RESTAURANT_READ",
      },
      // {
      //   name: "Marts",
      //   permission: "RESTAURANT_READ",
      // },
      {
        name: "Drivers",
        children: [
          {
            name: "All Drivers",
            pageKey: "allDrivers",
            permission: "DRIVER_READ",
          },
          {
            name: "Approved Drivers",
            permission: "DRIVER_READ",
          },
          {
            name: "Approval Pending Drivers",
            permission: "DRIVER_READ",
          },
        ],
      },
    ],
  },

  {
    title: "MENU & FOOD MANAGEMENT",
    permission: "RESTAURANT_READ",
    items: [
      // {
      //   name: "Cuisines",
      //   permission: "RESTAURANT_READ",
      // },
      {
        name: "Categories",
        pageKey: "categories",
        permission: "CATEGORY_READ",
      },
      {
        name: "Foods",
        permission: "RESTAURANT_READ",
      },
      {
        name: "Master Products",
        pageKey: "masterProducts",
        permission: "RESTAURANT_READ",
      },
      // {
      //   name: "Compare File",
      //   pageKey: "compareFile",
      //   permission: "RESTAURANT_READ",
      // },
      // {
      //   name: "Mart Categories",
      //   permission: "RESTAURANT_READ",
      // },
      // {
      //   name: "Mart Items",
      //   permission: "RESTAURANT_READ",
      // },
      {
        name: "Attributes",
        children: [
          {
            name: "Food Attributes",
            permission: "RESTAURANT_READ",
          },
          {
            name: "Review Attributes",
            permission: "RESTAURANT_READ",
          },
        ],
      },
      {
        name: "Menu Periods",
        permission: "RESTAURANT_READ",
      },
    ],
  },
  {
    title: "PROMOTIONS & OFFERS",
    permission: "PROMOTION_READ",
    items: [
      {
        name: "Promotions",
        children: [
          {
            name: "Advertisement Outlets",
            pageKey: "advertisementOutlets",
            permission: "PROMOTION_READ",
          },
          {
            name: "Banner Designer",
            pageKey: "bannerDesigner",
            permission: "PROMOTION_READ",
          },
          {
            name: "Plan Campaign",
            pageKey: "planCampaign",
            permission: "PROMOTION_READ",
          },
        ],
      },
      {
        name: "Gift Cards",
        pageKey: "giftCards",
        permission: "PROMOTION_READ",
      },
    ],
  },
  {
    title: "PRICE MANAGEMENT",
    permission: "PROMOTION_READ",
    items: [
      {
        name: "Price Updates",
        children: [
          {
            name: "Product Price Update",
            pageKey: "productPriceUpdate",
            permission: "PROMOTION_READ",
          },
        ],
      },
    ],
  },

  {
    title: "BUSINESS SETUP",
    permission: "SUBSCRIPTION_READ",
    items: [
      {
        name: "Subscription Plan",
        children: [
          {
            name: "Subscription Plan",
            permission: "SUBSCRIPTION_READ",
          },
          {
            name: "Vendor Subscription History",
            permission: "SUBSCRIPTION_READ",
          },
        ],
      },
    ],
  },

  {
    title: "REPORT & ANALYTICS",
    permission: "PAYMENT_READ",
    items: [
      {
        name: "Settlement Reports",
        children: [
          {
            name: "Merchant Settlement",
            permission: "PAYMENT_READ",
          },
          {
            name: "Driver Settlement",
            permission: "PAYMENT_READ",
          },
        ],
      },
    ],
  },

  {
    title: "NOTIFICATION MANAGEMENT",
    permission: "NOTIFICATION_READ",
    items: [
      {
        name: "Notifications",
        children: [
          {
            name: "Send Notifications",
            permission: "NOTIFICATION_READ",
          },
          {
            name: "App Notifications",
            permission: "NOTIFICATION_READ",
          },
        ],
      },
    ],
  },

  {
    title: "APPROVAL MANAGEMENT",
    permission: "APPROVAL_READ",
    role: "ROLE_FLEET_MANAGER",
    items: [
      {
        name: "Approval Management",
        role: "ROLE_FLEET_MANAGER",
        children: [
          {
            name: "Assign Areas",
            pageKey: "assignAreas",
            permission: "APPROVAL_READ",
            excludeRole: "ROLE_FLEET_MANAGER",
          },
          {
            name: "Pending Approvals",
            pageKey: "pendingApprovals",
            permission: "APPROVAL_READ",
            role: "ROLE_FLEET_MANAGER",
          },
          {
            name: "Approval Settings",
            pageKey: "createApprovalSettings",
            permission: "APPROVAL_SETTINGS_READ",
            excludeRole: "ROLE_FLEET_MANAGER",
          },
          {
            name: "Approval Transactions",
            pageKey: "approvalTransactions",
            permission: "APPROVAL_READ",
            role: "ROLE_FLEET_MANAGER",
          },
        ],
      },
    ],
  },

  {
    title: "PAYMENT & TRANSACTIONS",
    permission: "PAYMENT_READ",
    items: [
      {
        name: "Payments",
        children: [
          {
            name: "Restaurant Payments",
            permission: "PAYMENT_READ",
          },
          {
            name: "Restaurant Payouts",
            permission: "PAYMENT_READ",
          },
          {
            name: "Driver Payments",
            permission: "PAYMENT_READ",
          },
          {
            name: "Driver Payouts",
            permission: "PAYMENT_READ",
          },
          {
            name: "Wallet Transactions",
            pageKey: "WalletTransactions",
            permission: "PAYMENT_READ",
          },
          {
            name: "Payout Requests",
            permission: "PAYMENT_READ",
          },
        ],
      },
    ],
  },

  {
    title: "SETTINGS & CONFIGURATIONS",
    permission: "SETTINGS_READ",
    items: [
      {
        name: "Settings",
        children: [
          // {
          //   name: "Global Settings",
          //   pageKey: "globalSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Currencies Settings",
          //   pageKey: "currenciesSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Payment Methods",
          //   pageKey: "paymentMethods",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Business Model Settings",
          //   pageKey: "businessModelSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Radius Configuration",
          //   pageKey: "radiusConfiguration",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "DINE IN Feature Settings",
          //   pageKey: "dineInFeatureSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Tax Settings",
          //   pageKey: "taxSettings",
          //   permission: "SETTINGS_READ",
          // },
          {
            name: "Driver Settings",
            pageKey: "driverSettings",
            permission: "SETTINGS_READ",
          },
          {
            name: "Delivery Charge",
            pageKey: "deliveryCharge",
            permission: "SETTINGS_READ",
          },

          // NEW SETTINGS
          {
            name: "Incentives",
            pageKey: "incentives",
            permission: "SETTINGS_READ",
          },
          // {
          //   name: "Delivery Charges",
          //   pageKey: "deliveryCharges",
          //   permission: "SETTINGS_READ",
          // },
          {
            name: "Wallet Settings",
            pageKey: "walletSettings",
            permission: "SETTINGS_READ",
          },
          {
            name: "Customer Wallet",
            pageKey: "CustomerWallet",
            permission: "SETTINGS_READ",
          },
          {
            name: "Order Settings",
            pageKey: "orderSettings",
            permission: "SETTINGS_READ",
          },
          {
            name: "Subscription Plan Settings",
            pageKey: "subscriptionPlanSettings",
            permission: "SETTINGS_READ",
          },

          // {
          //   name: "Mart Settings",
          //   pageKey: "martSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Surge Rules",
          //   pageKey: "surgeRules",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Coins Settings",
          //   pageKey: "coinsSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "App Settings",
          //   pageKey: "appSettings",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Document Verification",
          //   pageKey: "documentVerification",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Languages",
          //   pageKey: "languages",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Special Offer",
          //   pageKey: "specialOffer",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Terms and Conditions",
          //   pageKey: "termsAndConditions",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Privacy Policy",
          //   pageKey: "privacyPolicy",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Landing Page Template",
          //   pageKey: "landingPageTemplate",
          //   permission: "SETTINGS_READ",
          // },
          // {
          //   name: "Footer Template",
          //   pageKey: "footerTemplate",
          //   permission: "SETTINGS_READ",
          // },
        ],
      },
    ],
  },
];
