import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../styles/Navbar.module.css";
import { ROLE_HIERARCHY, hasAccess } from "../utils/roles.js";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role") || "");
    };
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("authChange"));
    setMenuOpen(false);
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
    setMenuOpen(false);
  };

  const handleAdminPanel = () => {
    navigate("/admin");
    setMenuOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setMenuOpen(false);
  };

  const handleMyTests = () => {
    navigate("/my-tests");
    setMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link to="/" className={styles.navBtn}>Головна</Link>
        {!isLoggedIn && (
          <>
            <Link to="/register" className={styles.navBtn}>Реєстрація</Link>
            <Link to="/login" className={styles.navBtn}>Вхід</Link>
          </>
        )}
      </div>

      {isLoggedIn && (
        <div className={styles.navRight}>
          <button className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          {menuOpen && (
            <div className={styles.menuDropdown}>
              <button className={styles.profileBtn} onClick={handleProfile}>
                Мій профіль
              </button>

              {hasAccess(role, "teacher") && (
                <button className={styles.myTestsBtn} onClick={handleMyTests}>
                  Мої тести
                </button>
              )}

              {hasAccess(role, "admin") && (
                <button className={styles.adminPanelBtn} onClick={handleAdminPanel}>
                  Адмін панель
                </button>
              )}

              <button className={styles.changePasswordBtn} onClick={handleChangePassword}>
                Змінити пароль
              </button>

              <button className={styles.logoutBtn} onClick={handleLogout}>
                Вийти
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
