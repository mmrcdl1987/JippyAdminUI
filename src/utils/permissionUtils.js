export const hasPermission = (permission) => {

  try {

    const role =
      localStorage.getItem("role") || "";

    const permissions = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );

    // Only Super Admin gets all access
    if (role === "ROLE_SUPERADMIN") {
      return true;
    }

    // Safety check
    if (!Array.isArray(permissions)) {
      return false;
    }

    return permissions.includes(permission);

  } catch (error) {

    console.error(
      "Permission parsing error:",
      error
    );

    return false;
  }
};

export const getRole = () => {
  return localStorage.getItem("role") || "";
};

export const getPermissions = () => {

  try {

    return JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );

  } catch (error) {

    console.error(
      "Permissions parsing error:",
      error
    );

    return [];
  }
};

export const isSuperAdmin = () => {
  return (
    localStorage.getItem("role") ===
    "ROLE_SUPERADMIN"
  );
};