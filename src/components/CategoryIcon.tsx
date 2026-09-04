import React from 'react';
import {
  Bike,
  Ticket,
  Smartphone,
  Wrench,
  Activity,
  Coffee,
  Wifi,
  Wine,
  Receipt,
  Briefcase,
  Clock,
  PlusCircle,
  ArrowRightLeft,
  DollarSign,
} from 'lucide-react';

interface CategoryIconProps {
  category?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5' }) => {
  switch (category) {
    case 'bike_rental':
      return <Bike className={className} />;
    case 'seat':
      return <Ticket className={className} />;
    case 'mobile_rental':
      return <Smartphone className={className} />;
    case 'bike_repair':
      return <Wrench className={className} />;
    case 'hospital':
      return <Activity className={className} />;
    case 'daily_expenses':
      return <Coffee className={className} />;
    case 'internet_reload':
      return <Wifi className={className} />;
    case 'liquor':
      return <Wine className={className} />;
    case 'other_bills':
      return <Receipt className={className} />;
    case 'basic_salary':
      return <Briefcase className={className} />;
    case 'ot_amount':
      return <Clock className={className} />;
    case 'other_income':
      return <PlusCircle className={className} />;
    case 'transfer':
      return <ArrowRightLeft className={className} />;
    default:
      return <DollarSign className={className} />;
  }
};
