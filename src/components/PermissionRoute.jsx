import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/permissionUtils";

function PermissionRoute({
  permission,
  children,
}) {

  if (
    permission &&
    !hasPermission(permission)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default PermissionRoute;