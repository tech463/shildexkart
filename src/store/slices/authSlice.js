import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "../../services/authService";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await loginAPI(payload);
      return data;
    } catch (err) {
      // Axios error ka server message mil sake to woh show karein
      const message = err?.response?.data?.message
        || err?.response?.data?.error
        || err?.response?.data?.details
        || err?.message
        || "Login failed. Please try again.";
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    user: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default authSlice.reducer;