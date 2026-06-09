import { usePackages } from "../../hooks/usePackages";

export default function PackageList() {
  const { data, isLoading } = usePackages();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Tracking ID</th>
          <th>Status</th>
          <th>Source</th>
          <th>Destination</th>
        </tr>
      </thead>

      <tbody>
        {data?.map((pkg: any) => (
          <tr key={pkg.id}>
            <td>{pkg.trackingId}</td>
            <td>{pkg.currentStatus}</td>
            <td>{pkg.sourceRegion}</td>
            <td>{pkg.destinationRegion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
