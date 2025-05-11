import ProductsContent from "./ProductsContent";

export default async function BusinessProductsPage({ params }: any) {
  // Handle both Promise and non-Promise cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <ProductsContent businessId={businessId} />;
}
