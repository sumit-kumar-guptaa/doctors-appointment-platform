// AR/VR Medical Visualization System
// Provides immersive 3D medical visualization and virtual reality training

class ARVRMedicalSystem {
  constructor() {
    this.isInitialized = false;
    this.isARSupported = false;
    this.isVRSupported = false;
    this.webXRSession = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.vrControls = null;
    this.arControls = null;
    this.medicalModels = new Map();
    this.anatomyViewer = null;
    this.surgicalSimulator = null;
    this.diagnosticVisualizer = null;
  }

  // Initialize AR/VR system
  async initialize() {
    try {
      await this.checkWebXRSupport();
      await this.initializeThreeJS();
      await this.loadMedicalModels();
      await this.setupMedicalScenes();
      
      this.isInitialized = true;
      console.log('AR/VR Medical System initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize AR/VR system:', error);
      return false;
    }
  }

  // Check WebXR support
  async checkWebXRSupport() {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      try {
        this.isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
        this.isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
      } catch (error) {
        console.warn('WebXR not fully supported:', error);
      }
    }

    // Fallback detection for mobile AR
    if (!this.isARSupported && typeof DeviceMotionEvent !== 'undefined') {
      this.isARSupported = true; // Basic AR support via device motion
    }

    console.log('WebXR Support - VR:', this.isVRSupported, 'AR:', this.isARSupported);
  }

  // Initialize Three.js for 3D rendering
  async initializeThreeJS() {
    // Note: In production, import Three.js properly
    if (typeof window !== 'undefined' && window.THREE) {
      const THREE = window.THREE;
      
      // Scene setup
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x000011);
      
      // Camera setup
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 5);
      
      // Renderer setup
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.xr.enabled = true;
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      this.scene.add(directionalLight);
      
      // Controls for non-VR interaction
      if (window.THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
      }
    }
  }

  // Load medical 3D models and assets
  async loadMedicalModels() {
    const modelUrls = {
      heart: '/models/medical/heart.gltf',
      brain: '/models/medical/brain.gltf',
      skeleton: '/models/medical/skeleton.gltf',
      lungs: '/models/medical/lungs.gltf',
      liver: '/models/medical/liver.gltf',
      kidneys: '/models/medical/kidneys.gltf',
      digestive: '/models/medical/digestive.gltf',
      nervous: '/models/medical/nervous.gltf',
      circulatory: '/models/medical/circulatory.gltf',
      respiratory: '/models/medical/respiratory.gltf'
    };

    // In production, load actual GLTF models
    for (const [name, url] of Object.entries(modelUrls)) {
      try {
        const model = await this.loadGLTFModel(url);
        this.medicalModels.set(name, model);
      } catch (error) {
        console.warn(`Failed to load model ${name}:`, error);
        // Create fallback geometric models
        this.medicalModels.set(name, this.createFallbackModel(name));
      }
    }
  }

  // Load GLTF model (fallback to geometric shapes for demo)
  async loadGLTFModel(url) {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.THREE) {
        const THREE = window.THREE;
        
        // Fallback: create simple geometric representations
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
          color: Math.random() * 0xffffff,
          transparent: true,
          opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add interaction capabilities
        mesh.userData = {
          interactive: true,
          medicalInfo: this.getMedicalInfo(url),
          animations: []
        };
        
        resolve(mesh);
      } else {
        reject(new Error('Three.js not available'));
      }
    });
  }

  // Create fallback geometric models
  createFallbackModel(organName) {
    if (typeof window !== 'undefined' && window.THREE) {
      const THREE = window.THREE;
      
      const organShapes = {
        heart: () => new THREE.ConeGeometry(0.8, 1.5, 8),
        brain: () => new THREE.SphereGeometry(0.9, 16, 16),
        skeleton: () => new THREE.CylinderGeometry(0.1, 0.1, 2, 8),
        lungs: () => new THREE.CylinderGeometry(0.6, 0.8, 1.2, 6),
        liver: () => new THREE.BoxGeometry(1.2, 0.8, 0.6),
        kidneys: () => new THREE.CapsuleGeometry(0.3, 0.6, 4, 8),
        digestive: () => new THREE.TorusGeometry(0.6, 0.2, 8, 16),
        nervous: () => new THREE.OctahedronGeometry(0.8),
        circulatory: () => new THREE.TorusKnotGeometry(0.4, 0.1, 64, 8),
        respiratory: () => new THREE.DodecahedronGeometry(0.7)
      };

      const organColors = {
        heart: 0xff4444,
        brain: 0xffaaff,
        skeleton: 0xffffaa,
        lungs: 0x44aaff,
        liver: 0x884422,
        kidneys: 0x994444,
        digestive: 0xffaa44,
        nervous: 0xaaffaa,
        circulatory: 0xff4488,
        respiratory: 0x4488ff
      };

      const geometry = organShapes[organName] ? organShapes[organName]() : new THREE.SphereGeometry(0.8, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: organColors[organName] || 0x888888,
        transparent: true,
        opacity: 0.8,
        shininess: 30
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        organName,
        interactive: true,
        medicalInfo: this.getMedicalInfo(organName),
        animations: []
      };

      return mesh;
    }
    return null;
  }

  // Get medical information for organs
  getMedicalInfo(organName) {
    const medicalData = {
      heart: {
        name: 'Heart',
        function: 'Pumps blood throughout the body',
        commonConditions: ['Coronary Artery Disease', 'Heart Failure', 'Arrhythmias'],
        symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
        treatments: ['Medication', 'Surgery', 'Lifestyle changes'],
        anatomicalDetails: 'Four-chambered muscular organ, ~300g weight'
      },
      brain: {
        name: 'Brain',
        function: 'Controls all body functions and cognitive processes',
        commonConditions: ['Stroke', 'Alzheimer\'s', 'Tumors'],
        symptoms: ['Headaches', 'Memory loss', 'Confusion'],
        treatments: ['Medication', 'Surgery', 'Therapy'],
        anatomicalDetails: 'Central nervous system, ~1.4kg weight, 86 billion neurons'
      },
      lungs: {
        name: 'Lungs',
        function: 'Gas exchange - oxygen in, carbon dioxide out',
        commonConditions: ['Pneumonia', 'Asthma', 'COPD'],
        symptoms: ['Cough', 'Shortness of breath', 'Chest pain'],
        treatments: ['Inhalers', 'Antibiotics', 'Oxygen therapy'],
        anatomicalDetails: 'Two organs, ~300 million alveoli each'
      },
      liver: {
        name: 'Liver',
        function: 'Detoxification, protein synthesis, bile production',
        commonConditions: ['Hepatitis', 'Cirrhosis', 'Fatty liver'],
        symptoms: ['Jaundice', 'Fatigue', 'Abdominal pain'],
        treatments: ['Medication', 'Lifestyle changes', 'Transplant'],
        anatomicalDetails: 'Largest internal organ, ~1.5kg weight, regenerative'
      }
    };

    return medicalData[organName] || {
      name: 'Unknown Organ',
      function: 'Medical information not available',
      commonConditions: [],
      symptoms: [],
      treatments: [],
      anatomicalDetails: 'Details not available'
    };
  }

  // Setup specialized medical scenes
  async setupMedicalScenes() {
    this.anatomyViewer = new AnatomyViewer(this.scene, this.medicalModels);
    this.surgicalSimulator = new SurgicalSimulator(this.scene, this.medicalModels);
    this.diagnosticVisualizer = new DiagnosticVisualizer(this.scene, this.medicalModels);
  }

  // Start VR session
  async startVRSession() {
    if (!this.isVRSupported) {
      throw new Error('VR not supported on this device');
    }

    try {
      this.webXRSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'eye-tracking']
      });

      this.renderer.xr.setSession(this.webXRSession);
      
      // Setup VR controllers
      this.setupVRControllers();
      
      // Start render loop
      this.renderer.setAnimationLoop(this.renderVR.bind(this));
      
      return true;
    } catch (error) {
      console.error('Failed to start VR session:', error);
      return false;
    }
  }

  // Start AR session
  async startARSession() {
    if (!this.isARSupported) {
      throw new Error('AR not supported on this device');
    }

    try {
      this.webXRSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
        optionalFeatures: ['dom-overlay', 'hit-test']
      });

      this.renderer.xr.setSession(this.webXRSession);
      
      // Setup AR tracking
      this.setupARTracking();
      
      // Start render loop
      this.renderer.setAnimationLoop(this.renderAR.bind(this));
      
      return true;
    } catch (error) {
      console.error('Failed to start AR session:', error);
      return false;
    }
  }

  // Setup VR controllers
  setupVRControllers() {
    if (typeof window !== 'undefined' && window.THREE && this.renderer.xr) {
      const THREE = window.THREE;
      
      const controller1 = this.renderer.xr.getController(0);
      const controller2 = this.renderer.xr.getController(1);
      
      // Add controller models
      const controllerModelFactory = new THREE.XRControllerModelFactory();
      
      const controllerGrip1 = this.renderer.xr.getControllerGrip(0);
      controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
      this.scene.add(controllerGrip1);
      
      const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
      controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
      this.scene.add(controllerGrip2);
      
      // Add interaction handlers
      controller1.addEventListener('selectstart', this.onVRSelectStart.bind(this));
      controller1.addEventListener('selectend', this.onVRSelectEnd.bind(this));
      controller2.addEventListener('selectstart', this.onVRSelectStart.bind(this));
      controller2.addEventListener('selectend', this.onVRSelectEnd.bind(this));
      
      this.scene.add(controller1);
      this.scene.add(controller2);
      
      this.vrControls = { controller1, controller2, controllerGrip1, controllerGrip2 };
    }
  }

  // Setup AR tracking
  setupARTracking() {
    // Setup AR-specific features like hit testing, plane detection
    if (this.webXRSession) {
      // Request hit test source for surface detection
      this.webXRSession.requestReferenceSpace('viewer').then(space => {
        this.webXRSession.requestHitTestSource({ space }).then(hitTestSource => {
          this.hitTestSource = hitTestSource;
        });
      });
    }
  }

  // VR render loop
  renderVR() {
    if (this.controls) {
      this.controls.update();
    }

    // Update medical visualizations
    if (this.anatomyViewer) {
      this.anatomyViewer.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  // AR render loop
  renderAR() {
    // Handle AR-specific rendering
    if (this.hitTestSource) {
      const frame = this.renderer.xr.getFrame();
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        // Position AR content at detected surfaces
        this.positionARContent(hit);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Position AR content on detected surfaces
  positionARContent(hit) {
    const hitPose = hit.getPose(this.renderer.xr.getReferenceSpace());
    if (hitPose) {
      // Place medical models at the detected position
      this.medicalModels.forEach((model, name) => {
        if (model.userData.arPlaced) {
          model.position.setFromMatrixPosition(hitPose.transform.matrix);
          model.quaternion.setFromRotationMatrix(hitPose.transform.matrix);
        }
      });
    }
  }

  // VR interaction handlers
  onVRSelectStart(event) {
    const controller = event.target;
    const intersections = this.getIntersections(controller);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const object = intersection.object;
      
      if (object.userData.interactive) {
        // Highlight selected object
        object.material.emissive.setHex(0x444444);
        this.selectedObject = object;
        
        // Show medical information
        this.showMedicalInfo(object.userData.medicalInfo);
      }
    }
  }

  onVRSelectEnd(event) {
    if (this.selectedObject) {
      this.selectedObject.material.emissive.setHex(0x000000);
      this.selectedObject = null;
    }
  }

  // Get controller intersections with objects
  getIntersections(controller) {
    const tempMatrix = new (typeof window !== 'undefined' && window.THREE ? window.THREE.Matrix4 : Object)();
    const raycaster = new (typeof window !== 'undefined' && window.THREE ? window.THREE.Raycaster : Object)();
    
    if (typeof window !== 'undefined' && window.THREE) {
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      
      const intersectableObjects = [];
      this.medicalModels.forEach(model => {
        if (model.userData.interactive) {
          intersectableObjects.push(model);
        }
      });
      
      return raycaster.intersectObjects(intersectableObjects);
    }
    return [];
  }

  // Display medical information
  showMedicalInfo(medicalInfo) {
    // Create 3D text or UI panel showing medical information
    console.log('Medical Info:', medicalInfo);
    
    // In VR/AR, this would create floating UI panels
    this.createMedicalInfoPanel(medicalInfo);
  }

  // Create medical information panel in 3D space
  createMedicalInfoPanel(medicalInfo) {
    if (typeof window !== 'undefined' && window.THREE) {
      const THREE = window.THREE;
      
      // Create a simple text mesh (in production, use HTML/CSS in 3D)
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      context.fillStyle = 'rgba(0, 0, 0, 0.8)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = 'white';
      context.font = '24px Arial';
      context.textAlign = 'center';
      
      let y = 50;
      context.fillText(medicalInfo.name, canvas.width / 2, y);
      y += 40;
      
      context.font = '16px Arial';
      context.textAlign = 'left';
      
      const lines = [
        'Function: ' + medicalInfo.function,
        'Common Conditions:',
        ...medicalInfo.commonConditions.map(c => '• ' + c),
        'Symptoms:',
        ...medicalInfo.symptoms.map(s => '• ' + s)
      ];
      
      lines.forEach(line => {
        if (y < canvas.height - 20) {
          context.fillText(line, 20, y);
          y += 25;
        }
      });
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const infoPanelMesh = new THREE.Mesh(geometry, material);
      
      infoPanelMesh.position.set(0, 2, -1);
      this.scene.add(infoPanelMesh);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        this.scene.remove(infoPanelMesh);
        texture.dispose();
        material.dispose();
        geometry.dispose();
      }, 10000);
    }
  }

  // Load patient-specific 3D data
  async loadPatientScan(scanData) {
    try {
      // Process DICOM or other medical imaging data
      const medicalVolume = await this.processMedicalImaging(scanData);
      
      // Create 3D visualization
      const volumeVisualization = this.createVolumeVisualization(medicalVolume);
      
      // Add to scene
      this.scene.add(volumeVisualization);
      
      return volumeVisualization;
    } catch (error) {
      console.error('Failed to load patient scan:', error);
      return null;
    }
  }

  // Process medical imaging data (DICOM, MRI, CT scans)
  async processMedicalImaging(scanData) {
    // In production, use libraries like cornerstone.js, vtk.js, or ami.js
    return {
      width: scanData.width || 512,
      height: scanData.height || 512,
      depth: scanData.depth || 256,
      data: scanData.pixelData || new Uint8Array(512 * 512 * 256),
      spacing: scanData.pixelSpacing || [1, 1, 1],
      origin: scanData.imagePosition || [0, 0, 0]
    };
  }

  // Create volume visualization from medical imaging
  createVolumeVisualization(volumeData) {
    if (typeof window !== 'undefined' && window.THREE) {
      const THREE = window.THREE;
      
      // Create volume rendering (simplified)
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      
      const volumeMesh = new THREE.Mesh(geometry, material);
      volumeMesh.userData = {
        volumeData,
        interactive: true,
        medicalScan: true
      };
      
      return volumeMesh;
    }
    return null;
  }

  // Stop current XR session
  async stopXRSession() {
    if (this.webXRSession) {
      await this.webXRSession.end();
      this.webXRSession = null;
    }
    
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
    }
  }

  // Get system capabilities
  getCapabilities() {
    return {
      isInitialized: this.isInitialized,
      vrSupported: this.isVRSupported,
      arSupported: this.isARSupported,
      webXRSupported: typeof navigator !== 'undefined' && 'xr' in navigator,
      features: {
        handTracking: this.isVRSupported,
        eyeTracking: this.isVRSupported,
        hitTesting: this.isARSupported,
        planeDetection: this.isARSupported,
        medicalVisualization: this.isInitialized,
        surgicalSimulation: this.isInitialized,
        diagnosticVisualization: this.isInitialized
      }
    };
  }

  // Export VR/AR session data
  exportSession() {
    return {
      timestamp: new Date().toISOString(),
      capabilities: this.getCapabilities(),
      interactionHistory: this.interactionHistory || [],
      medicalVisualizationsViewed: Array.from(this.medicalModels.keys())
    };
  }
}

// Anatomy Viewer for detailed organ exploration
class AnatomyViewer {
  constructor(scene, medicalModels) {
    this.scene = scene;
    this.medicalModels = medicalModels;
    this.currentView = 'overview';
    this.animationMixers = [];
  }

  update() {
    // Update animations
    this.animationMixers.forEach(mixer => {
      mixer.update(0.016); // ~60fps
    });
  }

  switchToSystemView(systemName) {
    // Show only organs related to specific body system
    this.medicalModels.forEach((model, name) => {
      const isPartOfSystem = this.getSystemOrgans(systemName).includes(name);
      model.visible = isPartOfSystem;
      
      if (isPartOfSystem) {
        this.highlightOrgan(model);
      }
    });
  }

  getSystemOrgans(systemName) {
    const systems = {
      cardiovascular: ['heart', 'circulatory'],
      respiratory: ['lungs', 'respiratory'],
      nervous: ['brain', 'nervous'],
      digestive: ['liver', 'digestive'],
      skeletal: ['skeleton']
    };
    
    return systems[systemName] || [];
  }

  highlightOrgan(model) {
    if (typeof window !== 'undefined' && window.THREE) {
      // Add glow effect or outline
      model.material.emissive.setHex(0x222222);
    }
  }
}

// Surgical Simulator for training and planning
class SurgicalSimulator {
  constructor(scene, medicalModels) {
    this.scene = scene;
    this.medicalModels = medicalModels;
    this.surgicalTools = [];
    this.currentProcedure = null;
  }

  startProcedure(procedureName) {
    this.currentProcedure = procedureName;
    this.setupProcedureEnvironment(procedureName);
  }

  setupProcedureEnvironment(procedureName) {
    // Setup specific organs and tools for the procedure
    const procedures = {
      heartSurgery: ['heart', 'circulatory'],
      brainSurgery: ['brain', 'nervous'],
      lungSurgery: ['lungs', 'respiratory']
    };

    const relevantOrgans = procedures[procedureName] || [];
    this.showOnlyOrgans(relevantOrgans);
    this.loadSurgicalTools(procedureName);
  }

  showOnlyOrgans(organNames) {
    this.medicalModels.forEach((model, name) => {
      model.visible = organNames.includes(name);
    });
  }

  loadSurgicalTools(procedureName) {
    // Load virtual surgical instruments
    console.log(`Loading surgical tools for ${procedureName}`);
  }
}

// Diagnostic Visualizer for medical imaging and analysis
class DiagnosticVisualizer {
  constructor(scene, medicalModels) {
    this.scene = scene;
    this.medicalModels = medicalModels;
    this.diagnosticOverlays = [];
  }

  visualizeDiagnosis(diagnosisData) {
    // Create visual representations of medical conditions
    const affectedOrgan = this.medicalModels.get(diagnosisData.organ);
    
    if (affectedOrgan) {
      this.addDiagnosticMarkers(affectedOrgan, diagnosisData);
    }
  }

  addDiagnosticMarkers(organ, diagnosisData) {
    // Add visual markers for abnormalities, inflammation, etc.
    if (typeof window !== 'undefined' && window.THREE) {
      const THREE = window.THREE;
      
      const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: this.getConditionColor(diagnosisData.condition),
        transparent: true,
        opacity: 0.8
      });
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(organ.position);
      marker.position.add(new THREE.Vector3(
        Math.random() * 0.5 - 0.25,
        Math.random() * 0.5 - 0.25,
        Math.random() * 0.5 - 0.25
      ));
      
      this.scene.add(marker);
      this.diagnosticOverlays.push(marker);
    }
  }

  getConditionColor(condition) {
    const conditionColors = {
      inflammation: 0xff4444,
      tumor: 0x884400,
      infection: 0x44ff44,
      blockage: 0x440088,
      default: 0x888888
    };
    
    return conditionColors[condition] || conditionColors.default;
  }
}

// Singleton instance
const arvrMedicalSystem = new ARVRMedicalSystem();

export default arvrMedicalSystem;
export { ARVRMedicalSystem, AnatomyViewer, SurgicalSimulator, DiagnosticVisualizer };