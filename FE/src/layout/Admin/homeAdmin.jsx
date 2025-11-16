import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import { PhongTroProvider } from "../../Context/PhongTroContext";
import { useNavigate } from "react-router";
import { axiosInstance } from "../../../Axios";
import Spinner from "../../component/Loading";

function Admin() {
  const [checking, setChecking] = useState(true);
  const [activeComponent, setActiveComponent] = useState("admin");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get("/admin/check-admin");
        setChecking(false); // Đã xác thực
      } catch (error) {
        navigate("/admin/login");
      }
    };

    checkAuth();
  }, [navigate]);
  if (checking) return <Spinner />;
  return (
    <PhongTroProvider isAdmin={true}>
      <div className="flex h-screen">
        <AdminSidebar
          setActiveComponent={setActiveComponent}
          activeComponent={activeComponent}
        />
        <div className="flex-1 overflow-y-auto ">
          <AdminDashboard activeComponent={activeComponent} />
        </div>
      </div>
    </PhongTroProvider>
  );
}

export default Admin;
