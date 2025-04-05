export default function AdminDashboard() {
  const stats = [
    { label: "Total Businesses", value: 120 },
    { label: "Total Users", value: 350 },
    { label: "Pending Approvals", value: 12 },
    { label: "Reviews Awaiting Moderation", value: 8 },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow text-center"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-orange-600">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <ul className="bg-white rounded-lg shadow divide-y">
          <li className="p-4">
            User JohnDoe registered a new business: "Tech Gurus"
          </li>
          <li className="p-4">
            Review submitted for "Local Bites" by user SaraA
          </li>
          <li className="p-4">Business "Fast Clean" approved</li>
        </ul>
      </div>
    </div>
  );
}
