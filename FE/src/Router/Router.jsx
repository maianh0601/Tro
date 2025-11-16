import routerUser from "./RouterUser";
import routerAdmin from "./RouterAdmin";
import routerLandlord from "./RouterLandlord";
import { createBrowserRouter, createRoutesFromElements } from "react-router";

const Router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {routerUser}
      {routerAdmin}
      {routerLandlord}
    </>
  )
);

export default Router;
