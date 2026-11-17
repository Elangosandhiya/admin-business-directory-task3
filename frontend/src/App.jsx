import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Businesses from "./pages/Businesses";
import Categories from "./pages/Categories";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/businesses" element={<Businesses />} />
            <Route path="/admin/categories" element={<Categories />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/admin/businesses" replace />} />
        <Route path="*" element={<Navigate to="/admin/businesses" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
