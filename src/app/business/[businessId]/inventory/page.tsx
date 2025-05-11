import InventoryContent from "./InventoryContent";

// Define the params type
interface PageParams {
  businessId: string;
}

export default function BusinessInventoryPage({
  params,
}: {
  params: PageParams;
}) {
  // Use the businessId directly without awaiting
  const businessId = params.businessId;

  return <InventoryContent businessId={businessId} />;
}
