import { FM_API } from "./api";

/**
 * Fetch complete customer details by customer ID
 * GET /api/co/customers/{customerId}
 */
export const getCustomerById = async (customerId) => {
  const response = await FM_API.get(`/api/co/customers/${customerId}`);
  return response.data;
};

/**
 * Fetch all customers
 * GET /api/co/customers
 */
export const getAllCustomers = async () => {
  const response = await FM_API.get("/api/co/customers");
  return response.data;
};
