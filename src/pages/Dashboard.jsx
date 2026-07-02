// import { useState } from "react";
// import Sidebar from "../components/Sidebar";
// import ZoneManagement from "./ZoneManagement";
// import CreateZone from "./CreateZone";
// import AdminUsers from "./AdminUsers";
// import RolesPermissions from "./RolesPermissions";
// import { hasPermission } from "../utils/permissionUtils";
// import UsersCustomers from "./UsersCustomers.jsx";
// import CreateUser from "./CreateUser";
// import "../styles/Dashboard.css";
// import BannerDesigner from "./BannerDesigner";
// import AdvertisementOutlets from "./AdvertisementOutlets";

// import {
//   FaMoneyBillWave,
//   FaStore,
//   FaClipboardList,
//   FaUtensils,
//   FaUsers,
//   FaTruck,
// } from "react-icons/fa";

// function Dashboard() {

//   const [activePage, setActivePage] =
//     useState("dashboard");

//   return (
//     <div className="dashboard-layout">

//       <Sidebar
//         setActivePage={setActivePage}
//       />

//       <div className="dashboard-content">

//         {/* Dashboard */}
//         {activePage === "dashboard" && (
//           <>
//             <h2 className="dashboard-title">
//               Business Analytics
//             </h2>

//             <div className="cards-grid">

//               <div className="card green">
//                 <div>
//                   <h3>₹830389</h3>
//                   <p>Total Earnings</p>
//                 </div>
//                 <FaMoneyBillWave size={40} />
//               </div>

//               <div className="card blue">
//                 <div>
//                   <h3>522</h3>
//                   <p>Total Restaurants</p>
//                 </div>
//                 <FaStore size={40} />
//               </div>

//               <div className="card cream">
//                 <div>
//                   <h3>5545</h3>
//                   <p>Total Orders</p>
//                 </div>
//                 <FaClipboardList size={40} />
//               </div>

//               <div className="card lightgreen">
//                 <div>
//                   <h3>23969</h3>
//                   <p>Total Foods</p>
//                 </div>
//                 <FaUtensils size={40} />
//               </div>

//               <div className="card pink">
//                 <div>
//                   <h3>₹164904</h3>
//                   <p>Admin Commission</p>
//                 </div>
//                 <FaMoneyBillWave size={40} />
//               </div>

//               <div className="card purple">
//                 <div>
//                   <h3>40245</h3>
//                   <p>Total Clients</p>
//                 </div>
//                 <FaUsers size={40} />
//               </div>

//               <div className="card lavender">
//                 <div>
//                   <h3>519</h3>
//                   <p>Total Drivers</p>
//                 </div>
//                 <FaTruck size={40} />
//               </div>

//             </div>
//           </>
//         )}

//         {/* Zone Management */}
//         {
//           activePage === "zones" &&
//           hasPermission("ZONE_READ") && (
//             <ZoneManagement
//               setActivePage={setActivePage}
//             />
//           )
//         }

//         {/* Create Zone */}
//         {
//           activePage === "createZone" &&
//           hasPermission("ZONE_CREATE") && (
//             <CreateZone
//               setActivePage={setActivePage}
//             />
//           )
//         }

//         {/* Roles & Permissions */}
//         {
//           activePage === "roles" &&
//           hasPermission("ROLE_READ") && (
//             <RolesPermissions />
//           )
//         }

//         {/* Admin Users */}
//         {
//           activePage === "adminUsers" &&
//           hasPermission("ADMIN_USER_READ") && (
//             <AdminUsers />
//           )
//         }
//   {/* Users / Customers */}
// {
//   activePage === "usersCustomers" && (
//     <UsersCustomers
//       setActivePage={setActivePage}
//     />
//   )
// }
// {
//   activePage === "createUser" && (
//     <CreateUser
//       setActivePage={setActivePage}
//     />
//   )
// }
// {
//   activePage === "advertisementOutlets" && (
//     <>
//       {console.log("Advertisement Page Loaded")}
//       <AdvertisementOutlets />
//     </>
//   )
// }
// {
//   activePage === "bannerDesigner" && (
//     <>
//       {console.log("Banner Designer Page Loaded")}
//       <BannerDesigner />
//     </>
//   )
// }
//         {/* Access Denied */}
//         {
//           activePage === "zones" &&
//           !hasPermission("ZONE_READ") && (
//             <h2>
//               Access Denied
//             </h2>
//           )
//         }

//         {
//           activePage === "roles" &&
//           !hasPermission("ROLE_READ") && (
//             <h2>
//               Access Denied
//             </h2>
//           )
//         }

//         {
//           activePage === "adminUsers" &&
//           !hasPermission("ADMIN_USER_READ") && (
//             <h2>
//               Access Denied
//             </h2>
//           )
//         }

//       </div>

//     </div>
//   );
// }

// export default Dashboard;

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { hasPermission } from "../utils/permissionUtils";
import { pageRegistry } from "../config/pageRegistry";
import "../styles/Dashboard.css";

import {
  FaMoneyBillWave,
  FaStore,
  FaClipboardList,
  FaUtensils,
  FaUsers,
  FaTruck,
} from "react-icons/fa";

function Dashboard() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const pageConfig =
    pageRegistry[activePage];

  const CurrentPage =
    pageConfig?.component;
    

 

console.log("Active Page:", activePage);
console.log("Page Config:", pageConfig);

  return (
    <div className="dashboard-layout">

      <Sidebar
        setActivePage={setActivePage}
      />

      <div className="dashboard-content">

        {/* Dashboard Home */}
        {activePage === "dashboard" && (
          <>
            <h2 className="dashboard-title">
              Business Analytics
            </h2>

            <div className="cards-grid">

              <div className="dashboard-card green">
                <div>
                  <h3>₹830389</h3>
                  <p>Total Earnings</p>
                </div>
                <FaMoneyBillWave size={40} />
              </div>

              <div className="dashboard-card blue">
                <div>
                  <h3>522</h3>
                  <p>Total Restaurants</p>
                </div>
                <FaStore size={40} />
              </div>

              <div className="dashboard-card cream">
                <div>
                  <h3>5545</h3>
                  <p>Total Orders</p>
                </div>
                <FaClipboardList size={40} />
              </div>

              <div className="dashboard-card lightgreen">
                <div>
                  <h3>23969</h3>
                  <p>Total Foods</p>
                </div>
                <FaUtensils size={40} />
              </div>

              <div className="dashboard-card pink">
                <div>
                  <h3>₹164904</h3>
                  <p>Admin Commission</p>
                </div>
                <FaMoneyBillWave size={40} />
              </div>

              <div className="dashboard-card purple">
                <div>
                  <h3>40245</h3>
                  <p>Total Clients</p>
                </div>
                <FaUsers size={40} />
              </div>

              <div className="dashboard-card lavender">
                <div>
                  <h3>519</h3>
                  <p>Total Drivers</p>
                </div>
                <FaTruck size={40} />
              </div>

            </div>
          </>
        )}

        {/* Dynamic Page Rendering */}
        {activePage !== "dashboard" &&
          pageConfig &&
          hasPermission(
            pageConfig.permission
          ) && (
            <CurrentPage
              setActivePage={setActivePage}
            />
          )}

        {/* Access Denied */}
        {activePage !== "dashboard" &&
          pageConfig &&
          !hasPermission(
            pageConfig.permission
          ) && (
            <h2>
              Access Denied
            </h2>
          )}

      </div>

    </div>
  );
}

export default Dashboard;