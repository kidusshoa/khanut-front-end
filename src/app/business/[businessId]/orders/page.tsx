import OrdersContent from "./OrdersContent";

// Define the params type
interface PageParams {
  businessId: string;
}

export default function BusinessOrdersPage({ params }: { params: PageParams }) {
  // Use the businessId directly without awaiting
  const businessId = params.businessId;

  return <OrdersContent businessId={businessId} />;
}
