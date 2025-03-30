const businesses = [
  {
    id: 2,
    name: "Local Bites",
    owner: "SaraA",
    status: "approved",
    location: "Dire Dawa",
    description: "Local cuisine restaurant with fast service.",
    legalDoc: "/docs/local-bites-license.pdf",
  },
];

export default function BusinessListPage() {
  const approvedBusinesses = businesses.filter((b) => b.status === "approved");

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold">Approved Businesses</h2>
      <p className="text-gray-600 mb-4">
        A full list of verified and approved businesses.
      </p>

      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-blue-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Owner</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Legal Document</th>
          </tr>
        </thead>
        <tbody>
          {approvedBusinesses.map((biz) => (
            <tr key={biz.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium text-blue-900">{biz.name}</td>
              <td className="p-3">{biz.owner}</td>
              <td className="p-3">{biz.location}</td>
              <td className="p-3 text-sm">{biz.description}</td>
              <td className="p-3">
                <a
                  href={biz.legalDoc}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
