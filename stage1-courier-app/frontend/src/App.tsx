import { NavLink, Outlet } from "react-router-dom";

function App() {
  const linkClass = (isActive: boolean) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="container">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <h2 className="text-lg font-bold">Courier</h2>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => linkClass(isActive)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/packages"
              className={({ isActive }) => linkClass(isActive)}
            >
              Packages
            </NavLink>
            <NavLink
              to="/packages/new"
              className={({ isActive }) => linkClass(isActive)}
            >
              Create Package
            </NavLink>
          </nav>
        </div>

        <div className="md:hidden">
          <button
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() =>
              alert("Use larger screen to navigate or implement a mobile menu")
            }
          >
            ☰
          </button>
        </div>
      </header>

      <div className="mb-6 border-b border-gray-200" />

      <Outlet />
    </div>
  );
}

export default App;
