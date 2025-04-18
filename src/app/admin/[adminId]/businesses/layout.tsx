"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const pathParts = pathname.split("/");
  const adminId = pathParts[2] || "defaultBusinessId";

  return (
    <div>
      <div className="flex gap-6 mb-6 border-b pb-2">
        <Link
          href={`/admin/${adminId}/businesses/approval`}
          className="text-black bg-orange-100 p-2 rounded-lg hover:bg-orange-200"
          onClick={(e) => {
            // If not authenticated, prevent default navigation and redirect to login
            if (!isAuthenticated && !token) {
              e.preventDefault();
              router.push("/login");
            }
          }}
        >
          Pending Approvals
        </Link>
        <Link
          href={`/admin/${adminId}/businesses/list`}
          className="text-black  bg-orange-100 p-2 rounded-lg hover:bg-orange-200"
          onClick={(e) => {
            // If not authenticated, prevent default navigation and redirect to login
            if (!isAuthenticated && !token) {
              e.preventDefault();
              router.push("/login");
            }
          }}
        >
          Approved Businesses
        </Link>
      </div>
      {children}
    </div>
  );
}
