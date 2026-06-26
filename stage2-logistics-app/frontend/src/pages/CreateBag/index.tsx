import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/queryKey";
import { bagService } from "../../services/bag.service";

export function CreateBagPage() {
  const [bagCode, setBagCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const data = await bagService.createBag({ bagCode });
      setMessage(`Bag created: ${data.id}`);
      setBagCode("");
      queryClient.invalidateQueries(QUERY_KEYS.BAGS as any);
      navigate("/bags");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create bag";
      setError(msg);
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Bag</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Bag code</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            value={bagCode}
            onChange={(e) => setBagCode(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create bag
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </main>
  );
}
