import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const handleMenuToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleNavigate = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="main-layout">
      <Navbar onMenuToggle={handleMenuToggle} mobileSidebarOpen={mobileSidebarOpen} />
      <div className="layout-body">
        <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "collapsed"} ${mobileSidebarOpen ? "mobile-open" : ""}`}>
          <Sidebar onNavigate={handleNavigate} />
        </div>
        {mobileSidebarOpen && (
          <div className="mobile-sidebar-backdrop" onClick={handleNavigate} />
        )}
        <button
          className={`sidebar-toggle ${sidebarOpen ? "open" : "collapsed"}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
        <main className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
          <Outlet />
        </main>
      </div>
      <Footer sidebarOpen={sidebarOpen} />
    </div>
  );
}

export default MainLayout;