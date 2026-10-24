/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CountryCode, HouseholdAgent, RuralTypology } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import {
  Layers,
  Eye,
  Camera,
  Sun,
  CloudRain,
  Flame,
  Snowflake,
  Send,
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  Zap,
  Download,
  Image as ImageIcon,
  X,
  Copy,
  Check
} from 'lucide-react';
import { export3DWithParameters, generate3DInfographicCanvas } from '../utils/export3DImage';

interface DigitalTwin3DProps {
  selectedCountry: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  households: HouseholdAgent[];
  activeShockType: string;
  transferDisbursed: boolean;
  selectedHousehold: HouseholdAgent | null;
  onSelectHousehold: (hh: HouseholdAgent | null) => void;
  datasetName?: string;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  selectedCountry,
  onSelectCountry,
  households,
  activeShockType,
  transferDisbursed,
  selectedHousehold,
  onSelectHousehold,
  datasetName = 'Dataset Activo'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d_fallback'>('3d');
  const [metricColorBy, setMetricColorBy] = useState<'poverty' | 'income' | 'transfers' | 'vulnerability'>('poverty');
  const [quickFilter, setQuickFilter] = useState<'all' | 'poor_only' | 'transfers_only' | 'shock_exposed'>('all');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [simulationPulseTrigger, setSimulationPulseTrigger] = useState<number>(0);
  const [shockPulseTrigger, setShockPulseTrigger] = useState<number>(0);
  const [hoveredHousehold, setHoveredHousehold] = useState<HouseholdAgent | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Internal Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const householdsGroupRef = useRef<THREE.Group | null>(null);
  const shockMeshRef = useRef<THREE.Mesh | null>(null);
  const transferRingsRef = useRef<THREE.Group | null>(null);
  const autoRotateRef = useRef<boolean>(autoRotate);

  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [exportToastMessage, setExportToastMessage] = useState<string | null>(null);

  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewOverlayMode, setPreviewOverlayMode] = useState<boolean>(true);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  const handleOpenPreviewModal = async (overlay: boolean) => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      setExportToastMessage('Error: El motor 3D no está disponible para captura.');
      setTimeout(() => setExportToastMessage(null), 3000);
      return;
    }

    try {
      setIsExportingImage(true);
      setShowExportMenu(false);
      setPreviewOverlayMode(overlay);

      const canvas = await generate3DInfographicCanvas({
        renderer: rendererRef.current,
        scene: sceneRef.current,
        camera: cameraRef.current,
        country: COUNTRIES_DATA[selectedCountry],
        households,
        activeShockType,
        transferDisbursed,
        metricColorBy,
        datasetName,
        includeOverlay: overlay
      });

      const url = canvas.toDataURL('image/png');
      setPreviewImageUrl(url);
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Error al generar vista previa 3D:', err);
      setExportToastMessage('Error al generar la vista previa de la infografía.');
      setTimeout(() => setExportToastMessage(null), 3000);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExport3DImage = async (includeParameters: boolean) => {
    // Open the interactive preview modal directly so user can inspect and download
    await handleOpenPreviewModal(includeParameters);
  };

  const handleCopyPreviewImage = async () => {
    if (!previewImageUrl) return;
    try {
      const res = await fetch(previewImageUrl);
      const blob = await res.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      }
    } catch (err) {
      console.error('Error al copiar imagen:', err);
    }
  };

  const handleDownloadFromPreview = () => {
    if (!previewImageUrl) return;
    const link = document.createElement('a');
    link.href = previewImageUrl;
    link.download = previewOverlayMode
      ? `Infografia_Ejecutiva_Gemelo_3D_${selectedCountry}_${Date.now()}.png`
      : `Captura_Limpia_Gemelo_3D_${selectedCountry}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportToastMessage('¡Imagen en alta resolución (2K) descargada exitosamente!');
    setTimeout(() => setExportToastMessage(null), 4000);
  };

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 0.8;
    }
  }, [autoRotate]);

  // Initial 3D Scene Setup
  useEffect(() => {
    if (viewMode === '2d_fallback' || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 580;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.010);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 42, 58);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment reflection
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 2. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 12;
    controls.maxDistance = 140;
    controls.target.set(0, 0, 0);
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // 3. Balanced Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x090d16, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(30, 55, 35);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 130;
      keyLight.shadow.camera.left = -45;
      keyLight.shadow.camera.right = 45;
      keyLight.shadow.camera.top = 45;
      keyLight.shadow.camera.bottom = -45;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimLight.position.set(-35, 25, -30);
    scene.add(rimLight);

    // 4. Procedural Relief Terrain for South America with Biome Elevation Colors
    const continentShape = new THREE.Shape();
    continentShape.moveTo(-10, 18);
    continentShape.lineTo(6, 17);
    continentShape.lineTo(22, 0);
    continentShape.lineTo(16, -18);
    continentShape.lineTo(8, -32);
    continentShape.lineTo(0, -48);
    continentShape.lineTo(-8, -38);
    continentShape.lineTo(-14, -18);
    continentShape.lineTo(-18, -4);
    continentShape.lineTo(-12, 12);
    continentShape.closePath();

    const continentGeo = new THREE.ExtrudeGeometry(continentShape, {
      depth: 1.8,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.9,
      bevelThickness: 0.7
    });
    continentGeo.rotateX(Math.PI / 2);
    continentGeo.center();

    // Biome-tinted textured terrain
    const continentMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2e26, // Forest greenish base for South America
      roughness: 0.8,
      metalness: 0.12,
      clearcoat: 0.15
    });
    const continentMesh = new THREE.Mesh(continentGeo, continentMat);
    continentMesh.position.y = -0.8;
    continentMesh.receiveShadow = !isSoftwareGl;
    scene.add(continentMesh);

    // Andes Mountains Spine (Western edge, snowy white ridge tops)
    const andesGeo = new THREE.CylinderGeometry(0.6, 2.8, 54, 14);
    andesGeo.rotateZ(Math.PI / 2);
    andesGeo.rotateY(0.18);
    const andesMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85
    });
    const andesSpine = new THREE.Mesh(andesGeo, andesMat);
    andesSpine.position.set(-9.5, 0.6, 2);
    continentMesh.add(andesSpine);

    // Amazon Basin depression overlay (lush green flat)
    const amazonGeo = new THREE.CircleGeometry(12, 24);
    const amazonMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.9
    });
    const amazonBasin = new THREE.Mesh(amazonGeo, amazonMat);
    amazonBasin.rotation.x = -Math.PI / 2;
    amazonBasin.position.set(2, 0.2, -6);
    continentMesh.add(amazonBasin);

    // Oceanic base platform
    const oceanGeo = new THREE.PlaneGeometry(180, 180);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x060911,
      roughness: 0.9
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = -1.6;
    scene.add(oceanMesh);

    // Subtle coordinate grid
    const grid = new THREE.GridHelper(130, 26, 0x1e293b, 0x0f172a);
    grid.position.y = -1.58;
    scene.add(grid);

    // 5. Country Pins Group
    const countryPinsGroup = new THREE.Group();
    scene.add(countryPinsGroup);

    Object.values(COUNTRIES_DATA).forEach((c) => {
      const x = ((c.longitude + 58) / 30) * 22;
      const z = -((c.latitude + 20) / 40) * 35;

      const pinGroup = new THREE.Group();
      pinGroup.position.set(x, 1.0, z);

      const isSelected = c.code === selectedCountry;

      // Pin post
      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8);
      const postMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x06b6d4 : 0x94a3b8,
        metalness: 0.7,
        roughness: 0.2
      });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 1.1;
      pinGroup.add(post);

      // Pin Head (Beacon)
      const headGeo = new THREE.SphereGeometry(isSelected ? 0.9 : 0.6, 16, 16);
      const headMat = new THREE.MeshPhysicalMaterial({
        color: isSelected ? 0x06b6d4 : 0x38bdf8,
        emissive: isSelected ? 0x0891b2 : 0x0369a1,
        emissiveIntensity: isSelected ? 0.9 : 0.4,
        roughness: 0.1,
        metalness: 0.9
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 2.5;
      head.userData = { countryCode: c.code, isCountryPin: true };
      pinGroup.add(head);

      countryPinsGroup.add(pinGroup);
    });

    // 6. Household Agents Group
    const householdsGroup = new THREE.Group();
    householdsGroupRef.current = householdsGroup;
    scene.add(householdsGroup);

    // 7. Dynamic Climate Shock Wave Mesh
    const shockGeo = new THREE.RingGeometry(0.2, 14, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockMesh.rotation.x = -Math.PI / 2;
    shockMesh.position.y = 0.7;
    shockMeshRef.current = shockMesh;
    scene.add(shockMesh);

    // 8. Cash Transfer Pulse Rings Group
    const transferRings = new THREE.Group();
    transferRingsRef.current = transferRings;
    scene.add(transferRings);

    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(r * 2.2 + 0.4, r * 2.2 + 0.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.8 + r * 0.12;
      transferRings.add(ring);
    }

    // 9. Raycasting Interaction (Hover & Pointer Down)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      if (householdsGroupRef.current) {
        const hits = raycaster.intersectObjects(householdsGroupRef.current.children, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.household) {
            obj = obj.parent;
          }
          if (obj?.userData?.household) {
            setHoveredHousehold(obj.userData.household as HouseholdAgent);
            setHoverCoords({ x: event.clientX - rect.left, y: event.clientY - rect.top });
            return;
          }
        }
      }
      setHoveredHousehold(null);
    };

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // 1. Check Country Pins
      const pinHits = raycaster.intersectObjects(countryPinsGroup.children, true);
      if (pinHits.length > 0) {
        let obj: THREE.Object3D | null = pinHits[0].object;
        while (obj && !obj.userData?.countryCode) {
          obj = obj.parent;
        }
        if (obj?.userData?.countryCode) {
          onSelectCountry(obj.userData.countryCode as CountryCode);
          return;
        }
      }

      // 2. Check Households
      if (householdsGroupRef.current) {
        const hhHits = raycaster.intersectObjects(householdsGroupRef.current.children, true);
        if (hhHits.length > 0) {
          let target: THREE.Object3D | null = hhHits[0].object;
          while (target && !target.userData?.household) {
            target = target.parent;
          }
          if (target?.userData?.household) {
            onSelectHousehold(target.userData.household as HouseholdAgent);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Shock Wave animation
      if (shockMeshRef.current && (activeShockType !== 'none' || shockPulseTrigger > 0)) {
        const scale = 1 + (Math.sin(time * 3.2) + 1) * 0.9;
        shockMeshRef.current.scale.set(scale, scale, scale);
        const mat = shockMeshRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.4 + Math.sin(time * 3.2) * 0.25;

        if (activeShockType === 'sequia_severa') mat.color.setHex(0xf97316);
        else if (activeShockType === 'inundacion_fluvial') mat.color.setHex(0x06b6d4);
        else if (activeShockType === 'helada_anomala') mat.color.setHex(0x38bdf8);
      } else if (shockMeshRef.current) {
        (shockMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      // Transfer expansion waves animation
      if (transferRingsRef.current && (transferDisbursed || simulationPulseTrigger > 0)) {
        transferRingsRef.current.children.forEach((child, idx) => {
          const mesh = child as THREE.Mesh;
          const phase = (time * 2.0 + idx * 0.45) % 2.8;
          const scale = 1 + phase * 2.2;
          mesh.scale.set(scale, scale, 1);
          (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.75 - phase * 0.26);
        });
      } else if (transferRingsRef.current) {
        transferRingsRef.current.children.forEach((child) => {
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0;
        });
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      rendererRef.current = null;
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewMode]);

  // Update Households in 3D scene when selection, coloring, or quick filters change
  useEffect(() => {
    if (!householdsGroupRef.current) return;

    const group = householdsGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    // Filter agents
    let filtered = households;
    if (quickFilter === 'poor_only') {
      filtered = households.filter((h) => h.simulatedPovertyStatus !== 'non_poor');
    } else if (quickFilter === 'transfers_only') {
      filtered = households.filter((h) => h.transferReceivedUSD_PPP > 0);
    } else if (quickFilter === 'shock_exposed') {
      filtered = households.filter((h) => Math.max(h.droughtVulnerability, h.floodVulnerability, h.frostVulnerability) > 0.6);
    }

    // Subset for smooth 60fps rendering (~150 dwellings)
    const displayAgents = filtered.slice(0, 160);

    const houseBaseGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const houseRoofGeo = new THREE.ConeGeometry(0.6, 0.55, 4);
    houseRoofGeo.rotateY(Math.PI / 4);

    displayAgents.forEach((hh) => {
      const isSelected = selectedHousehold?.id === hh.id;
      const isHovered = hoveredHousehold?.id === hh.id;

      // Color coding logic
      let hexColor = 0x94a3b8;
      if (metricColorBy === 'poverty') {
        if (hh.simulatedPovertyStatus === 'extreme') hexColor = 0xef4444; // Red
        else if (hh.simulatedPovertyStatus === 'moderate') hexColor = 0xf59e0b; // Amber
        else hexColor = 0x10b981; // Emerald (Non-poor)
      } else if (metricColorBy === 'transfers') {
        hexColor = hh.transferReceivedUSD_PPP > 0 ? 0x06b6d4 : 0x475569;
      } else if (metricColorBy === 'vulnerability') {
        const maxV = Math.max(hh.droughtVulnerability, hh.floodVulnerability, hh.frostVulnerability);
        if (maxV > 0.65) hexColor = 0xf97316;
        else if (maxV > 0.40) hexColor = 0xeab308;
        else hexColor = 0x38bdf8;
      } else if (metricColorBy === 'income') {
        if (hh.simulatedConsumptionPerCapita > 250) hexColor = 0x10b981;
        else if (hh.simulatedConsumptionPerCapita > 130) hexColor = 0x38bdf8;
        else hexColor = 0xf59e0b;
      }

      const agentGroup = new THREE.Group();

      const x = ((hh.longitude + 58) / 30) * 22;
      const z = -((hh.latitude + 20) / 40) * 35;
      const y = 0.4 + (hh.physicalAssetIndex || 0.2) * 0.9;

      agentGroup.position.set(x, y, z);

      // House Base (Building)
      const baseMat = new THREE.MeshStandardMaterial({
        color: isHovered ? 0xffffff : hexColor,
        roughness: 0.45,
        metalness: 0.15
      });
      const baseMesh = new THREE.Mesh(houseBaseGeo, baseMat);
      baseMesh.castShadow = true;
      agentGroup.add(baseMesh);

      // Roof
      const roofMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffffff : 0x334155,
        roughness: 0.7
      });
      const roofMesh = new THREE.Mesh(houseRoofGeo, roofMat);
      roofMesh.position.y = 0.62;
      agentGroup.add(roofMesh);

      // Glowing Selection or Transfer Beacon Halo
      if (isSelected || isHovered || (hh.transferReceivedUSD_PPP > 0 && metricColorBy === 'transfers')) {
        const haloGeo = new THREE.RingGeometry(0.55, 0.75, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xffffff : (isHovered ? 0x38bdf8 : 0x06b6d4),
          side: THREE.DoubleSide
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = -0.32;
        agentGroup.add(halo);
      }

      agentGroup.userData = { household: hh };
      group.add(agentGroup);
    });
  }, [households, metricColorBy, quickFilter, selectedHousehold, hoveredHousehold]);

  // Smooth camera glide to active country
  const focusOnActiveCountry = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const c = COUNTRIES_DATA[selectedCountry];
    const targetX = ((c.longitude + 58) / 30) * 22;
    const targetZ = -((c.latitude + 20) / 40) * 35;

    cameraRef.current.position.set(targetX, 22, targetZ + 18);
    controlsRef.current.target.set(targetX, 0, targetZ);
  };

  const activeCountryData = COUNTRIES_DATA[selectedCountry];

  return (
    <div className="relative w-full h-[640px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Header Ribbon with Active Dataset & Quick Status */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide uppercase">Gemelo 3D</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {activeCountryData.name} ({activeCountryData.code})
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
            {datasetName} ({households.length} registros)
          </span>
        </div>

        {/* Action Controls in Top Bar */}
        <div className="flex items-center gap-2">
          {/* Quick Filter Pill Buttons */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                quickFilter === 'all' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setQuickFilter('poor_only')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                quickFilter === 'poor_only' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solo Pobres
            </button>
            <button
              onClick={() => setQuickFilter('transfers_only')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                quickFilter === 'transfers_only' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Con Bono
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              autoRotate ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Auto-rotación suave del mapa 3D"
          >
            {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">Giro 3D</span>
          </button>

          {/* Focus Country Button */}
          <button
            onClick={focusOnActiveCountry}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Enfocar cámara en el país activo"
          >
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Enfocar País</span>
          </button>

          {/* Download 3D Image with Parameters Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExportingImage || viewMode !== '3d'}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              title="Descargar captura del Gemelo 3D en imagen PNG con todos sus parámetros e indicadores"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingImage ? 'Generando...' : 'Descargar Imagen'}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900/98 backdrop-blur-md border border-cyan-800/80 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-1">
                  Exportar Gemelo Digital 3D
                </div>

                <button
                  onClick={() => handleExport3DImage(true)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cyan-950/70 border border-transparent hover:border-cyan-800 text-slate-200 transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-[11px]">Imagen con Parámetros (PNG)</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Incluye infografía completa con métricas P0, bono, choque climático y leyenda.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport3DImage(false)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-slate-300 transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">Solo Vista 3D Limpia (PNG)</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Captura el lienzo WebGL sin superposiciones ni tarjetas de parámetros.
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 3D vs 2D Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === '3d' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2d_fallback')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === '2d_fallback' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              2D
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification for Export */}
      {exportToastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 backdrop-blur-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{exportToastMessage}</span>
        </div>
      )}

      {/* Main 3D Canvas Mount Stage */}
      {viewMode === '3d' ? (
        <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing relative" />
      ) : (
        /* Accessible 2D Fallback Map */
        <div className="w-full flex-1 bg-slate-950 p-6 flex flex-col justify-center items-center overflow-auto">
          <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">
              Cartografía 2D Accesible — {activeCountryData.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Visualización alternativa para equipos sin aceleración WebGL o usuarios con preferencia de movimiento reducido.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {activeCountryData.regions.map((reg) => (
                <div key={reg} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-xs font-medium text-slate-300">{reg}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Vulnerabilidad: {activeCountryData.climateRiskProfile.climateVulnerabilityScore}/100
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-cyan-400 font-mono">
              Coordenadas de referencia: Lat {activeCountryData.latitude.toFixed(2)}, Lng {activeCountryData.longitude.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip for Household */}
      {hoveredHousehold && hoverCoords && (
        <div
          style={{ left: Math.min(hoverCoords.x + 15, 650), top: Math.max(hoverCoords.y - 80, 50) }}
          className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-cyan-500/80 rounded-lg p-3 shadow-2xl text-[11px] space-y-1 w-56 text-slate-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-mono font-bold text-cyan-300">{hoveredHousehold.id}</span>
            <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
              hoveredHousehold.simulatedPovertyStatus === 'extreme' ? 'bg-rose-950 text-rose-300' :
              hoveredHousehold.simulatedPovertyStatus === 'moderate' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
            }`}>
              {hoveredHousehold.simulatedPovertyStatus === 'extreme' ? 'Pobreza Extrema' :
               hoveredHousehold.simulatedPovertyStatus === 'moderate' ? 'Pobreza Moderada' : 'No Pobre'}
            </span>
          </div>
          <div>Zona: <span className="font-medium text-white">{hoveredHousehold.regionName}</span> ({hoveredHousehold.typology})</div>
          <div className="flex justify-between text-slate-400">
            <span>Consumo per cápita:</span>
            <span className="font-mono text-white font-semibold">${hoveredHousehold.simulatedConsumptionPerCapita} USD PPP</span>
          </div>
          {hoveredHousehold.transferReceivedUSD_PPP > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Bono recibido:</span>
              <span className="font-mono font-bold">+${hoveredHousehold.transferReceivedUSD_PPP} USD PPP</span>
            </div>
          )}
        </div>
      )}

      {/* Intuitive On-screen Legend & Hints (Floating Top-Left) */}
      <div className="absolute top-14 left-5 z-20 pointer-events-none hidden sm:block bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-slate-300 space-y-1">
        <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-semibold">
          Leyenda Visual de Hogares
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Pobreza Extrema</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>Pobreza Moderada</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>No Pobre</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-500 pt-0.5">
          Arrastra para rotar · Rueda para zoom · Clic en vivienda para inspección
        </div>
      </div>

      {/* Floating Action Trigger Strip (Top-Right / Mid) */}
      <div className="absolute top-14 right-5 z-20 flex flex-col gap-2">
        <button
          onClick={() => handleExport3DImage(true)}
          disabled={isExportingImage || viewMode !== '3d'}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg shadow-xl border border-cyan-500/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Descargar infografía del Gemelo 3D con todos los parámetros empíricos e indicadores en formato PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExportingImage ? 'Exportando...' : 'Exportar Imagen 3D'}</span>
        </button>

        <button
          onClick={() => setSimulationPulseTrigger((prev) => prev + 1)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-transform active:scale-95"
          title="Disparar simulación visual de desembolso de transferencias monetarias"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simular Desembolso</span>
        </button>

        <button
          onClick={() => setShockPulseTrigger((prev) => prev + 1)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-lg transition-transform active:scale-95"
          title="Disparar visualización de choque climático"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Simular Choque</span>
        </button>
      </div>

      {/* Collapsible Bottom Control Dock */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl z-20 transition-all duration-300 ${
          isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/95 border border-slate-700/80 rounded-t-lg shadow-lg hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mostrar Parámetros del Gemelo 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Ocultar Panel</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Content */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* 1. Metric Color Mode */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                Capa Temática de Color
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setMetricColorBy('poverty')}
                  className={`px-2 py-1.5 rounded text-left font-medium transition-colors ${
                    metricColorBy === 'poverty'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Pobreza FGT
                </button>
                <button
                  onClick={() => setMetricColorBy('income')}
                  className={`px-2 py-1.5 rounded text-left font-medium transition-colors ${
                    metricColorBy === 'income'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Consumo USD
                </button>
                <button
                  onClick={() => setMetricColorBy('transfers')}
                  className={`px-2 py-1.5 rounded text-left font-medium transition-colors ${
                    metricColorBy === 'transfers'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Transferencia
                </button>
                <button
                  onClick={() => setMetricColorBy('vulnerability')}
                  className={`px-2 py-1.5 rounded text-left font-medium transition-colors ${
                    metricColorBy === 'vulnerability'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Riesgo Clima
                </button>
              </div>
            </div>

            {/* 2. Country Switcher Pills */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                Navegación Territorial Rápida (13 Territorios)
              </label>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(COUNTRIES_DATA) as CountryCode[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => onSelectCountry(c)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      c === selectedCountry
                        ? 'bg-cyan-600 text-white font-bold shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Selected Household Telemetry */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Inspección de Hogar</span>
                {selectedHousehold && (
                  <button
                    onClick={() => onSelectHousehold(null)}
                    className="text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    Cerrar
                  </button>
                )}
              </div>
              {selectedHousehold ? (
                <div className="space-y-0.5 text-[11px]">
                  <div className="font-mono text-cyan-300 font-semibold">{selectedHousehold.id}</div>
                  <div className="text-slate-300">
                    {selectedHousehold.regionName} · <span className="text-slate-400">{selectedHousehold.typology}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-0.5 border-t border-slate-800/80">
                    <span>Consumo per cápita:</span>
                    <span className="font-mono text-white tabular-nums">${selectedHousehold.simulatedConsumptionPerCapita}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Transferencia recibida:</span>
                    <span className="font-mono text-emerald-400 tabular-nums">
                      ${selectedHousehold.transferReceivedUSD_PPP}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-[11px] py-1 italic">
                  Pasa el ratón o haz clic sobre una vivienda 3D para inspeccionarla.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Infographic Preview & Download Modal */}
      {showPreviewModal && previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-text animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold">
                  📊
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Infografía Científica del Gemelo 3D</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                      {activeCountryData.name} ({activeCountryData.code})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Composición de alta resolución (2K) con mapa espacial 3D, gráfico comparativo y diagnóstico ejecutivo.
                  </p>
                </div>
              </div>

              {/* Mode Switch & Close */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => handleOpenPreviewModal(true)}
                    className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                      previewOverlayMode
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Infografía Completa
                  </button>
                  <button
                    onClick={() => handleOpenPreviewModal(false)}
                    className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                      !previewOverlayMode
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Solo Vista 3D
                  </button>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Image Preview */}
            <div className="flex-1 p-5 overflow-auto bg-slate-950/50 flex flex-col items-center justify-center">
              <div className="relative border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-full">
                <img
                  src={previewImageUrl}
                  alt="Vista previa infografía Gemelo 3D"
                  className="w-full h-auto max-h-[64vh] object-contain rounded-lg"
                />
              </div>

              <div className="mt-3 text-center text-xs text-slate-400 max-w-2xl">
                💡 <span className="font-semibold text-slate-300">Formato listo para artículos e informes:</span> Incluye el mapa espacial 3D de microconglomerados, diagnóstico narrativo en lenguaje claro, barras de impacto (Línea Base vs. Con Bono vs. Choque) y ficha técnica de políticas.
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80 text-xs">
              <div className="text-slate-400 text-xs">
                Resolución: <span className="font-mono text-cyan-300 font-semibold">2048 × 1152 px (PNG 2K Ultra-Nítido)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleCopyPreviewImage}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                >
                  {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span>{copiedImage ? '¡Copiado al portapapeles!' : 'Copiar Imagen'}</span>
                </button>

                <button
                  onClick={handleDownloadFromPreview}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Imagen PNG (2K)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
