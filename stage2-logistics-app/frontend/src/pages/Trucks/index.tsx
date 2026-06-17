
import { useTrucks } from "../../hooks/useTrucks";
import { useNavigate } from "react-router-dom";

export default function Trucks() {
  const { data: trucks = [], isLoading, error } = useTrucks();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading trucks...</div>;
  if (error) return <div>Error loading trucks</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Trucks</h1>
        <button
          onClick={() => navigate("/create-truck")}
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
        >
          Create Truck
        </button>
      </div>

      <ul>
        {trucks.map((t: any) => (
          <li key={t.id} className="mb-2">
            {t.registrationNumber} — {t.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
