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

      <ul>
        {bags.map((b: any) => (
          <li key={b.id} className="mb-2">
            {b.bagCode} — {b.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
