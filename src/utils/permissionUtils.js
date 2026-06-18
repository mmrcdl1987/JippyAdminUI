export const hasPermission = (permission) => {

  const role =
    localStorage.getItem("role");

  const permissions =
    JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );

  if (role === "ROLE_SUPERADMIN") {
    return true;
  }

  return permissions.includes(permission);
};