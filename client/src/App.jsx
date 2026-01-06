import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useRef } from "react";
import AuthChecker from "./components/AuthChecker.jsx";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateTest from "./pages/CreateTest";
import TestPage from "./pages/TestPage";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import AdminPanel from "./pages/AdminPanel";
import MyTests from "./pages/MyTests";
import EditTest from "./pages/EditTest";
import NotFound from "./pages/NotFound";

import ProfilePage from "./pages/ProfilePage";

import Footer from "./components/Footer";

import "./styles/pageTransitions.css";

function AppContent() {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <div className="pageWrapper">
      <Navbar />
      <main className="content">
        <TransitionGroup component={null}>
          <CSSTransition
            key={location.pathname}
            classNames="fade"
            timeout={300}
            nodeRef={nodeRef}
          >
            <div ref={nodeRef}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-test" element={<CreateTest />} />
                <Route path="/test/:id" element={<TestPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/my-tests" element={<MyTests />} />
                <Route path="/edit-test/:id" element={<EditTest />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthChecker>
        <AppContent />
      </AuthChecker>
    </Router>
  );
}
