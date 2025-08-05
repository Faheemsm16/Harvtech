import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

const categories = [
  {
    id: 'seeds',
    name: 'Seeds',
    description: 'Crop seeds and planting materials',
    icon: Sprout,
    color: 'green'
  },
  {
    id: 'crops',
    name: 'Crops',
    description: 'Harvested crops and grains',
    icon: Wheat,
    color: 'yellow'
  },
  {
    id: 'fertilizers',
    name: 'Fertilizers/Manure',
    description: 'Organic and chemical fertilizers, manure',
    icon: Package,
    color: 'blue'
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    description: 'Milk, cheese, and dairy products',
    icon: Milk,
    color: 'purple'
  }
];

export default function SellCategoryPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/sell/upload?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{t('sell')} {t('marketplace')}</h2>
            <p className="text-sm opacity-90">Select a category for your product</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id} className="bg-white border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-900">{t(category.id as keyof typeof t)}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="ml-auto text-gray-400">→</div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}