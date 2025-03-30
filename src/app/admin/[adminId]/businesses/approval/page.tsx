const businesses = [
  {
    id: 1,
    name: "Tech Gurus",
    owner: "JohnDoe",
    status: "pending",
    location: "Addis Ababa",
    description: "We fix and sell all kinds of electronics.",
    legalDoc: "/docs/tech-gurus-license.pdf",
  },
];

export default function ApprovalPage() {
  const pendingBusinesses = businesses.filter((b) => b.status === "pending");

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold">Business Approvals</h2>
      <p className="text-gray-600 mb-4">
        Review and approve new business applications.
      </p>

      <div className="grid gap-4">
        {pendingBusinesses.map((biz) => (
          <div key={biz.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{biz.name}</h3>
            <p>
              <strong>Owner:</strong> {biz.owner}
            </p>
            <p>
              <strong>Location:</strong> {biz.location}
            </p>
            <p>
              <strong>Description:</strong> {biz.description}
            </p>
            <p>
              <strong>Legal Document:</strong>{" "}
              <a
                href={biz.legalDoc}
                target="_blank"
                className="text-blue-600 underline"
              >
                View Document
              </a>
            </p>
            <div className="mt-4 flex space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded">
                Approve
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
