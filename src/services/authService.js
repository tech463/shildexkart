import api from "../api/axios";

export const loginAPI = async (payload) => {
  // Backend SS ke hisaab se correct endpoint
  const response = await api.post("/v1/admin/admin-login", payload);
  return response.data;
};

export const verifyOtpAPI = async (payload) => {
  // Postman SS ke hisaab se:
  // POST /api/v1/admin/verify-otp
  // body: { email, otp }
  const response = await api.post("/v1/admin/verify-otp", payload);
  return response.data;
};

export const forgotPasswordAPI = async (payload) => {
  // Postman SS ke hisaab se:
  // POST /api/v1/admin/forgot-password
  const response = await api.post("/v1/admin/forgot-password", payload);
  return response.data;
};

export const verifyPasswordOtpAPI = async (payload) => {
  // Postman SS ke hisaab se:
  // POST /api/v1/admin/verify-forgot-otp
  const response = await api.post("/v1/admin/verify-forgot-otp", payload);
  return response.data;
};

export const resetPasswordAPI = async (payload) => {
  // Assumption (Postman collection naming):
  // POST /api/v1/admin/reset-password
  const response = await api.post("/v1/admin/reset-password", payload);
  return response.data;
};