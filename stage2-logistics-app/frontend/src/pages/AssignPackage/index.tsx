import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePackages } from "../../hooks/usePackages";
import { useBags } from "../../hooks/useBags";
import { packageService } from "../../services/package.service";
import { QUERY_KEYS } from "../../constants/queryKey";

export default function AssignPackage() {
  const queryClient = useQueryClient();
  const { data: packages = [] } = usePackages();
  const { data: bags = [] } = useBags();

  const [packageId, setPackageId] = useState("");
  const [bagId, setBagId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!packageId || !bagId) {
      setError("Please select both a package and a bag.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");

      await packageService.assignPackageToBag(bagId, packageId);

      setMessage("Package assigned successfully.");

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PACKAGES,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BAGS,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD,
      });

      setPackageId("");
      setBagId("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to assign package.";

      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-200 p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Assign Package to Bag
          </h1>

          <p className="mt-2 text-gray-500">
            Select a package and assign it to a logistics bag.
          </p>
        </div>

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Package
            </label>

            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="">Select Package</option>

              {packages.map((pkg: any) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.trackingId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bag
            </label>

            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
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
              onClick={() => {
                setPackageId("");
                setBagId("");
                setMessage("");
                setError("");
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Reset
            </button>

            <button
              onClick={handleAssign}
              disabled={!packageId || !bagId || isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Assigning..." : "Assign Package"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}