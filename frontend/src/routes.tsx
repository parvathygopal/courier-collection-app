import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Dashboard from "./pages/Dashboard";
import PackageList from "./pages/PackageList";
import CreatePackage from "./pages/CreatePackage";
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
        path: "packages/new",
        element: <CreatePackage />,
      },
      {
        path: "packages/:trackingId",
        element: <PackageDetails />,
      },
    ],
  },
]);
