import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Network, 
  Bell, 
  User, 
  LogOut, 
  MoreVertical,
  Battery,
  Lock,
  Unlock,
  Power,
  Scan,
  MapPin,
  Map,
  FolderOpen,
  Plus
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SchemesModal } from "@/components/SchemesModal";
import { ServicesModal } from "@/components/ServicesModal";
import { OwnerEquipmentModal } from "@/components/OwnerEquipmentModal";

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
  const [showSchemes, setShowSchemes] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showOwnerEquipment, setShowOwnerEquipment] = useState(false);
  
  // Tractor control states
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [isLocked, setIsLocked] = useState(true);
  const [engineRunning, setEngineRunning] = useState(false);
  const [soilScanActive, setSoilScanActive] = useState(false);
  const [tractorRotation, setTractorRotation] = useState({ x: 0, y: 0 });
  
  // 3D model interaction
  const tractorRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ['/api/owner/equipment'],
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  // Touch/Mouse interaction handlers for 3D tractor
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;
    
    setTractorRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - lastPosition.current.x;
    const deltaY = e.touches[0].clientY - lastPosition.current.y;
    
    setTractorRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Control handlers
  const toggleLock = () => setIsLocked(!isLocked);
  const toggleEngine = () => {
    if (!isLocked) {
      setEngineRunning(!engineRunning);
    }
  };
  const toggleSoilScan = () => setSoilScanActive(!soilScanActive);

  // Battery indicator with estimated time
  const getBatteryTime = () => {
    const hours = Math.floor(batteryLevel * 0.12); // Rough estimate
    return `${hours}h ${Math.floor((batteryLevel * 0.12 - hours) * 60)}m`;
  };

  const primaryEquipment = equipment[0] as Equipment | undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md text-white p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {/* Left side with hamburger menu and user info */}
          <div className="flex items-center space-x-3">
            {/* Three dots menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 p-2 rounded-full"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-slate-800/95 border-slate-600 text-white">
                <DropdownMenuItem 
                  onClick={() => setLocation('/platforms')}
                  className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                >
                  <Network className="h-4 w-4 mr-2" />
                  {t('platforms') || 'Platforms'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowServices(true)}
                  className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t('services') || 'Services'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User avatar and info */}
            <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center border border-blue-400/30">
              <User className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <p className="text-xs opacity-75 text-blue-200">{t('tractor_owner') || 'Tractor Owner'}</p>
              <h2 className="font-semibold text-sm">{user?.name || 'Smart Farmer'}</h2>
            </div>
          </div>
          
          {/* Logout button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/10 p-2 rounded-full"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main 3D Tractor Interface */}
      <div className="flex-1 relative overflow-hidden">
        {/* 3D Tractor Model Container */}
        <div 
          ref={tractorRef}
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* 3D Tractor Visualization */}
          <div 
            className="relative transition-transform duration-100 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${tractorRotation.x}deg) rotateY(${tractorRotation.y}deg)`
            }}
          >
            {/* Main tractor body with gradient and shadows for 3D effect */}
            <div className="relative w-80 h-48 transform-gpu">
              {/* Tractor body */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-3xl shadow-2xl border border-green-300/50">
                {/* Cabin */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-20 bg-gradient-to-br from-blue-300 to-blue-500 rounded-2xl shadow-lg border border-blue-200/50"></div>
                
                {/* Front lights */}
                <div className="absolute top-8 left-2 w-4 h-4 bg-yellow-300 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute top-8 right-2 w-4 h-4 bg-yellow-300 rounded-full shadow-lg animate-pulse"></div>
                
                {/* Wheels */}
                <div className="absolute -bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full border-4 border-gray-600 shadow-xl">
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full"></div>
                </div>
                <div className="absolute -bottom-4 right-4 w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full border-4 border-gray-600 shadow-xl">
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full"></div>
                </div>
                
                {/* Equipment attachment */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg shadow-lg"></div>
              </div>
              
              {/* Hover instruction */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-white/60 text-xs text-center">
                Drag to rotate • Touch & swipe on mobile
              </div>
            </div>
          </div>
        </div>

        {/* Control Panels */}
        {/* Battery Level - Top Left */}
        <Card className="absolute top-6 left-6 bg-black/40 backdrop-blur-md border-green-400/30 text-white p-4 w-48">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Battery className={`h-5 w-5 ${batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-sm font-medium">Battery</span>
            </div>
            <span className="text-lg font-bold text-green-400">{batteryLevel}%</span>
          </div>
          <Progress value={batteryLevel} className="mb-2 h-2" />
          <div className="text-xs text-green-300">Est. time: {getBatteryTime()}</div>
        </Card>

        {/* Lock/Unlock Control - Top Right */}
        <Card className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border-blue-400/30 text-white p-4">
          <Button
            onClick={toggleLock}
            className={`w-full ${isLocked 
              ? 'bg-red-500/80 hover:bg-red-500 text-white' 
              : 'bg-green-500/80 hover:bg-green-500 text-white'
            } transition-all duration-300`}
          >
            {isLocked ? <Lock className="h-5 w-5 mr-2" /> : <Unlock className="h-5 w-5 mr-2" />}
            {isLocked ? 'Locked' : 'Unlocked'}
          </Button>
        </Card>

        {/* Engine Control - Bottom Left */}
        <Card className="absolute bottom-24 left-6 bg-black/40 backdrop-blur-md border-orange-400/30 text-white p-4">
          <Button
            onClick={toggleEngine}
            disabled={isLocked}
            className={`w-full ${engineRunning 
              ? 'bg-red-500/80 hover:bg-red-500 text-white animate-pulse' 
              : 'bg-green-500/80 hover:bg-green-500 text-white'
            } transition-all duration-300 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Power className="h-5 w-5 mr-2" />
            {engineRunning ? 'Stop Engine' : 'Start Engine'}
          </Button>
        </Card>

        {/* Soil Scan - Bottom Right */}
        <Card className="absolute bottom-24 right-6 bg-black/40 backdrop-blur-md border-purple-400/30 text-white p-4">
          <Button
            onClick={toggleSoilScan}
            className={`w-full ${soilScanActive 
              ? 'bg-purple-500/80 hover:bg-purple-500 text-white animate-pulse' 
              : 'bg-slate-600/80 hover:bg-slate-500 text-white'
            } transition-all duration-300`}
          >
            <Scan className="h-5 w-5 mr-2" />
            {soilScanActive ? 'Scanning...' : 'Soil Scan'}
          </Button>
        </Card>

        {/* GPS Location - Center Right */}
        <Card className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/40 backdrop-blur-md border-cyan-400/30 text-white p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-cyan-400 animate-bounce" />
            <span className="text-sm font-medium">GPS Location</span>
          </div>
          <div className="text-xs text-cyan-300">
            <div>Lat: 11.0168° N</div>
            <div>Lng: 76.9558° E</div>
            <div className="mt-1 text-green-300">Status: Active</div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation - Map Controls */}
      <div className="p-6 bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => {/* TODO: Implement add map functionality */}}
            className="bg-blue-600/80 hover:bg-blue-600 text-white py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Map
          </Button>
          
          <Button 
            onClick={() => {/* TODO: Implement saved maps functionality */}}
            className="bg-green-600/80 hover:bg-green-600 text-white py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <FolderOpen className="h-5 w-5 mr-2" />
            Saved Maps
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      <SchemesModal isOpen={showSchemes} onClose={() => setShowSchemes(false)} />
      <ServicesModal isOpen={showServices} onClose={() => setShowServices(false)} />
      <OwnerEquipmentModal 
        isOpen={showOwnerEquipment} 
        onClose={() => setShowOwnerEquipment(false)}
        equipment={equipment}
      />
    </div>
  );
}
