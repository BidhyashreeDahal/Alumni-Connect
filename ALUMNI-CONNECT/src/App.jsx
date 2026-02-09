import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="page-container">
      <div className="layout">
        <Sidebar />

        <div className="content-area">
          <Header title="Alumni Connect" />
          <main className="page-content">
          
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
