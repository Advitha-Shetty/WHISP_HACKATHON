import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from "../context/AppContext";

const navItems = [
  { key: "home", icon: "⊞", path: "/" },
  { key: "district", icon: "◎", path: "/your-district" },
  { key: "discussion", icon: "⊙", path: "/discussion" },
  { key: "profile", icon: "◉", path: "/profile" },
];

export default function NavBar() {
  const { t, lang, setLang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const labels = {
    home: t("home"),
    district: t("yourDistrict"),
    discussion: t("discussion"),
    profile: t("profile"),
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <div style={styles.logoMark}>W</div>
        <span style={styles.logoText}>WHISP</span>
      </div>

      <div style={styles.navItems}>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item.path)}
            style={{ 
              ...styles.navBtn, 
              ...(isActive(item.path) ? styles.navBtnActive : {})
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{labels[item.key]}</span>
            {isActive(item.path) && <div style={styles.activeDot} />}
          </button>
        ))}
      </div>

      <div style={styles.langSwitch}>
        <button
          onClick={() => setLang("en")}
          style={{ ...styles.langBtn, ...(lang === "en" ? styles.langActive : {}) }}
        >EN</button>
        <button
          onClick={() => setLang("kn")}
          style={{ ...styles.langBtn, ...(lang === "kn" ? styles.langActive : {}) }}
        >ಕನ್ನಡ</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 60,
    background: "rgba(4,20,37,0.95)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(16,185,129,0.12)",
  },
  logo: { display:"flex", alignItems:"center", gap:10 },
  logoMark: { width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#10B981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:700, fontSize:15, color:"#020D18" },
  logoText: { fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:"#E8F4F0" },
  navItems: { display:"flex", gap:4 },
  navBtn: {
    display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:10,
    background:"transparent", color:"#b8e1fc", fontSize:13, fontWeight:500,
    border:"none", cursor:"pointer", position:"relative", transition:"all 0.2s",
  },
  navBtnActive: { background:"rgba(16,185,129,0.1)", color:"#2ecc71" },
  navIcon: { fontSize:14 },
  navLabel: {},
  activeDot: { position:"absolute", bottom:-1, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"#2ecc71" },
  langSwitch: { display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:3 },
  langBtn: { background:"transparent", border:"none", color:"#b8e1fc", cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:12, fontWeight:500, transition:"all 0.2s" },
  langActive: { background:"rgba(16,185,129,0.2)", color:"#2ecc71" },
};