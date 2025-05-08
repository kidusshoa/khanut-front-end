import InventoryContent from "./InventoryContent";

export default async function BusinessInventoryPage({ params }: any) {
  // Handle both Promise and non-Promise cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <InventoryContent businessId={businessId} />;
}
