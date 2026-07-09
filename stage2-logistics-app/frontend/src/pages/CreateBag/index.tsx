import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/queryKey";
import { bagService } from "../../services/bag.service";

export function CreateBagPage() {
  const [bagCode, setBagCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await bagService.createBag({ bagCode });

      setMessage(`Bag "${bagCode}" created successfully.`);
      setBagCode("");

      queryClient.invalidateQueries(QUERY_KEYS.BAGS as any);

      setTimeout(() => {
        navigate("/bags");
      }, 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create bag";

      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Bag
          </h1>

          <p className="mt-2 text-gray-500">
            Create a logistics bag to group packages before assigning them to a
            truck.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label
              htmlFor="bagCode"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Bag Code
            </label>

            <input
              id="bagCode"
              type="text"
              value={bagCode}
              onChange={(e) => setBagCode(e.target.value)}
              placeholder="e.g. BAG-CHN-001"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              ⚠ {error}
            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate("/bags")}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!bagCode.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Creating..." : "Create Bag"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}