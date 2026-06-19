import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Dashboard from "./pages/Dashboard";
import PackageList from "./pages/PackageList";
import CreatePackage from "./pages/CreatePackage";
import Bags from "./pages/Bags";
import Trucks from "./pages/Trucks";
import { CreateBagPage } from "./pages/CreateBag";
import { CreateTruckPage } from "./pages/CreateTruck";
import AssignPackage from "./pages/AssignPackage";
import AssignBag from "./pages/AssignBag";
import PackageDetails from "./pages/PackageDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "packages",
        element: <PackageList />,
      },
      {
        path: "packages/:trackingId",
        element: <PackageDetails />,
      },

      {
        path: "bags",
        element: <Bags />,
      },

      {
        path: "trucks",
        element: <Trucks />,
      },
      {
        path: "/assign-package",
        element: <AssignPackage />,
      },
      {
        path: "/assign-bag",
        element: <AssignBag />,
      },
      {
        path: "create-package",
        element: <CreatePackage />,
      },
      { path: "create-bag", element: <CreateBagPage /> },
      { path: "create-truck", element: <CreateTruckPage /> },
    ],
  },
]);
