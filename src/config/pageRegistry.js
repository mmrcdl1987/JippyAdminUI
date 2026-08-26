import ZoneManagement from "../pages/ZoneManagement";
import CreateZone from "../pages/CreateZone";
import RolesPermissions from "../pages/RolesPermissions";
import AdminUsers from "../pages/AdminUsers";
import UsersCustomers from "../pages/UsersCustomers";
import CreateUser from "../pages/CreateUser";
import AdvertisementOutlets from "../pages/AdvertisementOutlets";
import BannerDesigner from "../pages/BannerDesigner";
import BannerDesignerEdit from "../pages/BannerDesignerEdit";
import PlanCampaign from "../pages/PlanCampaign";

import ProductPriceUpdate from "../pages/ProductPriceUpdate";
import Merchants from "../pages/Merchants/Merchants";
import EditMerchant from "../pages/Merchants/EditMerchant";
import ViewMerchant from "../pages/Merchants/ViewMerchant";

import AllMerchants from "../pages/AllMerchants";
import AllDrivers from "../pages/AllDrivers";
import MerchantsBulkUpload from "../pages/MerchantsBulkUpload";
import Categories from "../pages/Categories";
import CreateCategory from "../pages/CreateCategory";
import EditCategory from "../pages/EditCategory";
import MasterProducts from "../pages/MasterProducts";
import CompareFile from "../pages/CompareFile";
import EditMasterProduct from "../pages/EditMasterProduct";
import CreateMasterProduct from "../pages/CreateMasterProduct";

import Outlets from "../pages/Outlets";
import ViewOutlets from "../pages/ViewOutlets"; // Imported your merchant-specific outlet component
import CreateOutlet from "../pages/CreateOutlet";
import DeliveryCharge from "../pages/DeliveryCharge";
import Incentives from "../pages/Incentives";
import OrderSettings from "../pages/OrderSettings";
import WalletSettings from "../pages/WalletSettings";
import CustomerWallet from "../pages/CustomerWallet.jsx";
import WalletTransactions from "../pages/WalletTransactions.jsx";
import SubscriptionPlanSettings from "../pages/SubscriptionPlanSettings";
import CreateSubscriptionPlan from "../pages/CreateSubscriptionPlan";
import EditSubscriptionPlan from "../pages/EditSubscriptionPlan";
import ViewSubscriptionPlan from "../pages/ViewSubscriptionPlan";
import MerchantAddVariants from "../pages/MerchantAddVariants";
import DriverSettings from "../pages/DriverSettings";
import CreateMerchant from "../pages/Merchants/CreateMerchant";

export const pageRegistry = {
  zones: {
    component: ZoneManagement,
    permission: "ZONE_READ",
  },

  createZone: {
    component: CreateZone,
    permission: "ZONE_CREATE",
  },

  roles: {
    component: RolesPermissions,
    permission: "ROLE_READ",
  },

  adminUsers: {
    component: AdminUsers,
    permission: "ADMIN_USER_READ",
  },

  usersCustomers: {
    component: UsersCustomers,
    permission: "CUSTOMER_READ",
  },

  createUser: {
    component: CreateUser,
    permission: "CUSTOMER_CREATE",
  },

  outlets: {
    component: Merchants,
    permission: "RESTAURANT_READ",
  },

  editMerchant: {
    component: EditMerchant,
    permission: "RESTAURANT_UPDATE",
  },

  viewMerchant: {
    component: ViewMerchant,
    permission: "RESTAURANT_READ",
  },

  advertisementOutlets: {
    component: AdvertisementOutlets,    
    permission: "PROMOTION_READ",
  },

  bannerDesigner: {
    component: BannerDesigner,
    permission: "PROMOTION_READ",
  },
  
  bannerDesignerEdit: {

  component: BannerDesignerEdit,
  permission: "PROMOTION_READ",
},
planCampaign: {
  component: PlanCampaign,
  permission: "PROMOTION_READ",
},

productPriceUpdate: {
  component: ProductPriceUpdate,
  permission: "PROMOTION_READ",
},



allMerchants: {
  component: AllMerchants,
  permission: "VENDOR_READ",
},
merchantsBulkUpload: {
  component: MerchantsBulkUpload,
  permission: "VENDOR_READ",
},

allDrivers: {
  component: AllDrivers,
  permission: "DRIVER_READ",
},
categories:{
    component: Categories,
    permission:"CATEGORY_READ",
},

createCategory: {
  component: CreateCategory,
  permission: "CATEGORY_CREATE",
},

editCategory: {
  component: EditCategory,
  permission: "CATEGORY_UPDATE",
},
masterProducts: {
  component: MasterProducts,
     permission:"RESTAURANT_READ",
},

compareFile: {
  component: CompareFile,
  permission: "RESTAURANT_READ",
},

editMasterProduct: {
  component: EditMasterProduct,
  permission: "MASTER_PRODUCTS_UPDATE",
},
createMasterProduct: {
  component: CreateMasterProduct,
  permission: "MASTER_PRODUCTS_CREATE",
},

// outlets: {
//   component: Outlets,
//   permission: "RESTAURANT_READ",
// },


createOutlet: {
  component: CreateOutlet,
  permission: "RESTAURANT_READ",
},

deliveryCharge: {
    component: DeliveryCharge,
    permission: "SETTINGS_READ",
},

incentives: {
  component: Incentives,
  permission: "SETTINGS_READ",
},

orderSettings: {
  component: OrderSettings,
  permission: "SETTINGS_READ",
},

walletSettings: {
  component: WalletSettings,
  permission: "SETTINGS_READ",
},

CustomerWallet: {
  component: CustomerWallet,
  permission: "SETTINGS_READ",
},

WalletTransactions: {
  component: WalletTransactions,
  permission: "SETTINGS_READ",
},

subscriptionPlanSettings: {
    permission: "SETTINGS_READ",
    component: SubscriptionPlanSettings,
},

createSubscriptionPlan: {
    permission: "SETTINGS_READ",
    component: CreateSubscriptionPlan,
},

viewSubscriptionPlan: {
    permission: "SETTINGS_READ",
    component: ViewSubscriptionPlan,
},

editSubscriptionPlan: {
    permission: "SETTINGS_READ",
    component: EditSubscriptionPlan,
},



driverSettings: {
    component: DriverSettings,
    permission: "SETTINGS_READ",
},


merchantAddVariants: {
    component: MerchantAddVariants,
    permission: "RESTAURANT_READ", // Change to null if permission issues persist
    component: BannerDesignerEdit,
    permission: "PROMOTION_READ",

  },

  planCampaign: {
    component: PlanCampaign,
    permission: "PROMOTION_READ",
  },

createMerchant: {
  component: CreateMerchant,
  permission: "VENDOR_READ",
},




  productPriceUpdate: {
    component: ProductPriceUpdate,
    permission: "PROMOTION_READ",
  },


  allMerchants: {
    component: AllMerchants,
    permission: "VENDOR_READ",
  },

  merchantsBulkUpload: {
    component: MerchantsBulkUpload,
    permission: "VENDOR_READ",
  },

  allDrivers: {
    component: AllDrivers,
    permission: "DRIVER_READ",
  },

  categories: {
    component: Categories,
    permission: "CATEGORY_READ",
  },

  createCategory: {
    component: CreateCategory,
    permission: "CATEGORY_CREATE",
  },

  editCategory: {
    component: EditCategory,
    permission: "CATEGORY_UPDATE",
  },

  masterProducts: {
    component: MasterProducts,
    permission: "RESTAURANT_READ",
  },

  compareFile: {
    component: CompareFile,
    permission: "RESTAURANT_READ",
  },

  editMasterProduct: {
    component: EditMasterProduct,
    permission: "MASTER_PRODUCTS_UPDATE",
  },

  createMasterProduct: {
    component: CreateMasterProduct,
    permission: "MASTER_PRODUCTS_CREATE",
  },

  createOutlet: {
    component: CreateOutlet,
    permission: "RESTAURANT_READ",
  },

  deliveryCharge: {
    component: DeliveryCharge,
    permission: "SETTINGS_READ",
  },

  incentives: {
    component: Incentives,
    permission: "SETTINGS_READ",
  },

  orderSettings: {
    component: OrderSettings,
    permission: "SETTINGS_READ",
  },

  walletSettings: {
    component: WalletSettings,
    permission: "SETTINGS_READ",
  },

  subscriptionPlanSettings: {
    permission: "SETTINGS_READ",
    component: SubscriptionPlanSettings,
  },

  createSubscriptionPlan: {
    permission: "SETTINGS_READ",
    component: CreateSubscriptionPlan,
  },

  viewSubscriptionPlan: {
    permission: "SETTINGS_READ",
    component: ViewSubscriptionPlan,
  },

  editSubscriptionPlan: {
    permission: "SETTINGS_READ",
    component: EditSubscriptionPlan,
  },

  driverSettings: {
    component: DriverSettings,
    permission: "SETTINGS_READ",
  },

  merchantAddVariants: {
    component: MerchantAddVariants,
    permission: "RESTAURANT_READ",
  },

  // Updated to point to ViewOutlets so it fetches by merchant ID
  "view-outlets": {
    component: ViewOutlets, 
    permission: "RESTAURANT_READ",
  },
};