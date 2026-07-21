  export const getToken = () =>
  localStorage.getItem("token") || "";

export const getRole = () =>
  localStorage.getItem("role") || "";

export const logout = () => {

  localStorage.clear();

  window.location.href = "/login";
};