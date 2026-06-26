// src/pages/AssignPackage/index.tsx

import { useState } from "react";
import { usePackages } from "../../hooks/usePackages";
import { useBags } from "../../hooks/useBags";
import { packageService } from "../../services/package.service";

export default function AssignPackage() {
  const { data: packages = [] } = usePackages();
  const { data: bags = [] } = useBags();

  const [packageId, setPackageId] = useState("");
  const [bagId, setBagId] = useState("");

  const handleAssign = async () => {
    await packageService.assignPackageToBag(bagId, packageId);
    alert("Package assigned successfully");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Package To Bag</h1>

      <select
        className="w-full border rounded p-2 mb-4"
        value={packageId}
        onChange={(e) => setPackageId(e.target.value)}
      >
        <option value="">Select Package</option>

        {packages?.map((pkg: any) => (
          <option key={pkg.id} value={pkg.id}>
            {pkg.trackingId}
          </option>
        ))}
      </select>

      <select
        className="w-full border rounded p-2 mb-4"
        value={bagId}
        onChange={(e) => setBagId(e.target.value)}
      >
        <option value="">Select Bag</option>

        {bags.length > 0 &&
          bags?.map((bag: any) => (
            <option key={bag.id} value={bag.id}>
              {bag.bagCode}
            </option>
          ))}
      </select>

      <button
        onClick={handleAssign}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Assign
      </button>
    </div>
  );
}
