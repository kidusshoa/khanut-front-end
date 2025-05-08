import ProfileContent from "./ProfileContent";

export default async function BusinessProfilePage({ params }: any) {
  // Handle both Promise and non-Promise cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <ProfileContent businessId={businessId} />;
}
