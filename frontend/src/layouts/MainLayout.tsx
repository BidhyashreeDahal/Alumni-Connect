import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout: React.FC = () => {
  const [, setCollapsed] = useState(false);

  return (
    <div className="page-container">
      <div className="layout flex">
        <Sidebar onToggle={setCollapsed} />

        <div className="content-area flex-1">
          <Header />
          <main className="page-content" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;