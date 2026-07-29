import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import mainCategoryReducer from "./slices/mainCategorySlice";
import categoryReducer from "./slices/categorySlice";
import subCategoryReducer from "./slices/subCategorySlice";
import unitReducer from "./slices/unitSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    mainCategory: mainCategoryReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    unit: unitReducer,
  },
});
