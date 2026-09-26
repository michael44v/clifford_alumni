import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Directory from "@/pages/Directory";
import Events from "@/pages/Events";
import News from "@/pages/News";
import CareerHub from "@/pages/CareerHub";
import BusinessDirectory from "@/pages/BusinessDirectory";
import WelfareCenter from "@/pages/WelfareCenter";
import Leadership from "@/pages/Leadership";
import Gallery from "@/pages/Gallery";
import Finance from "@/pages/Finance";
import Donate from "@/pages/Donate";
import Contact from "@/pages/Contact";
import LoginJoin from "@/pages/LoginJoin";
import MemberDashboard from "@/pages/MemberDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

export type Page =
  | "home" | "about" | "directory" | "events" | "news"
  | "career" | "business" | "welfare" | "leadership" | "gallery"
  | "finance" | "donate" | "contact" | "login" | "register"
  | "dashboard" | "admin";

const NO_FOOTER: Page[] = ["admin"];
const NO_NAV: Page[] = ["admin"];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = (asAdmin = false) => {
    setIsLoggedIn(true);
    setIsAdmin(asAdmin);
    navigate(asAdmin ? "admin" : "dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("home");
  };

  const showNav = !NO_NAV.includes(currentPage);
  const showFooter = !NO_FOOTER.includes(currentPage) && currentPage !== "login" && currentPage !== "register";

  return (
    <div className="flex flex-col min-h-full bg-[var(--background)]">
      {showNav && (
        <Nav currentPage={currentPage} onNavigate={navigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}

      <main className="flex-1">
        {currentPage === "home"       && <Home onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "about"      && <About onNavigate={navigate} />}
        {currentPage === "directory"  && <Directory onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "events"     && <Events onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "news"       && <News onNavigate={navigate} />}
        {currentPage === "career"     && <CareerHub onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "business"   && <BusinessDirectory onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "welfare"    && <WelfareCenter onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "leadership" && <Leadership onNavigate={navigate} />}
        {currentPage === "gallery"    && <Gallery onNavigate={navigate} />}
        {currentPage === "finance"    && <Finance onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "donate"     && <Donate onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "contact"    && <Contact onNavigate={navigate} />}
        {(currentPage === "login" || currentPage === "register") && (
          <LoginJoin mode={currentPage} onLogin={handleLogin} onNavigate={navigate} />
        )}
        {currentPage === "dashboard" && isLoggedIn && !isAdmin && (
          <MemberDashboard onNavigate={navigate} />
        )}
        {currentPage === "dashboard" && !isLoggedIn && (
          <LoginJoin mode="login" onLogin={handleLogin} onNavigate={navigate} />
        )}
        {currentPage === "admin" && isAdmin && (
          <AdminDashboard onNavigate={navigate} onLogout={handleLogout} />
        )}
      </main>

      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}
