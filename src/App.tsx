import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastContainer, { showToast } from "@/components/Toast";
import { apiFetch, setAccessToken } from "@/lib/api";
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
import PasscodePurchase from "@/pages/PasscodePurchase";
import StudyMode from "@/pages/StudyMode";
import PasscodeLogin from "@/pages/PasscodeLogin";
import ExamInterface from "@/pages/ExamInterface";

export type Page =
  | "home" | "about" | "directory" | "events" | "news"
  | "career" | "business" | "welfare" | "leadership" | "gallery"
  | "finance" | "donate" | "contact" | "login" | "register"
  | "dashboard" | "admin" | "passcode" | "passcode-purchase" | "study" | "exam";

const NO_FOOTER: Page[] = ["admin", "exam"];
const NO_NAV: Page[] = ["admin", "exam"];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Attempt auto session restore from httpOnly refresh cookie or access token
    apiFetch("/api/members/me")
      .then(member => {
        setIsLoggedIn(true);
        setIsAdmin(member.role === "ADMIN" || member.role === "SUPER_ADMIN");
      })
      .catch(() => {
        // Not logged in or session expired
      });

    const handleSessionExpired = () => {
      setAccessToken(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      navigate("login");
      showToast("Your session has expired. Please log in again.", "error");
    };

    window.addEventListener("cuaa:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("cuaa:session-expired", handleSessionExpired);
    };
  }, []);

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
    apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAccessToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("home");
  };

  const showNav = !NO_NAV.includes(currentPage) && !(currentPage === "dashboard" && isAdmin);
  const showFooter = !NO_FOOTER.includes(currentPage) && !(currentPage === "dashboard" && isAdmin) && currentPage !== "login" && currentPage !== "register";

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
        {currentPage === "passcode-purchase" && <PasscodePurchase onNavigate={navigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "passcode"   && <PasscodeLogin onNavigate={navigate} />}
        {currentPage === "study"      && <StudyMode onNavigate={navigate} />}
        {currentPage === "exam"       && <ExamInterface onNavigate={navigate} />}
        {(currentPage === "login" || currentPage === "register") && (
          <LoginJoin mode={currentPage} onLogin={handleLogin} onNavigate={navigate} />
        )}
        {currentPage === "dashboard" && isLoggedIn && !isAdmin && (
          <MemberDashboard onNavigate={navigate} />
        )}
        {(currentPage === "dashboard" || currentPage === "admin") && isLoggedIn && isAdmin && (
          <AdminDashboard onNavigate={navigate} onLogout={handleLogout} />
        )}
        {currentPage === "dashboard" && !isLoggedIn && (
          <LoginJoin mode="login" onLogin={handleLogin} onNavigate={navigate} />
        )}
      </main>

      {showFooter && <Footer onNavigate={navigate} />}
      <ToastContainer />
    </div>
  );
}
