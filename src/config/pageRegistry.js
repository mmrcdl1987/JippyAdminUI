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
};