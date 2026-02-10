
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import {useState} from "react";
import Header from "./components/Header";

function App() {
    const [collapsed, setCollapsed] = useState(false);
  return (
      <div className="page-container">
          <div className="layout flex">
              <Sidebar onToggle={setCollapsed} collapsed={collapsed}/>

              <div className="content-area flex-1">
                  <Header title="Alumni Connect"/>
                  <main className="page-content"></main>
              </div>
          </div>


          <Footer/>
      </div>
  );
}

export default App;
