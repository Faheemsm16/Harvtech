import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Network, Bell, User, LogOut, Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Equipment {
  id: string;
  name: string;
  type: string;
  modelNumber: string;
  chassisNumber: string;
  power?: string;
  year?: number;
  availability: string;
  imageUrl?: string;
}

export default function OwnerDashboard() {
  const { t } = useLanguage();
  const { user, logout } = useCustomAuth();
  const [, setLocation] = useLocation();

  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ['/api/owner/equipment'],
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const getEquipmentImage = (type: string) => {
    switch (type) {
      case 'tractor':
        return 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
      case 'weeder':
        return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
      case 'tiller':
        return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
      default:
        return 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
    }
  };

  const primaryEquipment = equipment[0] as Equipment | undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-brown text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm opacity-75">{t('owner')}</p>
              <h2 className="font-semibold">{user?.name || 'Owner'}</h2>
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
      </div>
      
      {/* Vehicle Information */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading equipment...</div>
        ) : equipment.length > 0 ? (
          <div className="space-y-4 mb-6">
            {equipment.map((item: Equipment) => (
              <Card key={item.id} className="bg-white border border-gray-200 overflow-hidden">
                {/* Vehicle Image */}
                <div className="h-48 bg-gray-100">
                  <img 
                    src={item.imageUrl || getEquipmentImage(item.type)} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Vehicle Details */}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="text-xs bg-ag-green/10 text-ag-green px-2 py-1 rounded capitalize">
                      {item.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">{t('model')}:</span>
                      <p className="font-medium">{item.modelNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('year')}:</span>
                      <p className="font-medium">{item.year || '2022'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('chassis_no')}:</span>
                      <p className="font-medium font-mono text-xs">{item.chassisNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('status')}:</span>
                      <p className="font-medium text-green-600 capitalize">{item.availability}</p>
                    </div>
                  </div>
                  {item.power && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">{t('power')}:</span>
                        <span className="font-semibold text-ag-green">{item.power}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border border-gray-200 p-6 mb-6">
            <div className="text-center text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No equipment registered yet</p>
              <p className="text-sm mt-1">Register your equipment to start earning</p>
            </div>
          </Card>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 font-semibold">
            <Network className="h-5 w-5 mr-2" />
            <span>{t('platform')}</span>
          </Button>
          
          <Button className="w-full bg-ag-orange hover:bg-ag-orange/90 text-white py-6 font-semibold">
            <Bell className="h-5 w-5 mr-2" />
            <span>{t('services')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
