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
import MerchantsBulkUpload from "../pages/MerchantsBulkUpload";
import CreateMerchant from "../pages/Merchants/CreateMerchant";

import AllDrivers from "../pages/AllDrivers";
import CreateDriver from "../pages/CreateDriver";

import Categories from "../pages/Categories";
import CreateCategory from "../pages/CreateCategory";
import EditCategory from "../pages/EditCategory";

import MasterProducts from "../pages/MasterProducts";
import CompareFile from "../pages/CompareFile";
import EditMasterProduct from "../pages/EditMasterProduct";
import CreateMasterProduct from "../pages/CreateMasterProduct";

import ViewOutlets from "../pages/ViewOutlets";
import CreateOutlet from "../pages/CreateOutlet";

import AllOutletsList from "../pages/AllOutletsList";
import OutletCreate from "../pages/OutletCreate";
import OutletProfileDetails from "../pages/OutletProfileDetails";
import OutletEdit from "../pages/OutletEdit";

import MerchantAddVariants from "../pages/MerchantAddVariants";

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

import DriverSettings from "../pages/DriverSettings";
import CreateMerchant from "../pages/Merchants/CreateMerchant";




export const pageRegistry = {

  // =========================
  // ZONES
  // =========================

  zones: {
    component: ZoneManagement,
    permission: "ZONE_READ",
  },

  createZone: {
    component: CreateZone,
    permission: "ZONE_CREATE",
  },


  // =========================
  // ROLES / ADMIN
  // =========================

  roles: {
    component: RolesPermissions,
    permission: "ROLE_READ",
  },

  adminUsers: {
    component: AdminUsers,
    permission: "ADMIN_USER_READ",
  },


  // =========================
  // CUSTOMERS
  // =========================

  usersCustomers: {
    component: UsersCustomers,
    permission: "CUSTOMER_READ",
  },

  createUser: {
    component: CreateUser,
    permission: "CUSTOMER_CREATE",
  },


  // =========================
  // MERCHANTS
  // =========================

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

  allMerchants: {
    component: AllMerchants,
    permission: "VENDOR_READ",
  },

  createMerchant: {
    component: CreateMerchant,
    permission: "VENDOR_READ",
  },

  merchantsBulkUpload: {
    component: MerchantsBulkUpload,
    permission: "VENDOR_READ",
  },


  // =========================
  // OUTLETS
  // =========================

  allOutletsList: {
    component: AllOutletsList,
    permission: "OUTLET_READ",
  },

  createOutletNew: {
    component: OutletCreate,
    permission: "OUTLET_CREATE",
  },

  outletProfileDetails: {
    component: OutletProfileDetails,
    permission: "OUTLET_READ",
  },

  outletEdit: {
    component: OutletEdit,
    permission: "OUTLET_UPDATE",
  },

  "view-outlets": {
    component: ViewOutlets,
    permission: "RESTAURANT_READ",
  },

  createOutlet: {
    component: CreateOutlet,
    permission: "RESTAURANT_READ",
  },


  // =========================
  // DRIVERS
  // =========================

  allDrivers: {
    component: AllDrivers,
    permission: "DRIVER_READ",
  },

  createDriver: {
    component: CreateDriver,
    permission: "DRIVER_CREATE",
  },


  // =========================
  // CATEGORIES
  // =========================

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


  // =========================
  // MASTER PRODUCTS
  // =========================

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


  // =========================
  // PROMOTIONS
  // =========================

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


  // =========================
  // MERCHANT VARIANTS
  // =========================

  merchantAddVariants: {
    component: MerchantAddVariants,
    permission: "RESTAURANT_READ",
  },


  // =========================
  // SETTINGS
  // =========================

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


  // =========================
  // SUBSCRIPTION PLANS
  // =========================

  subscriptionPlanSettings: {
    component: SubscriptionPlanSettings,
    permission: "SETTINGS_READ",
  },

  createSubscriptionPlan: {
    component: CreateSubscriptionPlan,
    permission: "SETTINGS_READ",
  },

  viewSubscriptionPlan: {
    component: ViewSubscriptionPlan,
    permission: "SETTINGS_READ",
  },

  editSubscriptionPlan: {
    component: EditSubscriptionPlan,
    permission: "SETTINGS_READ",
  },


  // =========================
  // DRIVER SETTINGS
  // =========================

  driverSettings: {
    component: DriverSettings,
    permission: "SETTINGS_READ",
},


merchantAddVariants: {
    component: MerchantAddVariants,
    permission: "RESTAURANT_READ", // Change to null if permission issues persist
  },


createMerchant: {
  component: CreateMerchant,
  permission: "VENDOR_READ",
},


};


