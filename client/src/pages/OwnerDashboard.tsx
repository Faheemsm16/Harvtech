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
  Plus,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SchemesModal } from "@/components/SchemesModal";
import { ServicesModal } from "@/components/ServicesModal";
import { OwnerEquipmentModal } from "@/components/OwnerEquipmentModal";
import tractorImagePath from "@assets/file_00000000383c622f988bed4aa323e086_1754395000391.png";

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
  const [showSoilResults, setShowSoilResults] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
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
  const toggleSoilScan = () => {
    // Only allow soil scan if tractor is unlocked and engine is running
    if (!engineRunning || isLocked) {
      return;
    }

    if (!soilScanActive && !isScanning) {
      // Start scanning process
      setSoilScanActive(true);
      setIsScanning(true);
      
      // Show scanning for 5 seconds
      setTimeout(() => {
        setIsScanning(false);
        setShowSoilResults(true);
        
        // Auto-hide results after 10 seconds and reset scan state
        setTimeout(() => {
          setShowSoilResults(false);
          setSoilScanActive(false);
        }, 10000);
      }, 5000);
    }
  };

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
            {/* HARVTECH 3D Tractor Image */}
            <div className="relative w-96 h-64 transform-gpu">
              <img 
                src={tractorImagePath}
                alt="HARVTECH Autonomous Tractor"
                className="w-full h-full object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) brightness(1.1) contrast(1.1)',
                  transform: 'rotateY(15deg) rotateX(-5deg)'
                }}
              />
              
              {/* Glowing effect overlay when engine is running */}
              {engineRunning && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-xl animate-pulse"></div>
              )}
              
              {/* Status indicators on tractor */}
              {!isLocked && (
                <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              )}
              {(soilScanActive || isScanning) && (
                <div className="absolute bottom-4 right-4 w-4 h-4 bg-purple-400 rounded-full animate-ping shadow-lg"></div>
              )}
              
              {/* Scanning animation overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-purple-500/10 rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
                      <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-2" />
                      <div className="text-purple-300 text-sm font-semibold">
                        Analyzing Soil...
                      </div>
                      <div className="text-purple-200 text-xs mt-1">
                        Please wait
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Hover instruction */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 text-xs text-center">
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
            disabled={!engineRunning || isLocked || isScanning}
            className={`w-full transition-all duration-300 ${
              isScanning 
                ? 'bg-yellow-500/80 text-white animate-pulse' 
                : soilScanActive && showSoilResults
                ? 'bg-green-500/80 hover:bg-green-500 text-white'
                : (!engineRunning || isLocked)
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600/80 hover:bg-purple-500 text-white'
            }`}
          >
{isScanning ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Scan className="h-5 w-5 mr-2" />
            )}
            {isScanning 
              ? 'Scanning...' 
              : soilScanActive && showSoilResults
              ? 'Scan Complete'
              : (!engineRunning || isLocked)
              ? 'Engine Required'
              : 'Soil Scan'
            }
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

        {/* Soil Scan Results Modal */}
        {showSoilResults && (
          <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md border-purple-400/50 text-white p-6 max-w-sm w-full mx-6 z-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Scan className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="font-semibold">Soil Analysis Results</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowSoilResults(false)}
                className="text-white hover:bg-white/10 p-1 h-6 w-6"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/20 p-2 rounded border border-green-400/30">
                  <div className="text-green-300 text-xs">pH Level</div>
                  <div className="font-bold text-green-400">6.8</div>
                  <div className="text-xs text-green-200">Optimal</div>
                </div>
                <div className="bg-blue-500/20 p-2 rounded border border-blue-400/30">
                  <div className="text-blue-300 text-xs">Moisture</div>
                  <div className="font-bold text-blue-400">42%</div>
                  <div className="text-xs text-blue-200">Good</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-yellow-500/20 p-2 rounded border border-yellow-400/30">
                  <div className="text-yellow-300 text-xs">Nitrogen</div>
                  <div className="font-bold text-yellow-400">85mg/kg</div>
                </div>
                <div className="bg-orange-500/20 p-2 rounded border border-orange-400/30">
                  <div className="text-orange-300 text-xs">Phosphorus</div>
                  <div className="font-bold text-orange-400">32mg/kg</div>
                </div>
                <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                  <div className="text-pink-300 text-xs">Potassium</div>
                  <div className="font-bold text-pink-400">156mg/kg</div>
                </div>
              </div>
              
              <div className="bg-cyan-500/20 p-2 rounded border border-cyan-400/30">
                <div className="text-cyan-300 text-xs">Organic Matter</div>
                <div className="font-bold text-cyan-400">3.2%</div>
                <div className="text-xs text-cyan-200">Excellent for crop growth</div>
              </div>
              
              <div className="bg-purple-500/20 p-2 rounded border border-purple-400/30">
                <div className="text-purple-300 text-xs mb-1">Recommendation</div>
                <div className="text-xs text-purple-200">
                  Soil conditions are optimal for rice cultivation. 
                  Consider light fertilization in 2-3 weeks.
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-400 text-center">
              Scan completed at {new Date().toLocaleTimeString()}
            </div>
          </Card>
        )}
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
