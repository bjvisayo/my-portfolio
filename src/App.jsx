import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./sections/Footer.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProcessPage from "./pages/ProcessPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";

const routes = {
  "/": HomePage,
  "/projects": ProjectsPage,
  "/services": ServicesPage,
  "/process": ProcessPage,
  "/about": AboutPage,
  "/contact": ContactPage,
  "/admin": AdminPage,
};

function useRoute() {
  const [path, setPath] = useState(normalizePath(window.location.pathname));

  useEffect(() => {
    const onNavigate = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onNavigate);
    window.addEventListener("xk:navigate", onNavigate);
    return () => {
      window.removeEventListener("popstate", onNavigate);
      window.removeEventListener("xk:navigate", onNavigate);
    };
  }, []);

  return path;
}

function normalizePath(path) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export default function App() {
  const path = useRoute();
  const Page = routes[path] || HomePage;

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <Navbar />
      <Page />
      <Footer />
    </main>
  );
}
