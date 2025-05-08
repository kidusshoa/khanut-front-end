import OrdersContent from "./OrdersContent";

export default async function BusinessOrdersPage({ params }: any) {
  // Handle both Promise and non-Promise cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <OrdersContent businessId={businessId} />;
}
