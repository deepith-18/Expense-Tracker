import React from 'react';
import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  TrendingUp,
  Wallet,
  Sparkles,
  CreditCard,
  Banknote,
  Building,
  Tag,
  CircleDollarSign,
  Coffee,
  Fuel,
  Home,
  AlertCircle,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  TrendingUp,
  Wallet,
  Sparkles,
  CreditCard,
  Banknote,
  Building,
  Tag,
  CircleDollarSign,
  Coffee,
  Fuel,
  Home,
  AlertCircle,
};

interface IconHelperProps extends LucideProps {
  name: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
};
