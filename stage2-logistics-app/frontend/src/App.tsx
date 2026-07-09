import { NavLink, Outlet } from "react-router-dom";

function App() {
  const linkClass = (isActive: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              📦
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Courier Logistics
              </h1>
              <p className="text-xs text-gray-500">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-2">

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
              to="/bags"
              className={({ isActive }) => linkClass(isActive)}
            >
              Bags
            </NavLink>

            <NavLink
              to="/trucks"
              className={({ isActive }) => linkClass(isActive)}
            >
              Trucks
            </NavLink>

            <NavLink
              to="/assign-package"
              className={({ isActive }) => linkClass(isActive)}
            >
              Assign Package
            </NavLink>

            <NavLink
              to="/assign-bag"
              className={({ isActive }) => linkClass(isActive)}
            >
              Assign Bag
            </NavLink>

          </nav>

          {/* Mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            ☰
          </button>

        </div>
      </header>

      {/* Main Content */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

    </div>
  );
}

export default App;