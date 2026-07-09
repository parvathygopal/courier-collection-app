import { useNavigate } from "react-router-dom";
import { useTrucks } from "../../hooks/useTrucks";

export default function Trucks() {
  const { data: trucks = [], isLoading, error } = useTrucks();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="text-gray-500">Loading trucks...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load trucks.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Trucks
          </h1>
          <p className="text-gray-500 mt-1">
            Manage trucks used for transporting courier bags.
          </p>
        </div>

        <button
          onClick={() => navigate("/create-truck")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Create Truck
        </button>
      </div>

      {trucks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-5xl mb-4">🚚</div>

          <h2 className="text-xl font-semibold text-gray-700">
            No trucks available
          </h2>

          <p className="text-gray-500 mt-2">
            Create your first truck to start assigning courier bags.
          </p>

          <button
            onClick={() => navigate("/create-truck")}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg"
          >
            Create Truck
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trucks.map((truck: any) => (
            <div
              key={truck.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  🚚 {truck.registrationNumber}
                </h2>

                <span className="rounded-full bg-green-100 text-green-700 text-xs px-3 py-1">
                  Available
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Registration</span>
                  <span className="font-medium">
                    {truck.registrationNumber}
                  </span>
                </div>

                {truck.driverName && (
                  <div className="flex justify-between">
                    <span>Driver</span>
                    <span>{truck.driverName}</span>
                  </div>
                )}

                {truck.capacity && (
                  <div className="flex justify-between">
                    <span>Capacity</span>
                    <span>{truck.capacity}</span>
                  </div>
                )}

                {truck.createdAt && (
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>
                      {new Date(truck.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}