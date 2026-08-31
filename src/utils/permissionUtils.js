export const hasPermission = (permission) => {
  try {
    const role = (localStorage.getItem("role") || "").trim().toUpperCase();
    const permissions = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );

    // Super Admin gets all access
    if (role === "ROLE_SUPERADMIN" || role === "SUPERADMIN") {
      return true;
    }

    // Safety check
    if (!Array.isArray(permissions)) {
      return false;
    }

    return permissions.includes(permission);
  } catch (error) {
    console.error("Permission parsing error:", error);
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
  const role = (localStorage.getItem("role") || "").trim().toUpperCase();
  return role === "ROLE_SUPERADMIN" || role === "SUPERADMIN";
};

export const isFleetManager = () => {
  const role = (localStorage.getItem("role") || "").trim().toUpperCase();
  return role === "ROLE_FLEET_MANAGER" || role === "FLEET_MANAGER";
};

export const hasRoleAccess = (requiredRole, excludeRole) => {
  const currentRole = (localStorage.getItem("role") || "").trim().toUpperCase();

  // If role is explicitly excluded for this user
  if (excludeRole) {
    const normCurrent = currentRole.replace(/^ROLE_/, "");
    const normExclude = excludeRole.trim().toUpperCase().replace(/^ROLE_/, "");
    if (normCurrent === normExclude) {
      return false;
    }
  }

  if (!requiredRole) return true;
  const targetRole = requiredRole.trim().toUpperCase();

  // Super Admin always has access to all sections and pages
  if (currentRole === "ROLE_SUPERADMIN" || currentRole === "SUPERADMIN") {
    return true;
  }

  if (currentRole === targetRole) {
    return true;
  }

  const normalizedCurrent = currentRole.replace(/^ROLE_/, "");
  const normalizedTarget = targetRole.replace(/^ROLE_/, "");

  return normalizedCurrent === normalizedTarget;
};

export const canAccessPage = (permission, requiredRole, excludeRole) => {
  const currentRole = (localStorage.getItem("role") || "").trim().toUpperCase();

  // 1. Check if explicitly excluded
  if (excludeRole) {
    const normCurrent = currentRole.replace(/^ROLE_/, "");
    const normExclude = excludeRole.trim().toUpperCase().replace(/^ROLE_/, "");
    if (normCurrent === normExclude) {
      return false;
    }
  }

  // 2. Super Admin always gets access (unless explicitly excluded)
  if (currentRole === "ROLE_SUPERADMIN" || currentRole === "SUPERADMIN") {
    return true;
  }

  // 3. Fleet Manager access logic
  if (currentRole === "ROLE_FLEET_MANAGER" || currentRole === "FLEET_MANAGER") {
    if (excludeRole && excludeRole.toUpperCase().includes("FLEET_MANAGER")) {
      return false;
    }
    if (permission && permission.startsWith("APPROVAL_SETTINGS")) {
      return false;
    }
    if (requiredRole && hasRoleAccess(requiredRole, excludeRole)) {
      return true;
    }
    if (permission && hasPermission(permission)) {
      return true;
    }
  }

  // 4. If requiredRole is specified and matches user
  if (requiredRole && hasRoleAccess(requiredRole, excludeRole)) {
    return true;
  }

  // 5. Check permission
  if (permission && hasPermission(permission)) {
    return true;
  }

  // 6. Default if no restrictions specified
  if (!permission && !requiredRole) {
    return true;
  }

  return false;
};