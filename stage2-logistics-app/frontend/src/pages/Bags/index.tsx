import { useBags } from "../../hooks/useBags";
import { useNavigate } from "react-router-dom";

export default function Bags() {
  const { data: bags = [], isLoading, error } = useBags();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading bags...</div>;
  if (error) return <div>Error loading bags</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Bags</h1>
        <button
          onClick={() => navigate("/create-bag")}
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
        >
          Create Bag
        </button>
      </div>

      <div className="grid gap-4">
  {bags.map((bag) => (
    <div
      key={bag.id}
      className="rounded-xl border bg-white shadow-sm p-5"
    >
      <div className="flex justify-between">
        <h2 className="font-semibold text-lg">
          📦 {bag.bagCode}
        </h2>

        <span className="text-sm text-gray-500">
          {bag.packages?.length ?? 0} Packages
        </span>
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>
          <strong>Truck:</strong>{" "}
          {bag.truck?.registrationNumber ?? "Not Assigned"}
        </p>

        <p>
          <strong>Created:</strong>{" "}
          {new Date(bag.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}
