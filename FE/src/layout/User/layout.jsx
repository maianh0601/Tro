import { Outlet } from "react-router";
import { PhongTroProvider } from "../../Context/PhongTroContext";
import Footer from "./footer";
import Header from "./header";
import ScrollToTop from "../../component/ScrollToTop";
import Chatbox from "../../component/chatbox/Chatbox";
import { useSelector } from "react-redux";

function Layout() {
  const { user } = useSelector((state) => state.auth);
  return (
    <PhongTroProvider isAdmin={false}>
      <ScrollToTop />
      <div className="relative">
        <Header />
        <Outlet />
        {user ? <Chatbox /> : null}
        <Footer />
      </div>
    </PhongTroProvider>
  );
}

export default Layout;
