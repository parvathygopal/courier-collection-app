import { useState } from "react";
import { useBags } from "../../hooks/useBags";
import { useTrucks } from "../../hooks/useTrucks";
import { truckService } from "../../services/truck.service";

export default function AssignBag() {
  const { data: bags = [] } = useBags();
  const { data: trucks = [] } = useTrucks();

  const [bagId, setBagId] = useState("");
  const [truckId, setTruckId] = useState("");

  const handleAssign = async () => {
    if (!bagId || !truckId) {
      alert("Please select both a bag and a truck");
      return;
    }

    await truckService.assignBagToTruck(truckId, bagId);
    alert("Bag assigned successfully");
  };

  return (
    <div className="flex justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md border p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Assign Bag to Truck
        </h1>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bag
          </label>

          <select
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={bagId}
            onChange={(e) => setBagId(e.target.value)}
          >
            <option value="">Select Bag</option>

            {bags.map((bag: any) => (
              <option key={bag.id} value={bag.id}>
                {bag.bagCode}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Truck
          </label>

          <select
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={truckId}
            onChange={(e) => setTruckId(e.target.value)}
          >
            <option value="">Select Truck</option>

            {trucks.map((truck: any) => (
              <option key={truck.id} value={truck.id}>
                {truck.registrationNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAssign}
            disabled={!bagId || !truckId}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Assign Bag
          </button>
        </div>
      </div>
    </div>
  );
}