import { useState } from "react";
import { useForm } from "react-hook-form";
import { packageService } from "../../services/package.service";
import { useNavigate } from "react-router-dom";
import { useRegions } from "../../hooks/useRegions";

type FormValues = {
  senderAddress: string;
  receiverAddress: string;
  sourceRegion: string;
  destinationRegion: string;
  weight?: number;
  saleAmount?: number;
};

export default function CreatePackage() {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    reset,
  } = useForm<FormValues>();

  const navigate = useNavigate();
  const { data: regions = [], isLoading: isLoadingRegions } = useRegions();

  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");

  const onSubmit = async (values: FormValues) => {
    setSuccess("");
    setServerError("");

    try {
      await packageService.createPackage(values);

      setSuccess("Package created successfully.");
      reset();

      setTimeout(() => navigate("/packages"), 1000);
    } catch (err: any) {
      console.error(err);

      const resp = err?.response?.data;

      if (Array.isArray(resp)) {
        resp.forEach((e: any) => {
          if (e.field) {
            setError(e.field as any, {
              type: "server",
              message: e.message,
            });
          }
        });
      } else {
        setServerError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to create package."
        );
      }
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Package
          </h1>

          <p className="mt-2 text-gray-500">
            Enter package details to create a new shipment.
          </p>
        </div>

        {isLoadingRegions ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading regions...</div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Sender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sender Address
                </label>

                <input
                  {...register("senderAddress", {
                    required: "Sender address is required",
                  })}
                  placeholder="Enter sender address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                {formState.errors.senderAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {String(formState.errors.senderAddress.message)}
                  </p>
                )}
              </div>

              {/* Receiver */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Receiver Address
                </label>

                <input
                  {...register("receiverAddress", {
                    required: "Receiver address is required",
                  })}
                  placeholder="Enter receiver address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                {formState.errors.receiverAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {String(formState.errors.receiverAddress.message)}
                  </p>
                )}
              </div>

              {/* Source Region */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source Region
                </label>

                <select
                  {...register("sourceRegion", {
                    required: "Source region is required",
                  })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select source region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.code}>
                      {region.name} ({region.code})
                    </option>
                  ))}
                </select>

                {formState.errors.sourceRegion && (
                  <p className="mt-2 text-sm text-red-600">
                    {String(formState.errors.sourceRegion.message)}
                  </p>
                )}
              </div>

              {/* Destination Region */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination Region
                </label>

                <select
                  {...register("destinationRegion", {
                    required: "Destination region is required",
                  })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select destination region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.code}>
                      {region.name} ({region.code})
                    </option>
                  ))}
                </select>

                {formState.errors.destinationRegion && (
                  <p className="mt-2 text-sm text-red-600">
                    {String(formState.errors.destinationRegion.message)}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  step="0.01"
                  {...register("weight", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g. 2.5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Sale Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sale Amount (Optional)
                </label>

                <input
                  type="number"
                  step="0.01"
                  {...register("saleAmount", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g. 999.99"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">
                ✅ {success}
              </div>
            )}

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                ⚠ {serverError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formState.isSubmitting}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {formState.isSubmitting
                  ? "Creating..."
                  : "Create Package"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}