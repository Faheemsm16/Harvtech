import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  Menu,
  Package2,
  X,
  Info,
  Settings,
  Gauge,
  Zap,
  Circle,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Activity,
  Wrench,
  Car,
  Fuel
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
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentVehicleType, setCurrentVehicleType] = useState('tractor'); // 'tractor' or 'tiller'
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectedTractorModel, setSelectedTractorModel] = useState('JD 5050D');
  const [selectedTillerModel, setSelectedTillerModel] = useState('TL 300X');
  
  // Available models
  const tractorModels = ['JD 5050D', 'Mahindra 475 DI', 'Sonalika 745 DI', 'Massey Ferguson 1035 DI', 'New Holland 3630 TX'];
  const tillerModels = ['TL 300X', 'Honda F220', 'Kubota T1400', 'Captain 120', 'VST Shakti VF 130DI'];
  
  // Tractor control states
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [hvBatteryLevel, setHvBatteryLevel] = useState(89);
  const [lvBatteryLevel, setLvBatteryLevel] = useState(85);
  const [isLocked, setIsLocked] = useState(true);
  const [engineRunning, setEngineRunning] = useState(false);
  const [soilScanActive, setSoilScanActive] = useState(false);
  const [tractorRotation, setTractorRotation] = useState({ x: 0, y: 0 });
  const [showSoilResults, setShowSoilResults] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // PIN system states
  const [vehiclePin, setVehiclePin] = useState<string>('');
  const [hasPin, setHasPin] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [isPinMode, setIsPinMode] = useState<'create' | 'unlock'>('create');

  // Load PIN status from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const storedPin = localStorage.getItem(`vehicle_pin_${user.id}`);
      if (storedPin) {
        setVehiclePin(storedPin);
        setHasPin(true);
      }
    }
  }, [user?.id]);
  
  // Vehicle info states
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  
  // Mapping system states
  const [showMappingInstructions, setShowMappingInstructions] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [mappingStarted, setMappingStarted] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{lat: number, lng: number, timestamp: number}>>([]);
  const [showSaveMappingDialog, setShowSaveMappingDialog] = useState(false);
  const [mapName, setMapName] = useState('');
  const [savedMaps, setSavedMaps] = useState<Array<{id: string, name: string, path: Array<{lat: number, lng: number, timestamp: number}>, createdAt: string}>>([]);
  const [showSavedMapsDialog, setShowSavedMapsDialog] = useState(false);
  const mappingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Automated operation states
  const [showPreOperationCheck, setShowPreOperationCheck] = useState(false);
  const [selectedMapForOperation, setSelectedMapForOperation] = useState<{id: string, name: string, path: Array<{lat: number, lng: number, timestamp: number}>, createdAt: string} | null>(null);
  const [isAutomatedRunning, setIsAutomatedRunning] = useState(false);
  const [automatedProgress, setAutomatedProgress] = useState({ currentPoint: 0, totalPoints: 0, timeElapsed: 0, areaCompleted: 0 });
  const automatedInterval = useRef<NodeJS.Timeout | null>(null);
  // Vehicle info for different vehicle types
  const [tractorInfo] = useState({
    motorHealth: 85,
    motorTemperature: 92, // °C
    oilLevel: 78,
    coolantLevel: 88,
    hvBattery: { level: 89, voltage: 400, temperature: 32 },
    lvBattery: { level: 85, voltage: 12.4, temperature: 28 },
    tyreAirLevel: {
      frontLeft: 95,
      frontRight: 93,
      rearLeft: 72, // Low - issue
      rearRight: 90
    },
    brakeHealth: {
      system: 94,
      fluidLevel: 68, // Low - issue
      padWear: 85
    },
    hydraulicSystem: 91,
    batteryVoltage: 12.4,
    fuelLevel: 76,
    transmissionHealth: 89,
    overallCondition: 0 // Will be calculated
  });
  
  const [tillerInfo] = useState({
    motorHealth: 92,
    motorTemperature: 78, // °C
    oilLevel: 85,
    coolantLevel: 0, // No coolant system in tiller
    hvBattery: { level: 0, voltage: 0, temperature: 0 }, // No HV battery in tiller
    lvBattery: { level: 88, voltage: 12.6, temperature: 25 },
    tyreAirLevel: {
      frontLeft: 0, // No front tyres in tiller
      frontRight: 0,
      rearLeft: 88,
      rearRight: 90
    },
    brakeHealth: {
      system: 0, // No brake system in tiller
      fluidLevel: 0,
      padWear: 0
    },
    hydraulicSystem: 0, // No hydraulic system in basic tiller
    batteryVoltage: 12.6,
    fuelLevel: 82,
    transmissionHealth: 95, // Simple transmission
    overallCondition: 0 // Will be calculated
  });
  
  // Get current vehicle info based on selected vehicle type
  const vehicleInfo = currentVehicleType === 'tractor' ? tractorInfo : tillerInfo;

  // Calculate overall tractor condition
  const calculateOverallCondition = () => {
    const metrics = [
      vehicleInfo.motorHealth,
      vehicleInfo.oilLevel,
      vehicleInfo.coolantLevel,
      Math.min(
        vehicleInfo.tyreAirLevel.frontLeft,
        vehicleInfo.tyreAirLevel.frontRight,
        vehicleInfo.tyreAirLevel.rearLeft,
        vehicleInfo.tyreAirLevel.rearRight
      ),
      Math.min(
        vehicleInfo.brakeHealth.system,
        vehicleInfo.brakeHealth.fluidLevel,
        vehicleInfo.brakeHealth.padWear
      ),
      vehicleInfo.hydraulicSystem,
      vehicleInfo.transmissionHealth
    ];
    
    return Math.round(metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length);
  };

  // Get health status and color
  const getHealthStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'Excellent', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-400/30' };
    if (percentage >= 75) return { status: 'Good', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-400/30' };
    if (percentage >= 60) return { status: 'Fair', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-400/30' };
    return { status: 'Needs Attention', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-400/30' };
  };

  // Get critical issues
  const getCriticalIssues = () => {
    const issues = [];
    
    if (vehicleInfo.tyreAirLevel.rearLeft < 80) {
      issues.push({ component: 'Rear Left Tyre', issue: 'Low air pressure', severity: 'medium' });
    }
    
    if (vehicleInfo.brakeHealth.fluidLevel < 70) {
      issues.push({ component: 'Brake System', issue: 'Low brake fluid', severity: 'high' });
    }
    
    if (vehicleInfo.motorTemperature > 90) {
      issues.push({ component: 'Motor', issue: 'High temperature', severity: 'high' });
    }
    
    if (vehicleInfo.oilLevel < 80) {
      issues.push({ component: 'Motor Oil', issue: 'Oil level low', severity: 'medium' });
    }
    
    return issues;
  };
  
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

  // PIN management functions
  const handleUnlockClick = () => {
    if (!hasPin) {
      setIsPinMode('create');
      setShowPinDialog(true);
    } else {
      setIsPinMode('unlock');
      setEnteredPin('');
      setShowPinDialog(true);
    }
  };

  const handlePinSubmit = () => {
    if (isPinMode === 'create' && enteredPin.length === 4 && user?.id) {
      // Save PIN to localStorage for persistence
      localStorage.setItem(`vehicle_pin_${user.id}`, enteredPin);
      setVehiclePin(enteredPin);
      setHasPin(true);
      setIsLocked(false);
      setShowPinDialog(false);
      setEnteredPin('');
    } else if (isPinMode === 'unlock' && enteredPin === vehiclePin) {
      setIsLocked(false);
      setShowPinDialog(false);
      setEnteredPin('');
    } else if (isPinMode === 'unlock' && enteredPin !== vehiclePin && enteredPin.length === 4) {
      // Show error for wrong PIN
      setEnteredPin('');
    }
  };

  const handlePinCancel = () => {
    setShowPinDialog(false);
    setEnteredPin('');
  };

  // Control handlers
  const toggleLock = () => {
    if (isLocked) {
      handleUnlockClick();
    } else {
      setIsLocked(true);
      setEngineRunning(false); // Turn off engine when locking
    }
  };
  
  const toggleEngine = () => {
    if (!isLocked) {
      setEngineRunning(!engineRunning);
    }
  };

  // Mapping system functions
  const handleAddMapClick = () => {
    if (isLocked) {
      handleUnlockClick();
      return;
    }
    setShowMappingInstructions(true);
  };

  const startMapping = () => {
    if (!engineRunning || isLocked) {
      return;
    }
    
    setIsMapping(true);
    setMappingStarted(true);
    setCurrentPath([]);
    setShowMappingInstructions(false);
    
    // Simulate GPS tracking by adding points every 2 seconds
    mappingInterval.current = setInterval(() => {
      const newPoint = {
        lat: 11.0168 + (Math.random() - 0.5) * 0.001, // Simulate movement
        lng: 76.9558 + (Math.random() - 0.5) * 0.001,
        timestamp: Date.now()
      };
      setCurrentPath(prev => [...prev, newPoint]);
    }, 2000);
  };

  const stopMapping = () => {
    setIsMapping(false);
    if (mappingInterval.current) {
      clearInterval(mappingInterval.current);
      mappingInterval.current = null;
    }
    
    if (currentPath.length > 0) {
      setShowSaveMappingDialog(true);
    }
  };

  const saveMap = () => {
    if (!mapName.trim() || currentPath.length === 0) return;
    
    const newMap = {
      id: Date.now().toString(),
      name: mapName.trim(),
      path: currentPath,
      createdAt: new Date().toISOString()
    };
    
    setSavedMaps(prev => [...prev, newMap]);
    
    // Save to localStorage for persistence
    const existingMaps = JSON.parse(localStorage.getItem('saved_tractor_maps') || '[]');
    existingMaps.push(newMap);
    localStorage.setItem('saved_tractor_maps', JSON.stringify(existingMaps));
    
    // Reset states
    setCurrentPath([]);
    setMapName('');
    setMappingStarted(false);
    setShowSaveMappingDialog(false);
  };

  const loadSavedMaps = () => {
    const existingMaps = JSON.parse(localStorage.getItem('saved_tractor_maps') || '[]');
    setSavedMaps(existingMaps);
    setShowSavedMapsDialog(true);
  };

  const deleteMap = (mapId: string) => {
    const updatedMaps = savedMaps.filter(map => map.id !== mapId);
    setSavedMaps(updatedMaps);
    localStorage.setItem('saved_tractor_maps', JSON.stringify(updatedMaps));
  };

  const loadMapForOperation = (map: typeof savedMaps[0]) => {
    setSelectedMapForOperation(map);
    setShowSavedMapsDialog(false);
    setShowPreOperationCheck(true);
  };

  const startAutomatedOperation = () => {
    if (!selectedMapForOperation || isLocked || !engineRunning) return;
    
    setIsAutomatedRunning(true);
    setShowPreOperationCheck(false);
    setAutomatedProgress({
      currentPoint: 0,
      totalPoints: selectedMapForOperation.path.length,
      timeElapsed: 0,
      areaCompleted: 0
    });

    // Simulate automated operation progress
    automatedInterval.current = setInterval(() => {
      setAutomatedProgress(prev => {
        const newCurrentPoint = prev.currentPoint + 1;
        const progress = newCurrentPoint / prev.totalPoints;
        const timeElapsed = prev.timeElapsed + 3; // 3 seconds per point
        const areaCompleted = Math.round(progress * 100);

        if (newCurrentPoint >= prev.totalPoints) {
          // Operation completed
          if (automatedInterval.current) {
            clearInterval(automatedInterval.current);
            automatedInterval.current = null;
          }
          setIsAutomatedRunning(false);
          return {
            currentPoint: prev.totalPoints,
            totalPoints: prev.totalPoints,
            timeElapsed,
            areaCompleted: 100
          };
        }

        return {
          currentPoint: newCurrentPoint,
          totalPoints: prev.totalPoints,
          timeElapsed,
          areaCompleted
        };
      });
    }, 3000); // Update every 3 seconds
  };

  const stopAutomatedOperation = () => {
    setIsAutomatedRunning(false);
    if (automatedInterval.current) {
      clearInterval(automatedInterval.current);
      automatedInterval.current = null;
    }
    setAutomatedProgress({ currentPoint: 0, totalPoints: 0, timeElapsed: 0, areaCompleted: 0 });
    setSelectedMapForOperation(null);
  };

  // Load saved maps on component mount
  useEffect(() => {
    const existingMaps = JSON.parse(localStorage.getItem('saved_tractor_maps') || '[]');
    setSavedMaps(existingMaps);
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (mappingInterval.current) {
        clearInterval(mappingInterval.current);
      }
      if (automatedInterval.current) {
        clearInterval(automatedInterval.current);
      }
    };
  }, []);
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
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              onClick={() => setShowHamburgerMenu(true)}
              className="text-white hover:bg-white/10 p-2 rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Profile Button */}
            <Button
              variant="ghost"
              onClick={() => setShowProfile(true)}
              className="text-white hover:bg-white/10 p-2 rounded-lg flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center border border-blue-400/30">
                <User className="h-5 w-5 text-blue-300" />
              </div>
              <div className="text-left">
                <p className="text-xs opacity-75 text-blue-200">{currentVehicleType === 'tractor' ? (t('tractor_owner') || 'Tractor Owner') : (t('tiller_owner') || 'Tiller Owner')}</p>
                <h2 className="font-semibold text-sm">{user?.name || 'Smart Farmer'}</h2>
              </div>
            </Button>
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
            {/* HARVTECH 3D Vehicle Image */}
            <div className="relative w-96 h-64 transform-gpu">
              {currentVehicleType === 'tractor' ? (
                <img 
                  src={tractorImagePath}
                  alt="HARVTECH Autonomous Tractor"
                  className="w-full h-full object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                  style={{
                    filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) brightness(1.1) contrast(1.1)',
                    transform: 'rotateY(15deg) rotateX(-5deg)'
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600 rounded-xl drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))',
                    transform: 'rotateY(15deg) rotateX(-5deg)'
                  }}
                >
                  <div className="text-center text-white">
                    <Wrench className="h-24 w-24 mx-auto mb-4" />
                    <div className="text-xl font-bold">Power Tiller</div>
                    <div className="text-sm opacity-80">TL 300X Model</div>
                  </div>
                </div>
              )}
              
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
              {isMapping && (
                <div className="absolute top-4 right-4 w-4 h-4 bg-orange-400 rounded-full animate-ping shadow-lg"></div>
              )}
              {isAutomatedRunning && (
                <div className="absolute bottom-4 left-4 w-4 h-4 bg-green-400 rounded-full animate-ping shadow-lg"></div>
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
        {/* Battery Levels - Top Left */}
        <Card className="absolute top-6 left-6 bg-black/40 backdrop-blur-md border-green-400/30 text-white p-4 w-52">
          <div className="space-y-3">
            {/* HV Battery - Only show for tractor */}
            {currentVehicleType === 'tractor' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Zap className={`h-4 w-4 ${hvBatteryLevel > 20 ? 'text-orange-400' : 'text-red-400'}`} />
                    <span className="text-xs font-medium">HV Battery</span>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{hvBatteryLevel}%</span>
                </div>
                <Progress value={hvBatteryLevel} className="mb-1 h-1.5" />
                <div className="text-xs text-orange-300">400V System</div>
              </div>
            )}
            
            {/* LV Battery */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Battery className={`h-4 w-4 ${lvBatteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
                  <span className="text-xs font-medium">{currentVehicleType === 'tractor' ? 'LV Battery' : 'Battery'}</span>
                </div>
                <span className="text-sm font-bold text-green-400">{lvBatteryLevel}%</span>
              </div>
              <Progress value={lvBatteryLevel} className="mb-1 h-1.5" />
              <div className="text-xs text-green-300">12V System</div>
            </div>
          </div>
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

        {/* Vehicle Info Button - Bottom Left */}
        <Card className="absolute bottom-24 left-6 bg-black/40 backdrop-blur-md border-blue-400/30 text-white p-4">
          <Button
            onClick={() => {
              if (isLocked) {
                handleUnlockClick();
              } else {
                setShowVehicleInfo(true);
              }
            }}
            className={`w-full transition-all duration-300 ${
              isLocked 
                ? 'bg-gray-600/80 hover:bg-gray-500 text-gray-200' 
                : 'bg-blue-600/80 hover:bg-blue-500 text-white'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Unlock Required
              </>
            ) : (
              <>
                <Info className="h-5 w-5 mr-2" />
                Vehicle Info
              </>
            )}
          </Button>
        </Card>

        {/* Start Engine - Bottom Right */}
        <Card className="absolute bottom-24 right-6 bg-black/40 backdrop-blur-md border-orange-400/30 text-white p-4">
          <Button
            onClick={toggleEngine}
            disabled={isLocked}
            className={`w-full ${engineRunning 
              ? 'bg-red-500/80 hover:bg-red-500 text-white animate-pulse' 
              : 'bg-green-500/80 hover:bg-green-500 text-white'
            } transition-all duration-300 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Power className="h-5 w-5 mr-2" />
            {engineRunning ? t('stop_engine') : t('start_engine')}
          </Button>
        </Card>

        {/* Soil Scan - Center Bottom (Only visible when engine is running and tractor is selected) */}
        {engineRunning && currentVehicleType === 'tractor' && (
          <Card className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md border-purple-400/30 text-white p-4">
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
                ? t('scanning') 
                : soilScanActive && showSoilResults
                ? t('scan_complete')
                : (!engineRunning || isLocked)
                ? t('engine_required')
                : t('soil_scan')
              }
            </Button>
          </Card>
        )}

        {/* GPS Location - Center Right (Only visible when engine is running and tractor is selected) */}
        {engineRunning && !isMapping && currentVehicleType === 'tractor' && (
          <Card className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/40 backdrop-blur-md border-cyan-400/30 text-white p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-cyan-400 animate-bounce" />
              <span className="text-sm font-medium">{t('gps_location')}</span>
            </div>
            <div className="text-xs text-cyan-300">
              <div>{t('latitude')}: 11.0168° N</div>
              <div>{t('longitude')}: 76.9558° E</div>
              <div className="mt-1 text-green-300">{t('status_active')}</div>
            </div>
          </Card>
        )}

        {/* Mapping Status - Center Right (Only visible when mapping is active and tractor is selected) */}
        {isMapping && currentVehicleType === 'tractor' && (
          <Card className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/40 backdrop-blur-md border-orange-400/30 text-white p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Map className="h-5 w-5 text-orange-400 animate-pulse" />
              <span className="text-sm font-medium">Recording Path</span>
            </div>
            <div className="text-xs text-orange-300">
              <div>GPS Points: {currentPath.length}</div>
              <div>Duration: {
                currentPath.length > 0 
                  ? Math.round((Date.now() - currentPath[0]?.timestamp) / 1000) 
                  : 0
              }s</div>
              <div className="mt-1 text-orange-200 flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping mr-2"></div>
                Mapping Active
              </div>
            </div>
          </Card>
        )}

        {/* Automated Operation Progress - Center Right (Only visible when automated operation is running) */}
        {isAutomatedRunning && (
          <Card className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/40 backdrop-blur-md border-green-400/30 text-white p-4 min-w-48">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400 animate-pulse" />
                <span className="text-sm font-medium">Auto Operation</span>
              </div>
              <Button
                onClick={stopAutomatedOperation}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs px-2 py-1 h-6"
              >
                Stop
              </Button>
            </div>
            <div className="text-xs text-green-300 space-y-1">
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-bold">{automatedProgress.areaCompleted}%</span>
              </div>
              <Progress value={automatedProgress.areaCompleted} className="h-1.5 mb-2" />
              <div className="flex justify-between">
                <span>Points:</span>
                <span>{automatedProgress.currentPoint}/{automatedProgress.totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{Math.floor(automatedProgress.timeElapsed / 60)}:{(automatedProgress.timeElapsed % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span>Area:</span>
                <span>{automatedProgress.areaCompleted}% covered</span>
              </div>
              <div className="mt-1 text-green-200 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping mr-2"></div>
                {selectedMapForOperation?.name}
              </div>
            </div>
          </Card>
        )}

        {/* Soil Scan Results Modal */}
        {showSoilResults && (
          <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md border-purple-400/50 text-white p-6 max-w-sm w-full mx-6 z-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Scan className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="font-semibold">{t('soil_analysis_results')}</span>
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
                  <div className="text-green-300 text-xs">{t('ph_level')}</div>
                  <div className="font-bold text-green-400">6.8</div>
                  <div className="text-xs text-green-200">{t('optimal')}</div>
                </div>
                <div className="bg-blue-500/20 p-2 rounded border border-blue-400/30">
                  <div className="text-blue-300 text-xs">{t('moisture_content')}</div>
                  <div className="font-bold text-blue-400">42%</div>
                  <div className="text-xs text-blue-200">{t('good')}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-yellow-500/20 p-2 rounded border border-yellow-400/30">
                  <div className="text-yellow-300 text-xs">{t('nitrogen')}</div>
                  <div className="font-bold text-yellow-400">85mg/kg</div>
                </div>
                <div className="bg-orange-500/20 p-2 rounded border border-orange-400/30">
                  <div className="text-orange-300 text-xs">{t('phosphorus')}</div>
                  <div className="font-bold text-orange-400">32mg/kg</div>
                </div>
                <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                  <div className="text-pink-300 text-xs">{t('potassium')}</div>
                  <div className="font-bold text-pink-400">156mg/kg</div>
                </div>
              </div>
              
              <div className="bg-cyan-500/20 p-2 rounded border border-cyan-400/30">
                <div className="text-cyan-300 text-xs">{t('organic_matter')}</div>
                <div className="font-bold text-cyan-400">3.2%</div>
                <div className="text-xs text-cyan-200">{t('excellent_for_crop_growth')}</div>
              </div>
              
              <div className="bg-purple-500/20 p-2 rounded border border-purple-400/30">
                <div className="text-purple-300 text-xs mb-1">{t('recommendations')}</div>
                <div className="text-xs text-purple-200">
                  {t('soil_conditions_optimal')} 
                  {t('consider_fertilization')}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-400 text-center">
              {t('scan_completed_at')} {new Date().toLocaleTimeString()}
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Navigation - Map Controls (Only show for tractor) */}
      {currentVehicleType === 'tractor' && (
        <div className="p-6 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={isMapping ? stopMapping : handleAddMapClick}
              className={`py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isMapping 
                  ? 'bg-red-600/80 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-blue-600/80 hover:bg-blue-600 text-white'
              }`}
            >
              {isMapping ? (
                <>
                  <X className="h-5 w-5 mr-2" />
                  Stop Mapping
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  {t('add_map')}
                </>
              )}
            </Button>
            
            <Button 
              onClick={loadSavedMaps}
              className="bg-green-600/80 hover:bg-green-600 text-white py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <FolderOpen className="h-5 w-5 mr-2" />
              {t('saved_maps')} {savedMaps.length > 0 && `(${savedMaps.length})`}
            </Button>
          </div>
        </div>
      )}
      
      {/* Simplified Bottom Navigation for Tiller */}
      {currentVehicleType === 'tiller' && (
        <div className="p-6 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="text-center text-white/70">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Wrench className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium">Power Tiller Controls</span>
            </div>
            <p className="text-xs">Use the controls above to operate your tiller</p>
          </div>
        </div>
      )}
      
      {/* Modals */}
      <SchemesModal isOpen={showSchemes} onClose={() => setShowSchemes(false)} />
      <ServicesModal isOpen={showServices} onClose={() => setShowServices(false)} />
      <OwnerEquipmentModal 
        isOpen={showOwnerEquipment} 
        onClose={() => setShowOwnerEquipment(false)}
        equipment={equipment}
      />

      {/* Mapping Instructions Dialog */}
      <Dialog open={showMappingInstructions} onOpenChange={setShowMappingInstructions}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-blue-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-blue-400 flex items-center justify-center">
              <Map className="h-6 w-6 mr-2" />
              Field Mapping Instructions
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Follow these steps to create an automated path for your tractor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-400/30">
              <div className="space-y-3 text-sm text-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-blue-300">Position the Tractor</p>
                    <p>Place your tractor at the starting point of the field where you want the automated path to begin.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-blue-300">Keep Mobile Phone Close</p>
                    <p>Ensure your mobile phone is close to the tractor for accurate GPS tracking during the mapping process.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-blue-300">Start Engine & Drive</p>
                    <p>After pressing "Start", start the tractor and drive it across the field exactly how you want it to be automated in the future.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold text-green-300">Save the Path</p>
                    <p>The system will record your path. When finished, stop mapping and save the path with a name for future use.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-400/30">
              <div className="flex items-center space-x-2 text-yellow-300">
                <Info className="h-4 w-4 flex-shrink-0" />
                <p className="text-xs">Make sure the tractor engine is running and the vehicle is unlocked before starting.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => setShowMappingInstructions(false)}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={startMapping}
                disabled={!engineRunning || isLocked}
                className={`${
                  !engineRunning || isLocked
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Start Mapping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Mapping Dialog */}
      <Dialog open={showSaveMappingDialog} onOpenChange={setShowSaveMappingDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-green-400/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-green-400">
              Save Field Map
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Give your mapped path a name to save it for future use
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-400/30 text-center">
              <div className="text-green-300 text-sm mb-1">Path Recorded Successfully</div>
              <div className="text-green-200 text-xs">
                {currentPath.length} GPS points captured over {
                  currentPath.length > 0 
                    ? Math.round((currentPath[currentPath.length - 1]?.timestamp - currentPath[0]?.timestamp) / 1000) 
                    : 0
                } seconds
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Map Name
              </label>
              <Input
                type="text"
                placeholder="e.g., North Field Pattern, Main Crop Area..."
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="bg-black/50 border-gray-600 text-white placeholder-gray-400"
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setShowSaveMappingDialog(false);
                  setCurrentPath([]);
                  setMappingStarted(false);
                }}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                Discard
              </Button>
              <Button
                onClick={saveMap}
                disabled={!mapName.trim()}
                className={`${
                  !mapName.trim()
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                Save Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Maps Dialog */}
      <Dialog open={showSavedMapsDialog} onOpenChange={setShowSavedMapsDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-green-400/30 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-green-400 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 mr-2" />
              Saved Field Maps
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              {savedMaps.length === 0 
                ? 'No saved maps yet. Create your first field map!'
                : `${savedMaps.length} saved map${savedMaps.length > 1 ? 's' : ''} available`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {savedMaps.length === 0 ? (
              <div className="text-center py-8">
                <Map className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No saved maps yet</p>
                <p className="text-gray-500 text-xs mt-1">Create your first automated field path</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {savedMaps.map((map) => (
                  <div key={map.id} className="bg-green-500/10 p-3 rounded-lg border border-green-400/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Map className="h-4 w-4 text-green-400" />
                          <h4 className="font-semibold text-green-300 text-sm">{map.name}</h4>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          <div>{map.path.length} GPS points</div>
                          <div>Created: {new Date(map.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => loadMapForOperation(map)}
                          size="sm"
                          className="bg-blue-600/80 hover:bg-blue-600 text-white text-xs px-2 py-1"
                        >
                          Load
                        </Button>
                        <Button
                          onClick={() => deleteMap(map.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs px-2 py-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-700">
              <Button
                onClick={() => setShowSavedMapsDialog(false)}
                className="w-full bg-gray-600/80 hover:bg-gray-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Entry Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-blue-400/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-blue-400">
              {isPinMode === 'create' ? 'Create Vehicle PIN' : 'Enter PIN to Unlock'}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              {isPinMode === 'create' 
                ? 'Set a 4-digit PIN to secure your vehicle'
                : 'Enter your 4-digit PIN to unlock the vehicle'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
                    ${enteredPin.length > index 
                      ? 'bg-blue-500/30 border-blue-400 text-blue-400' 
                      : 'bg-gray-700/50 border-gray-500 text-gray-400'
                    }`}
                >
                  {enteredPin.length > index ? '●' : ''}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((num, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    if (num === '⌫') {
                      setEnteredPin(prev => prev.slice(0, -1));
                    } else if (num !== '' && enteredPin.length < 4) {
                      setEnteredPin(prev => prev + num);
                    }
                  }}
                  disabled={num === ''}
                  className={`h-12 ${
                    num === '⌫' 
                      ? 'bg-red-600/80 hover:bg-red-500' 
                      : num === ''
                      ? 'invisible'
                      : 'bg-gray-600/80 hover:bg-gray-500'
                  } text-white font-bold text-lg`}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handlePinCancel}
                className="flex-1 bg-gray-600/80 hover:bg-gray-500 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePinSubmit}
                disabled={enteredPin.length !== 4}
                className={`flex-1 ${
                  enteredPin.length === 4
                    ? 'bg-green-600/80 hover:bg-green-500'
                    : 'bg-gray-600/50 cursor-not-allowed'
                } text-white`}
              >
                {isPinMode === 'create' ? 'Set PIN' : 'Unlock'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Info Dialog */}
      <Dialog open={showVehicleInfo} onOpenChange={setShowVehicleInfo}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-blue-400/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-blue-400 flex items-center justify-center space-x-2">
              <Car className="h-6 w-6" />
              <span>Vehicle Diagnostics</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Overall Health Summary */}
            <div className={`${getHealthStatus(calculateOverallCondition()).bgColor} p-4 rounded-lg border ${getHealthStatus(calculateOverallCondition()).borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className={`h-5 w-5 ${getHealthStatus(calculateOverallCondition()).color}`} />
                  <span className="font-semibold">Overall Condition</span>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getHealthStatus(calculateOverallCondition()).color}`}>
                    {calculateOverallCondition()}%
                  </div>
                  <div className={`text-sm ${getHealthStatus(calculateOverallCondition()).color}`}>
                    {getHealthStatus(calculateOverallCondition()).status}
                  </div>
                </div>
              </div>
              <Progress value={calculateOverallCondition()} className="h-2" />
            </div>

            {/* Critical Issues Alert */}
            {getCriticalIssues().length > 0 && (
              <div className="bg-red-500/20 p-4 rounded-lg border border-red-400/30">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
                  <span className="font-semibold text-red-300">Critical Issues Detected</span>
                </div>
                <div className="space-y-2">
                  {getCriticalIssues().map((issue, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-600/20 p-2 rounded">
                      <div>
                        <div className="text-sm font-medium text-red-200">{issue.component}</div>
                        <div className="text-xs text-red-300">{issue.issue}</div>
                      </div>
                      <Badge className={`${issue.severity === 'high' ? 'bg-red-600/80' : 'bg-yellow-600/80'} text-white text-xs`}>
                        {issue.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Details */}
            {primaryEquipment && (
              <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                <h3 className="text-blue-300 text-sm mb-2 flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Equipment Details</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Model:</span>
                    <div className="text-white font-medium">{primaryEquipment.modelNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <div className="text-white font-medium capitalize">{primaryEquipment.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Chassis:</span>
                    <div className="text-white font-medium">{primaryEquipment.chassisNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-600/80 text-white text-xs">
                      {engineRunning ? 'Running' : 'Stopped'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Motor Health */}
              <div className={`${getHealthStatus(vehicleInfo.motorHealth).bgColor} p-3 rounded-lg border ${getHealthStatus(vehicleInfo.motorHealth).borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className={`h-4 w-4 ${getHealthStatus(vehicleInfo.motorHealth).color}`} />
                    <span className="text-sm font-medium">Motor Health</span>
                  </div>
                  <span className={`text-lg font-bold ${getHealthStatus(vehicleInfo.motorHealth).color}`}>
                    {vehicleInfo.motorHealth}%
                  </span>
                </div>
                <Progress value={vehicleInfo.motorHealth} className="h-1.5 mb-2" />
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Temperature:</span>
                    <span className={vehicleInfo.motorTemperature > 90 ? 'text-red-300' : 'text-green-300'}>
                      {vehicleInfo.motorTemperature}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Oil Level:</span>
                    <span className={vehicleInfo.oilLevel < 80 ? 'text-yellow-300' : 'text-green-300'}>
                      {vehicleInfo.oilLevel}%
                    </span>
                  </div>
                  {currentVehicleType === 'tractor' && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Coolant:</span>
                      <span className="text-green-300">{vehicleInfo.coolantLevel}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Brake Health - Only show for tractor */}
              {currentVehicleType === 'tractor' && (
                <div className={`${getHealthStatus(Math.min(vehicleInfo.brakeHealth.system, vehicleInfo.brakeHealth.fluidLevel, vehicleInfo.brakeHealth.padWear)).bgColor} p-3 rounded-lg border ${getHealthStatus(Math.min(vehicleInfo.brakeHealth.system, vehicleInfo.brakeHealth.fluidLevel, vehicleInfo.brakeHealth.padWear)).borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Circle className={`h-4 w-4 ${getHealthStatus(Math.min(vehicleInfo.brakeHealth.system, vehicleInfo.brakeHealth.fluidLevel, vehicleInfo.brakeHealth.padWear)).color}`} />
                      <span className="text-sm font-medium">Brake Health</span>
                    </div>
                    <span className={`text-lg font-bold ${getHealthStatus(Math.min(vehicleInfo.brakeHealth.system, vehicleInfo.brakeHealth.fluidLevel, vehicleInfo.brakeHealth.padWear)).color}`}>
                      {Math.min(vehicleInfo.brakeHealth.system, vehicleInfo.brakeHealth.fluidLevel, vehicleInfo.brakeHealth.padWear)}%
                    </span>
                  </div>
                  <Progress value={Math.min(vehicleInfo.brakeHealth.system, vehicleInfo.brakeHealth.fluidLevel, vehicleInfo.brakeHealth.padWear)} className="h-1.5 mb-2" />
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300">System:</span>
                      <span className="text-green-300">{vehicleInfo.brakeHealth.system}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Brake Fluid:</span>
                      <span className={vehicleInfo.brakeHealth.fluidLevel < 70 ? 'text-red-300' : 'text-green-300'}>
                        {vehicleInfo.brakeHealth.fluidLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Pad Wear:</span>
                      <span className="text-green-300">{vehicleInfo.brakeHealth.padWear}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tyre Air Pressure - Simplified for tiller */}
            <div className={`${getHealthStatus(Math.min(vehicleInfo.tyreAirLevel.frontLeft, vehicleInfo.tyreAirLevel.frontRight, vehicleInfo.tyreAirLevel.rearLeft, vehicleInfo.tyreAirLevel.rearRight)).bgColor} p-3 rounded-lg border ${getHealthStatus(Math.min(vehicleInfo.tyreAirLevel.frontLeft, vehicleInfo.tyreAirLevel.frontRight, vehicleInfo.tyreAirLevel.rearLeft, vehicleInfo.tyreAirLevel.rearRight)).borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Circle className={`h-4 w-4 ${getHealthStatus(Math.min(vehicleInfo.tyreAirLevel.frontLeft, vehicleInfo.tyreAirLevel.frontRight, vehicleInfo.tyreAirLevel.rearLeft, vehicleInfo.tyreAirLevel.rearRight)).color}`} />
                  <span className="text-sm font-medium">{currentVehicleType === 'tractor' ? 'Tyre Air Pressure' : 'Wheel Pressure'}</span>
                </div>
                <span className={`text-lg font-bold ${getHealthStatus(Math.min(vehicleInfo.tyreAirLevel.frontLeft, vehicleInfo.tyreAirLevel.frontRight, vehicleInfo.tyreAirLevel.rearLeft, vehicleInfo.tyreAirLevel.rearRight)).color}`}>
                  {Math.min(vehicleInfo.tyreAirLevel.frontLeft, vehicleInfo.tyreAirLevel.frontRight, vehicleInfo.tyreAirLevel.rearLeft, vehicleInfo.tyreAirLevel.rearRight)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentVehicleType === 'tractor' ? [
                  { name: 'Front Left', value: vehicleInfo.tyreAirLevel.frontLeft },
                  { name: 'Front Right', value: vehicleInfo.tyreAirLevel.frontRight },
                  { name: 'Rear Left', value: vehicleInfo.tyreAirLevel.rearLeft },
                  { name: 'Rear Right', value: vehicleInfo.tyreAirLevel.rearRight }
                ] : [
                  { name: 'Rear Left', value: vehicleInfo.tyreAirLevel.rearLeft },
                  { name: 'Rear Right', value: vehicleInfo.tyreAirLevel.rearRight }
                ].map((tyre, index) => (
                  <div key={index} className="flex items-center justify-between bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">{tyre.name}</span>
                    <div className="flex items-center space-x-1">
                      <Circle className={`h-3 w-3 ${tyre.value >= 85 ? 'text-green-400' : tyre.value >= 75 ? 'text-yellow-400' : 'text-red-400'} fill-current`} />
                      <span className="text-xs text-white">{tyre.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Systems - Show hydraulic only for tractor */}
            <div className="grid grid-cols-2 gap-4">
              {currentVehicleType === 'tractor' && (
                <div className={`${getHealthStatus(vehicleInfo.hydraulicSystem).bgColor} p-3 rounded-lg border ${getHealthStatus(vehicleInfo.hydraulicSystem).borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Droplets className={`h-4 w-4 ${getHealthStatus(vehicleInfo.hydraulicSystem).color}`} />
                      <span className="text-sm font-medium">Hydraulic</span>
                    </div>
                    <span className={`text-sm font-bold ${getHealthStatus(vehicleInfo.hydraulicSystem).color}`}>
                      {vehicleInfo.hydraulicSystem}%
                    </span>
                  </div>
                  <Progress value={vehicleInfo.hydraulicSystem} className="h-1.5" />
                </div>
              )}

              <div className={`${getHealthStatus(vehicleInfo.transmissionHealth).bgColor} p-3 rounded-lg border ${getHealthStatus(vehicleInfo.transmissionHealth).borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Settings className={`h-4 w-4 ${getHealthStatus(vehicleInfo.transmissionHealth).color}`} />
                    <span className="text-sm font-medium">Transmission</span>
                  </div>
                  <span className={`text-sm font-bold ${getHealthStatus(vehicleInfo.transmissionHealth).color}`}>
                    {vehicleInfo.transmissionHealth}%
                  </span>
                </div>
                <Progress value={vehicleInfo.transmissionHealth} className="h-1.5" />
              </div>
            </div>

            {/* Fuel and Batteries */}
            <div className="space-y-4">
              <div className={`${getHealthStatus(vehicleInfo.fuelLevel).bgColor} p-3 rounded-lg border ${getHealthStatus(vehicleInfo.fuelLevel).borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Fuel className={`h-4 w-4 ${getHealthStatus(vehicleInfo.fuelLevel).color}`} />
                    <span className="text-sm font-medium">Fuel Level</span>
                  </div>
                  <span className={`text-sm font-bold ${getHealthStatus(vehicleInfo.fuelLevel).color}`}>
                    {vehicleInfo.fuelLevel}%
                  </span>
                </div>
                <Progress value={vehicleInfo.fuelLevel} className="h-1.5" />
              </div>

              <div className={`grid ${currentVehicleType === 'tractor' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {/* HV Battery - Only show for tractor */}
                {currentVehicleType === 'tractor' && (
                  <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium">HV Battery</span>
                      </div>
                      <span className="text-sm font-bold text-orange-400">
                        {vehicleInfo.hvBattery.level}%
                      </span>
                    </div>
                    <Progress value={vehicleInfo.hvBattery.level} className="h-1.5 mb-2" />
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Voltage:</span>
                        <span className="text-orange-300">{vehicleInfo.hvBattery.voltage}V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Temp:</span>
                        <span className="text-orange-300">{vehicleInfo.hvBattery.temperature}°C</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* LV Battery */}
                <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium">{currentVehicleType === 'tractor' ? 'LV Battery' : 'Battery'}</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">
                      {vehicleInfo.lvBattery.level}%
                    </span>
                  </div>
                  <Progress value={vehicleInfo.lvBattery.level} className="h-1.5 mb-2" />
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Voltage:</span>
                      <span className="text-green-300">{vehicleInfo.lvBattery.voltage}V</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Temp:</span>
                      <span className="text-green-300">{vehicleInfo.lvBattery.temperature}°C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setShowVehicleInfo(false)}
                className="bg-blue-600/80 hover:bg-blue-500 text-white px-8"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pre-Operation Check Dialog */}
      <Dialog open={showPreOperationCheck} onOpenChange={setShowPreOperationCheck}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-yellow-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-yellow-400 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Pre-Operation Safety Check
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Ensure all safety requirements are met before starting automated operation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-400/30">
              <div className="space-y-3 text-sm text-yellow-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">⚡</div>
                  <div>
                    <p className="font-semibold text-yellow-300">Position & Charge Check</p>
                    <p>Ensure the tractor is positioned at the starting point of the mapped field and battery is adequately charged.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">🔧</div>
                  <div>
                    <p className="font-semibold text-yellow-300">System Check</p>
                    <p>Verify all systems are functioning properly: engine, hydraulics, brakes, and safety sensors.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">🛡️</div>
                  <div>
                    <p className="font-semibold text-yellow-300">Safety Clearance</p>
                    <p>Ensure the field is clear of people, animals, and obstacles before starting automated operation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-400/30">
              <div className="flex items-center space-x-2 text-green-300">
                <Map className="h-4 w-4 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Selected Map: {selectedMapForOperation?.name}</p>
                  <p className="text-xs text-green-200">{selectedMapForOperation?.path.length} GPS waypoints • Est. {Math.round((selectedMapForOperation?.path.length || 0) * 3 / 60)} min operation</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-400/30">
              <div className="flex items-center space-x-2 text-blue-300">
                <Battery className={`h-4 w-4 flex-shrink-0 ${batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
                <div className="text-sm">
                  <p className="font-semibold">Battery Level: {batteryLevel}%</p>
                  <p className="text-xs text-blue-200">
                    {batteryLevel > 50 ? 'Sufficient for operation' : 
                     batteryLevel > 20 ? 'Low battery - consider charging' : 
                     'Critical battery - charging required'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => {
                  setShowPreOperationCheck(false);
                  setSelectedMapForOperation(null);
                }}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={startAutomatedOperation}
                disabled={!engineRunning || isLocked || batteryLevel < 10}
                className={`${
                  !engineRunning || isLocked || batteryLevel < 10
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Start Operation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hamburger Menu Overlay */}
      {showHamburgerMenu && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHamburgerMenu(false)}
          />
          
          {/* Menu Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
            <Card className="bg-black/90 backdrop-blur-md border-white/20 text-white w-full max-w-lg mx-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Menu Options</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowHamburgerMenu(false)}
                    className="text-white hover:bg-white/10 p-2 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Large Grid Menu Options */}
                <div className="grid grid-cols-1 gap-6">
                  <Button
                    onClick={() => {
                      setLocation('/my-orders');
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/30 text-white p-6 h-auto justify-start text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                        <Package2 className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">My Orders</div>
                        <div className="text-sm opacity-75">View and manage your orders</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setLocation('/platforms');
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full bg-green-600/20 hover:bg-green-600/40 border border-green-400/30 text-white p-6 h-auto justify-start text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                        <Network className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{t('platforms') || 'Platforms'}</div>
                        <div className="text-sm opacity-75">Access agricultural platforms</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowServices(true);
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-400/30 text-white p-6 h-auto justify-start text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                        <Bell className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{t('services') || 'Services'}</div>
                        <div className="text-sm opacity-75">Agricultural analysis services</div>
                      </div>
                    </div>
                  </Button>
                  
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name || 'Smart Farmer'}</h3>
                <p className="text-sm text-gray-600">{currentVehicleType === 'tractor' ? 'Tractor Owner' : 'Tiller Owner'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Farmer ID</span>
                  <span className="font-mono text-sm">{user?.farmerId || 'FRM-000000'}</span>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Mobile</span>
                  <span className="text-sm">{user?.mobileNumber || '+91 98765 43210'}</span>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Location</span>
                  <span className="text-sm">{user?.city || 'Tamil Nadu'}</span>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Vehicle</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowProfile(false);
                      setShowVehicleSelector(true);
                    }}
                    className="text-xs"
                  >
                    Switch Vehicle
                  </Button>
                </div>
                <div className="text-sm">
                  <div className="flex items-center space-x-2">
                    {currentVehicleType === 'tractor' ? 
                      <Car className="h-4 w-4 text-ag-green" /> : 
                      <Wrench className="h-4 w-4 text-ag-green" />
                    }
                    <span className="capitalize font-medium">{currentVehicleType}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentVehicleType === 'tractor' ? 'Model: JD 5050D' : 'Model: TL 300X'}
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowProfile(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Selector Modal */}
      <Dialog open={showVehicleSelector} onOpenChange={setShowVehicleSelector}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Switch Vehicle</span>
            </DialogTitle>
            <DialogDescription>
              Select the vehicle you want to control from the dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-4">
              {/* Tractor Selection */}
              <div className="space-y-3">
                <Button
                  variant={currentVehicleType === 'tractor' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentVehicleType('tractor');
                    setShowVehicleSelector(false);
                  }}
                  className="p-4 h-auto justify-start text-left w-full"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">John Deere Tractor</div>
                      <div className="text-sm opacity-75">Model: {selectedTractorModel} • 50 HP</div>
                      <div className="text-xs text-green-600">Active • Ready</div>
                    </div>
                  </div>
                </Button>
                
                <div className="ml-16">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Select Tractor Model:</label>
                  <Select value={selectedTractorModel} onValueChange={setSelectedTractorModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {tractorModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Tiller Selection */}
              <div className="space-y-3">
                <Button
                  variant={currentVehicleType === 'tiller' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentVehicleType('tiller');
                    setShowVehicleSelector(false);
                  }}
                  className="p-4 h-auto justify-start text-left w-full"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Power Tiller</div>
                      <div className="text-sm opacity-75">Model: {selectedTillerModel} • 15 HP</div>
                      <div className="text-xs text-orange-600">Available • Serviced</div>
                    </div>
                  </div>
                </Button>
                
                <div className="ml-16">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Select Tiller Model:</label>
                  <Select value={selectedTillerModel} onValueChange={setSelectedTillerModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {tillerModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowVehicleSelector(false);
                  setLocation('/owner-registration');
                }}
                className="w-full text-ag-green hover:bg-ag-green/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register New Vehicle
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowVehicleSelector(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
