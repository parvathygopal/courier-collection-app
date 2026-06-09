import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <div className="container">
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/packages">Packages</Link>{" "}
        <Link to="/packages/new">Create Package</Link>
      </nav>

      <hr />

      <Outlet />
    </div>
  );
}

export default App;
