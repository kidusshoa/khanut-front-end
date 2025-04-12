import { Card, BaseCardProps } from '../common/Card';

interface BusinessCardProps extends BaseCardProps {
  category: string;
  rating?: number;
  location?: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = (props) => {
  return <Card {...props} />;
}