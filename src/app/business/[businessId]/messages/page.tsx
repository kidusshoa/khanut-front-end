import MessagesContent from "./MessagesContent";

export default async function BusinessMessagesPage({ params }: any) {
  // Handle both Promise and non-Promise cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <MessagesContent businessId={businessId} />;
}
