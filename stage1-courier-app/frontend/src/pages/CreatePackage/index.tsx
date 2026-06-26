import { useForm } from "react-hook-form";
import { packageService } from "../../services/package.service";
import { useNavigate } from "react-router-dom";

type FormValues = {
  senderAddress: string;
  receiverAddress: string;
  sourceRegion: string;
  destinationRegion: string;
  weight?: number;
};

export default function CreatePackage() {
  const { register, handleSubmit, formState, setError } = useForm<FormValues>();
  const navigate = useNavigate();

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        senderAddress: values.senderAddress,
        receiverAddress: values.receiverAddress,
        sourceRegion: values.sourceRegion,
        destinationRegion: values.destinationRegion,
        weight: values.weight,
      };

      await packageService.createPackage(payload);
      navigate("/packages");
    } catch (err: any) {
      console.error(err);

      const resp = err?.response?.data;
      if (Array.isArray(resp)) {
        resp.forEach((e: any) => {
          if (e.field)
            setError(e.field as any, { type: "server", message: e.message });
        });
      }
    }
  };

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Package</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Address
            </label>
            <input
              {...register("senderAddress", {
                required: "Sender address is required",
              })}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="Sender Address"
            />
            {formState.errors.senderAddress && (
              <p className="text-red-600 text-sm mt-1">
                {String(formState.errors.senderAddress.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receiver Address
            </label>
            <input
              {...register("receiverAddress", {
                required: "Receiver address is required",
              })}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="Receiver Address"
            />
            {formState.errors.receiverAddress && (
              <p className="text-red-600 text-sm mt-1">
                {String(formState.errors.receiverAddress.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source Region
            </label>
            <input
              {...register("sourceRegion", {
                required: "Source region is required",
              })}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="Source Region"
            />
            {formState.errors.sourceRegion && (
              <p className="text-red-600 text-sm mt-1">
                {String(formState.errors.sourceRegion.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destination Region
            </label>
            <input
              {...register("destinationRegion", {
                required: "Destination region is required",
              })}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="Destination Region"
            />
            {formState.errors.destinationRegion && (
              <p className="text-red-600 text-sm mt-1">
                {String(formState.errors.destinationRegion.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("weight", { valueAsNumber: true })}
              className="mt-1 block w-48 rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="Weight"
            />
            {formState.errors.weight && (
              <p className="text-red-600 text-sm mt-1">
                {String(formState.errors.weight.message)}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? "Creating…" : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
