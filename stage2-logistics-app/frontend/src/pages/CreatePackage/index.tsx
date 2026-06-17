import { useForm } from "react-hook-form";
import { packageService } from "../../services/package.service";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/queryKey";

type FormValues = {
  sourceRegionCode: string;
  destinationRegionCode: string;
};

export default function CreatePackage() {
  const { register, handleSubmit, formState, setError } = useForm<FormValues>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        sourceRegionCode: values.sourceRegionCode,
        destinationRegionCode: values.destinationRegionCode,
      };

      await packageService.createPackage(payload);
      queryClient.invalidateQueries(QUERY_KEYS.PACKAGES as any);
      navigate("/packages");
    } catch (err: any) {
      console.error(err);

      const resp = err?.response?.data;
      // if backend sends structured validation details, map them to form errors
      if (resp?.details && Array.isArray(resp.details)) {
        resp.details.forEach((d: any) => {
          if (d.path)
            setError(d.path as any, { type: "server", message: d.message });
        });
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Address
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Source Region Code
              </label>
              <input
                {...register("sourceRegionCode", {
                  required: "Source region code is required",
                })}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                placeholder="e.g. CHN"
              />
              {formState.errors.sourceRegionCode && (
                <p className="text-red-600 text-sm mt-1">
                  {String(formState.errors.sourceRegionCode.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Destination Region Code
              </label>
              <input
                {...register("destinationRegionCode", {
                  required: "Destination region code is required",
                })}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                placeholder="e.g. DEL"
              />
              {formState.errors.destinationRegionCode && (
                <p className="text-red-600 text-sm mt-1">
                  {String(formState.errors.destinationRegionCode.message)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Create Package
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
