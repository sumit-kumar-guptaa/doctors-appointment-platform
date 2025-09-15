// AR/VR Medical Viewer Component
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import arvrMedicalSystem from '@/lib/arvr-medical-system';

const ARVRMedicalViewer = ({ isVisible = true, specialty, patientCondition }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [isVRActive, setIsVRActive] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState('heart');
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'vr', 'ar'
  const [currentView, setCurrentView] = useState('anatomy');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  // Initialize AR/VR system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setIsLoading(true);
        const success = await arvrMedicalSystem.initialize();
        if (success) {
          setIsInitialized(true);
          setCapabilities(arvrMedicalSystem.getCapabilities());
        }
      } catch (error) {
        console.error('Failed to initialize AR/VR system:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible) {
      initializeSystem();
    }
  }, [isVisible]);

  // Setup canvas for 3D rendering
  useEffect(() => {
    if (isInitialized && canvasRef.current && arvrMedicalSystem.renderer) {
      canvasRef.current.appendChild(arvrMedicalSystem.renderer.domElement);
      
      // Start basic 3D rendering loop
      const animate = () => {
        if (arvrMedicalSystem.controls) {
          arvrMedicalSystem.controls.update();
        }
        arvrMedicalSystem.renderer.render(
          arvrMedicalSystem.scene,
          arvrMedicalSystem.camera
        );
        requestAnimationFrame(animate);
      };
      animate();

      return () => {
        if (canvasRef.current && arvrMedicalSystem.renderer) {
          canvasRef.current.removeChild(arvrMedicalSystem.renderer.domElement);
        }
      };
    }
  }, [isInitialized]);

  // Start VR session
  const startVRSession = async () => {
    try {
      setIsLoading(true);
      const success = await arvrMedicalSystem.startVRSession();
      if (success) {
        setIsVRActive(true);
        setViewMode('vr');
      }
    } catch (error) {
      console.error('Failed to start VR session:', error);
      alert('VR not supported or failed to initialize. Please use a VR-compatible browser and device.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start AR session
  const startARSession = async () => {
    try {
      setIsLoading(true);
      const success = await arvrMedicalSystem.startARSession();
      if (success) {
        setIsARActive(true);
        setViewMode('ar');
      }
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('AR not supported or failed to initialize. Please use an AR-compatible mobile browser.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop XR sessions
  const stopXRSession = async () => {
    try {
      await arvrMedicalSystem.stopXRSession();
      setIsVRActive(false);
      setIsARActive(false);
      setViewMode('3d');
    } catch (error) {
      console.error('Failed to stop XR session:', error);
    }
  };

  // Switch anatomy view
  const switchAnatomyView = (system) => {
    if (arvrMedicalSystem.anatomyViewer) {
      arvrMedicalSystem.anatomyViewer.switchToSystemView(system);
      setCurrentView(system);
    }
  };

  // Load patient-specific scan
  const loadPatientScan = async () => {
    // Demo patient data
    const demoScanData = {
      width: 512,
      height: 512,
      depth: 256,
      pixelData: new Uint8Array(512 * 512 * 256),
      pixelSpacing: [1, 1, 1],
      imagePosition: [0, 0, 0],
      patientInfo: {
        condition: patientCondition || 'General examination',
        specialty: specialty || 'General Medicine'
      }
    };

    try {
      setIsLoading(true);
      const visualization = await arvrMedicalSystem.loadPatientScan(demoScanData);
      if (visualization) {
        console.log('Patient scan loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load patient scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  const availableOrgans = [
    { value: 'heart', label: '❤️ Heart', system: 'cardiovascular' },
    { value: 'brain', label: '🧠 Brain', system: 'nervous' },
    { value: 'lungs', label: '🫁 Lungs', system: 'respiratory' },
    { value: 'liver', label: '🟤 Liver', system: 'digestive' },
    { value: 'kidneys', label: '🔴 Kidneys', system: 'urinary' },
    { value: 'skeleton', label: '🦴 Skeleton', system: 'skeletal' }
  ];

  const anatomySystems = [
    { value: 'overview', label: '📋 Overview' },
    { value: 'cardiovascular', label: '❤️ Cardiovascular' },
    { value: 'respiratory', label: '🫁 Respiratory' },
    { value: 'nervous', label: '🧠 Nervous System' },
    { value: 'digestive', label: '🍽️ Digestive' },
    { value: 'skeletal', label: '🦴 Skeletal' }
  ];

  return (
    <Card className="w-full bg-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🥽 AR/VR Medical Visualization
          {!isInitialized && <Badge variant="outline" className="text-yellow-600">Initializing...</Badge>}
          {isVRActive && <Badge className="bg-purple-500 animate-pulse">🔴 VR Active</Badge>}
          {isARActive && <Badge className="bg-blue-500 animate-pulse">🔴 AR Active</Badge>}
          {isLoading && <Badge variant="outline" className="text-blue-600">Loading...</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className={`text-2xl ${capabilities?.vrSupported ? 'text-green-500' : 'text-red-500'}`}>
              {capabilities?.vrSupported ? '✅' : '❌'}
            </div>
            <div className="text-sm font-medium">VR Ready</div>
          </div>
          <div className="space-y-2">
            <div className={`text-2xl ${capabilities?.arSupported ? 'text-green-500' : 'text-red-500'}`}>
              {capabilities?.arSupported ? '✅' : '❌'}
            </div>
            <div className="text-sm font-medium">AR Ready</div>
          </div>
          <div className="space-y-2">
            <div className={`text-2xl ${isInitialized ? 'text-green-500' : 'text-yellow-500'}`}>
              {isInitialized ? '✅' : '⏳'}
            </div>
            <div className="text-sm font-medium">3D Viewer</div>
          </div>
        </div>

        <Separator />

        {/* Control Panel */}
        <div className="space-y-4">
          {/* View Mode Selection */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!isVRActive && !isARActive && (
              <>
                <Button
                  onClick={startVRSession}
                  disabled={!capabilities?.vrSupported || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  🥽 Enter VR
                </Button>
                <Button
                  onClick={startARSession}
                  disabled={!capabilities?.arSupported || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📱 Start AR
                </Button>
              </>
            )}
            
            {(isVRActive || isARActive) && (
              <Button
                onClick={stopXRSession}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                ⏹ Exit {isVRActive ? 'VR' : 'AR'}
              </Button>
            )}

            <Button
              onClick={loadPatientScan}
              disabled={!isInitialized || isLoading}
              variant="outline"
            >
              📊 Load Patient Scan
            </Button>
          </div>

          {/* Organ Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Focus Organ</label>
              <Select value={selectedOrgan} onValueChange={setSelectedOrgan} disabled={!isInitialized}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organ">
                    {availableOrgans.find(org => org.value === selectedOrgan)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableOrgans.map((organ) => (
                    <SelectItem key={organ.value} value={organ.value}>
                      {organ.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Body System</label>
              <Select value={currentView} onValueChange={switchAnatomyView} disabled={!isInitialized}>
                <SelectTrigger>
                  <SelectValue placeholder="Select system">
                    {anatomySystems.find(sys => sys.value === currentView)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {anatomySystems.map((system) => (
                    <SelectItem key={system.value} value={system.value}>
                      {system.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* 3D Viewer Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">3D Medical Visualization</label>
            <Badge variant="outline" className="text-xs">
              Current: {viewMode.toUpperCase()} Mode
            </Badge>
          </div>
          
          <div className="relative">
            <div 
              ref={canvasRef}
              className="w-full h-64 bg-black rounded-lg overflow-hidden border border-gray-300"
              style={{ minHeight: '256px' }}
            />
            
            {!isInitialized && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <div className="animate-spin text-2xl mb-2">⚕️</div>
                  <div className="text-sm">Initializing 3D Medical Viewer...</div>
                </div>
              </div>
            )}
          </div>

          {/* Viewer Controls */}
          {isInitialized && (
            <div className="text-xs text-gray-600 space-y-1">
              <div>🖱️ Mouse: Rotate view | Scroll: Zoom in/out</div>
              <div>📱 Touch: Drag to rotate | Pinch to zoom</div>
              {capabilities?.vrSupported && <div>🥽 VR: Use hand controllers to interact</div>}
              {capabilities?.arSupported && <div>📱 AR: Point camera at flat surface to place organs</div>}
            </div>
          )}
        </div>

        {/* Medical Information Panel */}
        {selectedOrgan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              {availableOrgans.find(org => org.value === selectedOrgan)?.label} Information
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Click on organ in 3D view for detailed information</div>
              <div>• VR mode provides immersive medical education</div>
              <div>• AR mode allows placing organs in real environment</div>
              {specialty && <div>• Specialized view for {specialty}</div>}
              {patientCondition && <div>• Focused on: {patientCondition}</div>}
            </div>
          </div>
        )}

        {/* Capabilities Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="font-medium mb-1">System Capabilities:</div>
          <div className="space-y-1">
            <div>✓ 3D Anatomical Visualization</div>
            <div>✓ Interactive Organ Exploration</div>
            <div>✓ Medical Education Content</div>
            {capabilities?.features?.handTracking && <div>✓ VR Hand Tracking</div>}
            {capabilities?.features?.hitTesting && <div>✓ AR Surface Detection</div>}
            {capabilities?.features?.surgicalSimulation && <div>✓ Surgical Training Simulation</div>}
            {capabilities?.features?.diagnosticVisualization && <div>✓ Diagnostic Imaging Support</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ARVRMedicalViewer;