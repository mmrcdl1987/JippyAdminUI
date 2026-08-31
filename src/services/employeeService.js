import { FM_API } from "./api";

export const searchEmployees = async (query) => {
  const response = await FM_API.get(`/api/fm/employees/search?q=${query}`);
  return response.data;
};
