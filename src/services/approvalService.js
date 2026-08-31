import { FM_API } from "./api";

// ============================================================================
// Approval Settings APIs
// ============================================================================

/**
 * Creates a new Approval Setting.
 * Endpoint: POST /api/fm/approval-settings/createApproval
 */
export const createApproval = async (requestDTO) => {
  const response = await FM_API.post(
    "/api/fm/approval-settings/createApproval",
    requestDTO
  );
  return response.data;
};

/**
 * Replaces existing Approver with a New Approver and transfers Manager Area mappings.
 * Endpoint: PUT /api/fm/approval-settings/replaceApproverWithAreas
 */
export const replaceApproverWithAreas = async (requestDTO) => {
  const response = await FM_API.put(
    "/api/fm/approval-settings/replaceApproverWithAreas",
    requestDTO
  );
  return response.data;
};

/**
 * Fetches all Approval Settings.
 * Endpoint: GET /api/fm/approval-settings
 */
export const getApprovalSettings = async () => {
  const response = await FM_API.get("/api/fm/approval-settings");
  return response.data;
};

// ============================================================================
// Approval Requests APIs
// ============================================================================

/**
 * Creates an Approval Request for an Entity (OUTLET, MERCHANT, DRIVER).
 * Endpoint: POST /api/fm/approval-requests/createApprovalRequest
 */
export const createApprovalRequest = async (requestDTO) => {
  const response = await FM_API.post(
    "/api/fm/approval-requests/createApprovalRequest",
    requestDTO
  );
  return response.data;
};

/**
 * Fetches Pending Approval Requests for a specific Approver User ID based on configured approval levels.
 * Endpoint: GET /api/fm/approval-requests/getPendingApprovalRequestsByApproverId/{approverId}
 */
export const getPendingApprovalRequests = async (approverId) => {
  try {
    // Primary: use the Level-based endpoint that returns FULL entity details
    // (outletName, merchantName, firstName, phones, emails, etc.)
    const response = await FM_API.get(
      `/api/fm/approval-requests/getPendingLevelApprovalRequestsByApproverId/${approverId}`
    );
    return response.data;
  } catch (error) {
    // Fallback to the simpler endpoint (may not include entity details)
    const response = await FM_API.get(
      `/api/fm/approval-requests/getPendingApprovalRequestsByApproverId/${approverId}`
    );
    return response.data;
  }
};

export const getLevel1PendingApprovalRequests = getPendingApprovalRequests;

/**
 * Fetches ALL Pending Approval Requests across all approvers.
 * Endpoint: GET /api/fm/approval-requests/getAllPendingApprovals
 */
export const getAllPendingApprovals = async () => {
  const response = await FM_API.get(
    "/api/fm/approval-requests/getAllPendingApprovals"
  );
  return response.data;
};

/**
 * Approves or Rejects one or more Approval Requests.
 * Endpoint: POST /api/fm/approval-requests/updateApprovalRequestsToApproved
 * Payload Schema (FmApprovalRequestUpdateRequestDTO):
 * {
 *   approvalRequestIds: number[],  // List of Approval Request IDs
 *   status: "APPROVED" | "REJECTED", // Approval Status
 *   rejectedReason?: string | null, // Required when status is REJECTED
 *   approverId: number             // Approver Employee ID
 * }
 */
export const updateApprovalRequestsToApproved = async (requestDTO) => {
  const response = await FM_API.post(
    "/api/fm/approval-requests/updateApprovalRequestsToApproved",
    requestDTO
  );
  return response.data;
};

/**
 * Fetches all Rejected Approval Requests.
 * Endpoint: GET /api/fm/approval-requests/getAllRejectedApprovals
 */
/**
 * Fetches all Rejected Approval Requests.
 * Endpoint: GET /api/fm/approval-requests/getAllRejectedApprovals
 */
export const getAllRejectedApprovals = async () => {
  const response = await FM_API.get(
    "/api/fm/approval-requests/getAllRejectedApprovals"
  );
  return response.data;
};

/**
 * Updates a REJECTED Approval Request back to PENDING.
 * Endpoint: PUT /api/fm/approval-requests/updateRejectedApprovalsToPending
 */
export const updateRejectedApprovalsToPending = async (requestDTO) => {
  const response = await FM_API.put(
    "/api/fm/approval-requests/updateRejectedApprovalsToPending",
    requestDTO
  );
  return response.data;
};

// ============================================================================
// Approval Transactions APIs
// ============================================================================

/**
 * Fetches all REJECTED approval transactions.
 * Endpoint: GET /api/fm/approval-transactions/getRejectedApprovals
 */
// export const getRejectedApprovalTransactions = async () => {
//   const response = await FM_API.get(
//     "/api/fm/approval-transactions/getRejectedApprovals"
//   );
//   return response.data;
// };

/**
 * Fetches all PENDING approval transactions.
 * Endpoint: GET /api/fm/approval-transactions/getPendingApprovals
 */
export const getPendingApprovalTransactions = async () => {
  const response = await FM_API.get(
    "/api/fm/approval-transactions/getPendingApprovals"
  );
  return response.data;
};

/**
 * Fetches ALL approval transactions regardless of status.
 * Endpoint: GET /api/fm/approval-transactions/getAllTransactions
 */
export const getAllApprovalTransactions = async () => {
  const response = await FM_API.get(
    "/api/fm/approval-transactions/getAllTransactions"
  );
  return response.data;
};

// ============================================================================
// Auto Approval Scheduler Testing APIs
// ============================================================================

/**
 * Executes Auto Approval Scheduler manually for testing.
 * Endpoint: POST /api/fm/auto-approval/autoApprovalManualTestProcess
 */
export const triggerAutoApprovalTestProcess = async () => {
  const response = await FM_API.post(
    "/api/fm/auto-approval/autoApprovalManualTestProcess"
  );
  return response.data;
};
