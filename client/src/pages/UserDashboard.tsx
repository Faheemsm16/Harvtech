import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tractor, Wrench, Settings, Network, Bell, User, LogOut, Package, Menu, Package2, MoreVertical } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useCustomAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { SchemesModal } from "@/components/SchemesModal";

interface Booking {
  id: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: string;
  paymentStatus: string;
  equipment: {
    name: string;
    type: string;
    imageUrl?: string;
  };
}

export default function UserDashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, logout } = useCustomAuth();
  const [showSchemes, setShowSchemes] = useState(false);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/user/bookings'],
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const navigateToEquipment = (type: string) => {
    setLocation(`/equipment/${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Hamburger menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 p-2 rounded-full"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border-gray-200">
                <DropdownMenuItem 
                  onClick={() => setLocation('/my-orders')}
                  className="hover:bg-gray-100 focus:bg-gray-100"
                >
                  <Package2 className="h-4 w-4 mr-2" />
                  My Orders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('welcome')}</h2>
              <p className="text-sm opacity-90">{user?.name || 'User'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/10 p-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Farmer ID */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-3">
            <p className="text-xs opacity-75 mb-1">{t('farmer_id')}</p>
            <p className="font-mono text-sm">{user?.farmerId || 'FRM-000000'}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Machine Lease Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('machine_lease')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Tractor */}
            <Button
              variant="outline"
              onClick={() => navigateToEquipment('tractor')}
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-white border border-gray-200 hover:border-ag-green"
            >
              <Tractor className="h-8 w-8 text-ag-green" />
              <span className="text-sm font-medium">{t('tractor')}</span>
            </Button>
            
            {/* Tiller */}
            <Button
              variant="outline"
              onClick={() => navigateToEquipment('tiller')}
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-white border border-gray-200 hover:border-ag-green"
            >
              <Wrench className="h-8 w-8 text-ag-green" />
              <span className="text-sm font-medium">{t('tiller')}</span>
            </Button>
            

          </div>
        </div>
        
        {/* Equipment Sale Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Equipment Sale</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Weeder */}
            <Button
              variant="outline"
              onClick={() => navigateToEquipment('weeder')}
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-white border border-gray-200 hover:border-ag-green"
            >
              <Wrench className="h-8 w-8 text-ag-green" />
              <span className="text-sm font-medium">{t('weeder')}</span>
            </Button>
          </div>
        </div>
        
        {/* My Bookings Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('my_bookings') || 'My Bookings'}</h3>
          {bookingsLoading ? (
            <div className="text-center py-4">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <Card className="bg-white border border-gray-200 p-6">
              <div className="text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No bookings yet</p>
                <p className="text-sm">Book equipment to see your rentals here</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 2).map((booking: Booking) => (
                <Card key={booking.id} className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={booking.equipment?.imageUrl || `https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200`}
                          alt={booking.equipment?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{booking.equipment?.name}</h4>
                        <p className="text-xs text-gray-600 capitalize">{booking.equipment?.type}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-green-600 font-medium">
                            {booking.paymentStatus === 'paid' ? 'Advance Paid' : 'Pending'}
                          </span>
                          <span className="text-xs font-bold text-ag-green">₹{booking.totalCost}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Other Services */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setLocation('/platforms')}
            className="w-full bg-white border border-gray-200 p-4 h-auto justify-start hover:border-ag-orange"
          >
            <Network className="h-5 w-5 text-ag-orange mr-3" />
            <span className="font-medium">{t('platforms')}</span>
            <span className="ml-auto text-gray-400">→</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setLocation('/services')}
            className="w-full bg-white border border-gray-200 p-4 h-auto justify-start hover:border-ag-orange"
          >
            <Bell className="h-5 w-5 text-ag-orange mr-3" />
            <span className="font-medium">{t('services')}</span>
            <span className="ml-auto text-gray-400">→</span>
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      <SchemesModal isOpen={showSchemes} onClose={() => setShowSchemes(false)} />
    </div>
  );
}
