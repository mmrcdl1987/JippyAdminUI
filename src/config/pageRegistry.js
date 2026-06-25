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
};