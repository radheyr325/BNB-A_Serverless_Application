import "./App.css";

import Quicksight from "./components/visualize/quicksight";
import Datastudio from "./components/visualize/datastudio";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Header from "./components/Header/Header";
import QA from "./components/Login/QA";
import Cipher from "./components/Login/Cipher";
import Tours from "./components/Tours/Tours";
import Menu from "./components/kitchenManagement/Menu";
import BookRoom from "./components/Room/BookRoom";
import Support  from "./components/onlineSupport/Support";
import Message from "./components/Message/Message";


import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>

        <div>
          <ToastContainer />
          <Header />
          <div className="m-4 body-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Home />} />
              <Route path="/adminvisualize" element={<Quicksight />} />
              <Route path="/visualize" element={<Datastudio />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/qa" element={<QA />} />
              <Route path="/cipher" element={<Cipher />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/bookroom" element={<BookRoom />} />
              <Route path="/login" element={<Login />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/message" element={<Message />} />
            </Routes>
          </div>

          {/* <Footer /> */}
          <Support />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
