"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const pathParts = pathname.split("/");
  const adminId = pathParts[2] || "defaultBusinessId";
  return (
    <div>
      <div className="flex gap-6 mb-6 border-b pb-2">
        <Link
          href={`/admin/${adminId}/businesses/approval`}
          className="text-blue-600 hover:underline"
        >
          Pending Approvals
        </Link>
        <Link
          href={`/admin/${adminId}/businesses/list`}
          className="text-blue-600 hover:underline"
        >
          Approved Businesses
        </Link>
      </div>
      {children}
    </div>
  );
}
