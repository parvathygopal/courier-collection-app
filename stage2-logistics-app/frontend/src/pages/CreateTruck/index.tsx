import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/queryKey";
import { useNavigate } from "react-router-dom";
import { truckService } from "../../services/truck.service";
export function CreateTruckPage() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const data = await truckService.createTruck({ registrationNumber });
      setMessage(`Truck created: ${data.id}`);
      setRegistrationNumber("");
      queryClient.invalidateQueries(QUERY_KEYS.TRUCKS as any);
      navigate("/trucks");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create truck";
      setError(msg);
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Truck</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Registration number</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create truck
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </main>
  );
}
