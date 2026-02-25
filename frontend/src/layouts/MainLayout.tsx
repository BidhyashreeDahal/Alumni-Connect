import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <div className="layout-row">
        <Sidebar collapsed={collapsed} onToggle={setCollapsed} />

        <div className="content-col">
          <Header />
          <main className="page-content">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;