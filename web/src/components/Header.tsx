
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header style={{ borderBottom: "1px solid #ddd", marginBottom: 16, padding: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link to="/"><strong>{t("app")}</strong></Link>
        <Link to="/admin">{t("admin")}</Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
            <option value="tr">{t("turkish")}</option>
            <option value="en">{t("english")}</option>
          </select>
          {user ? (
            <>
              <span>{user.username}</span>
              <button onClick={logout}>{t("logout")}</button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
}
