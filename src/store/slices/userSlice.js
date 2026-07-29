import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setUsers(state, action) {
      state.list = action.payload;
    },
    clearUsers(state) {
      state.list = [];
      state.error = null;
    },
  },
});

export const { setUsers, clearUsers } = userSlice.actions;
export default userSlice.reducer;
