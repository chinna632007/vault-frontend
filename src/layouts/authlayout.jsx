import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

function AuthLayout() {
  return (
    <div className="auth-layout">
      <Navbar />
      <main className="auth-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;