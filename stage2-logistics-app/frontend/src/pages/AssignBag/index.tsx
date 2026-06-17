// src/pages/AssignBag/index.tsx

import { useState } from "react";
import { useBags } from "../../hooks/useBags";
import { useTrucks } from "../../hooks/useTrucks";
import { truckService } from "../../services/truck.service";

export default function AssignBag() {
  const { data: bags = [] } = useBags();
  const { data: trucks = [] } = useTrucks();

  console.log(bags, trucks);

  const [bagId, setBagId] = useState("");
  const [truckId, setTruckId] = useState("");

  const handleAssign = async () => {
    await truckService.assignBagToTruck(truckId, bagId);
    alert("Bag assigned successfully");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Bag To Truck</h1>

      <select
        className="w-full border rounded p-2 mb-4"
        value={bagId}
        onChange={(e) => setBagId(e.target.value)}
      >
        <option>Select Bag</option>

        {bags.length > 0 &&
          bags?.map((bag: any) => (
            <option key={bag.id} value={bag.id}>
              {bag.bagCode}
            </option>
          ))}
      </select>

      <select
        className="w-full border rounded p-2 mb-4"
        value={truckId}
        onChange={(e) => setTruckId(e.target.value)}
      >
        <option>Select Truck</option>

        {trucks.length > 0 &&
          trucks?.map((truck: any) => (
            <option key={truck.id} value={truck.id}>
              {truck.registrationNumber}
            </option>
          ))}
      </select>

      <button
        onClick={handleAssign}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Assign
      </button>
    </div>
  );
}
