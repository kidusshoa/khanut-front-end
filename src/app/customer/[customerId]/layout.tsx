import { ReactNode } from "react";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full ">
      <div className=" w-full h-full">{children}</div>
    </div>
  );
}
