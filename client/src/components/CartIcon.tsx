import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';

export function CartIcon() {
  const { getTotalItems } = useCart();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const totalItems = getTotalItems();

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