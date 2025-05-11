import ProfileContent from "./ProfileContent";

// Define the params type
interface PageParams {
  businessId: string;
}

export default function BusinessProfilePage({
  params,
}: {
  params: PageParams;
}) {
  // Use the businessId directly without awaiting
  const businessId = params.businessId;

  return <ProfileContent businessId={businessId} />;
}
