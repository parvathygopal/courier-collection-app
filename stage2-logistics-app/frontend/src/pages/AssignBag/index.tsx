import { useState } from "react";
import { useBags } from "../../hooks/useBags";
import { useTrucks } from "../../hooks/useTrucks";
import { truckService } from "../../services/truck.service";

export default function AssignBag() {
  const { data: bags = [] } = useBags();
  const { data: trucks = [] } = useTrucks();

  const [bagId, setBagId] = useState("");
  const [truckId, setTruckId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!bagId || !truckId) {
      setError("Please select both a bag and a truck.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");

      await truckService.assignBagToTruck(truckId, bagId);

      setMessage("Bag assigned successfully.");

      setBagId("");
      setTruckId("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to assign bag.";

      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            <option value="">Select Truck</option>

            {trucks.map((truck: any) => (
              <option key={truck.id} value={truck.id}>
                {truck.registrationNumber}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 mb-6">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-6">
            ⚠ {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setBagId("");
              setTruckId("");
              setMessage("");
              setError("");
            }}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
          >
            Reset
          </button>

          <button
            onClick={handleAssign}
            disabled={!bagId || !truckId || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            {isSubmitting ? "Assigning..." : "Assign Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}