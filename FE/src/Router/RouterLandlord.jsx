import { Route } from "react-router";
import LandlordLayout from "../layout/Landlord/LandlordLayout";
import Dashboard from "../pages/Landlord/Dashboard";
import Rooms from "../pages/Landlord/Rooms";
import Tenants from "../pages/Landlord/Tenants";
import Contracts from "../pages/Landlord/Contracts";
import Stats from "../pages/Landlord/Stats";
import Images from "../pages/Landlord/Images";
import SuaChua from "../pages/Landlord/SuaChua";
import HoaDonCoc from "../pages/Landlord/HoaDonCoc";
import HoaDonThang from "../pages/Landlord/HoaDonThang";
import { DanhMucProvider } from "../Context/DanhMucContext";

const LayoutWithProvider = () => (
  <DanhMucProvider>
    <LandlordLayout />
  </DanhMucProvider>
);

const routerLandlord = (
  <Route path="/landlord" element={<LayoutWithProvider />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="rooms" element={<Rooms />} />
    <Route path="tenants" element={<Tenants />} />
    <Route path="contracts" element={<Contracts />} />
    <Route path="stats" element={<Stats />} />
    <Route path="images" element={<Images />} />
    <Route path="suachua" element={<SuaChua />} />
    <Route path="hoadoncoc" element={<HoaDonCoc />} />
    <Route path="hoadonthang" element={<HoaDonThang />} />
  </Route>
);

export default routerLandlord;

