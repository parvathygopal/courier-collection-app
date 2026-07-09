import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { packageService } from "../../services/package.service";
import { QUERY_KEYS } from "../../constants/queryKey";

type FormValues = {
  sourceRegionCode: string;
  destinationRegionCode: string;
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
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      await packageService.createPackage({
        sourceRegionCode: values.sourceRegionCode,
        destinationRegionCode: values.destinationRegionCode,
      });

      queryClient.invalidateQueries(QUERY_KEYS.PACKAGES as any);

      setSuccessMessage("Package created successfully.");

      reset();

      setTimeout(() => {
        navigate("/packages");
      }, 1000);
    } catch (err: any) {
      console.error(err);

      const resp = err?.response?.data;

      if (resp?.details && Array.isArray(resp.details)) {
        resp.details.forEach((d: any) => {
          if (d.path) {
            setError(d.path as any, {
              type: "server",
              message: d.message,
            });
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-lg p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Package
          </h1>

          <p className="mt-2 text-gray-500">
            Enter the source and destination region codes to create a new
            logistics package.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Source Region Code
            </label>

            <input
              {...register("sourceRegionCode", {
                required: "Source region code is required",
              })}
              placeholder="e.g. CHN"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />

            {formState.errors.sourceRegionCode && (
              <p className="mt-2 text-sm text-red-600">
                {String(formState.errors.sourceRegionCode.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination Region Code
            </label>

            <input
              {...register("destinationRegionCode", {
                required: "Destination region code is required",
              })}
              placeholder="e.g. DEL"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />

            {formState.errors.destinationRegionCode && (
              <p className="mt-2 text-sm text-red-600">
                {String(formState.errors.destinationRegionCode.message)}
              </p>
            )}
          </div>

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              ✅ {successMessage}
            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Creating..." : "Create Package"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}