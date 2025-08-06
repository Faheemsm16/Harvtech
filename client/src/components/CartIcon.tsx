import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';

export function CartIcon() {
  const { getTotalItems, items, formatUnit } = useCart();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const totalItems = getTotalItems();
  
  // Calculate total units for display
  const totalUnits = items.reduce((total, item) => {
    if (item.unit === 'kg' || item.unit === 'liter') {
      return total + item.quantity;
    }
    return total + (item.quantity / 1000); // Convert gm/ml to kg/liter for display
  }, 0);

  return (
    <button
      onClick={() => setLocation('/marketplace/cart')}
      className="relative p-2 text-green-600 hover:text-green-700 transition-colors"
      aria-label={t('cart')}
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}