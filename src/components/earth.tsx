"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

const AnimatedEarth = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<
    {
      marker: THREE.Mesh;
      ring: THREE.Mesh;
      location: { lat: number; lon: number };
    }[]
  >([]);
  const linesRef = useRef<THREE.Line[]>([]);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textureLoaded, setTextureLoaded] = useState(false);

  // Famous locations with their coordinates
  const locations: { name: string; lat: number; lon: number; color: number }[] = [
    { name: "New York", lat: 40.7128, lon: -74.006, color: 0xff4444 },
    { name: "London", lat: 51.5074, lon: -0.1278, color: 0x44ff44 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503, color: 0x4444ff },
    { name: "Sydney", lat: -33.8688, lon: 151.2093, color: 0xffff44 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777, color: 0xff44ff },
    { name: "São Paulo", lat: -23.5505, lon: -46.6333, color: 0x44ffff },
    { name: "Cairo", lat: 30.0444, lon: 31.2357, color: 0xff8844 },
  ];

  // Convert lat/lon to 3D coordinates
  const latLonToVector3 = (lat: number, lon: number, radius = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  // Create connection lines between locations
  const createConnectionLine = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: number
  ) => {
    const curve = new THREE.CatmullRomCurve3(
      [
        start,
        new THREE.Vector3().copy(start).lerp(end, 0.5).multiplyScalar(1.5),
        end,
      ],
      false
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      linewidth: 1,
    });

    return new THREE.Line(geometry, material);
  };

  // Update connection lines
  const updateConnectionLines = useCallback((currentIndex: number) => {
    // Remove existing lines
    linesRef.current.forEach((line) => {
      sceneRef?.current?.remove(line);
    });
    linesRef.current = [];

    // Create new connection lines
    const nextIndex = (currentIndex + 1) % locations.length;
    const startPos = latLonToVector3(
      locations[currentIndex].lat,
      locations[currentIndex].lon,
      1.02
    );
    const endPos = latLonToVector3(
      locations[nextIndex].lat,
      locations[nextIndex].lon,
      1.02
    );

    // Create line with gradient color
    const line = createConnectionLine(
      startPos,
      endPos,
      locations[currentIndex].color
    );

    sceneRef?.current?.add(line);
    linesRef.current.push(line);
  }, [locations]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011, 1);
    mountRef.current.appendChild(renderer.domElement);

    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Load realistic Earth texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
      (texture: THREE.Texture) => {
        const earthMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          specular: new THREE.Color(0x333333),
          shininess: 5,
        });

        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);
        earthRef.current = earth;
        setTextureLoaded(true);
      }
    );

    // Atmosphere effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 1,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Add stars background - create a sphere of stars around the Earth
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    // Create stars in a spherical distribution around the Earth
    for (let i = 0; i < 10000; i++) {
      // Use spherical coordinates for even distribution
      const radius = 10 + Math.random() * 1900; // Stars from 10 to 1910 units from center
      const theta = Math.random() * Math.PI * 2; // Random angle around
      const phi = Math.acos(2 * Math.random() - 1); // Random elevation for spherical distribution

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const createRoundPointTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;

      const context = canvas.getContext("2d");
      if (!context) return null;

      // Create gradient for soft edges
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.8)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(16, 16, 16, 0, Math.PI * 2);
      context.fill();

      return new THREE.CanvasTexture(canvas);
    };
    const pointTexture = createRoundPointTexture();

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      sizeAttenuation: true, // Enable size attenuation for proper perspective
      transparent: true,
      alphaMap: pointTexture, // Use the rounded texture
      alphaTest: 0.1, // Prevent transparent parts from rendering
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create twinkling stars with solid yellow fill and border
    const twinklingStars: THREE.Group[] = [];

    // Create 120 yellow stars that will blink
    for (let i = 0; i < 120; i++) {
      // Position stars in a spherical distribution around Earth
      const radius = 3 + Math.random() * 3; // Stars between 3 and 6 units from center
      const theta = Math.random() * Math.PI * 2; // Random angle around
      const phi = Math.acos(2 * Math.random() - 1); // Random elevation for spherical distribution

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      // Create a group for each star
      const starGroup = new THREE.Group();
      starGroup.position.set(x, y, z);

      // Create star shape for the solid fill
      const starShape = new THREE.Shape();
      const outerRadius = 0.08;
      const innerRadius = 0.03;
      const spikes = 5;
      const angle = (2 * Math.PI) / spikes;

      for (let j = 0; j < spikes * 2; j++) {
        const currentRadius = j % 2 === 0 ? outerRadius : innerRadius;
        const currentAngle = j * angle;
        const x = currentRadius * Math.cos(currentAngle);
        const y = currentRadius * Math.sin(currentAngle);

        if (j === 0) {
          starShape.moveTo(x, y);
        } else {
          starShape.lineTo(x, y);
        }
      }
      starShape.closePath();

      // Create solid yellow fill
      const fillGeometry = new THREE.ShapeGeometry(starShape);
      const fillMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: false,
        opacity: 1,
        side: THREE.DoubleSide,
      });
      const starFill = new THREE.Mesh(fillGeometry, fillMaterial);
      starGroup.add(starFill);

      // Create yellow border/outline
      const outlineGeometry = new THREE.EdgesGeometry(fillGeometry);
      const outlineMaterial = new THREE.LineBasicMaterial({
        color: 0xffcc00, // Slightly darker yellow for border
        linewidth: 1,
        transparent: true,
        opacity: 0.9,
      });
      const starOutline = new THREE.LineSegments(
        outlineGeometry,
        outlineMaterial
      );
      starGroup.add(starOutline);

      // Random rotation
      starGroup.rotation.z = Math.random() * Math.PI * 2;

      scene.add(starGroup);
      twinklingStars.push(starGroup);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create location markers
    const markers: {
      marker: THREE.Mesh;
      ring: THREE.Mesh;
      location: { lat: number; lon: number };
    }[] = [];
    locations.forEach((location) => {
      const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: location.color,
        transparent: true,
        opacity: 0,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      const position = latLonToVector3(location.lat, location.lon, 1.02);
      marker.position.copy(position);

      // Add pulsing ring
      const ringGeometry = new THREE.RingGeometry(0.03, 0.05, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: location.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(position);
      ring.lookAt(new THREE.Vector3(0, 0, 0));

      scene.add(marker);
      scene.add(ring);

      markers.push({ marker, ring, location });
    });

    // Camera position
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    markersRef.current = markers;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate earth slowly
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.002;
      }
      atmosphere.rotation.y += 0.002;

      // Animate markers
      markers.forEach((item: any, index: number) => {
        const time = Date.now() * 0.005;

        if (index === currentLocation) {
          // Current location: bright and pulsing
          item.marker.material.opacity = 0.9;
          item.ring.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
          item.ring.scale.setScalar(1 + Math.sin(time * 2) * 0.3);
        } else {
          // Other locations: dim
          item.marker.material.opacity = 0.3;
          item.ring.material.opacity = 0.1;
          item.ring.scale.setScalar(1);
        }
      });

      // Animate connection lines
      linesRef.current.forEach((line) => {
        (line.material as THREE.LineBasicMaterial).opacity =
          0.3 + Math.sin(Date.now() * 0.005) * 0.2;
      });

      // Animate twinkling stars - make them blink
      const time = Date.now() * 0.003;
      twinklingStars.forEach((starGroup, index) => {
        // Each star has its own phase for random blinking
        const phase = index * 0.1;
        const blink = Math.sin(time + phase) * 0.5 + 0.5; // Value between 0 and 1

        // Get the fill and outline elements
        const starFill = starGroup.children[0] as THREE.Mesh;
        const starOutline = starGroup.children[1] as THREE.LineSegments;

        // Change opacity for blinking effect
        (starFill.material as THREE.MeshBasicMaterial).opacity =
          0.4 + blink * 0.6;
        (starOutline.material as THREE.LineBasicMaterial).opacity =
          0.4 + blink * 0.6;

        // Slightly change scale for pulsing effect
        const scale = 0.8 + blink * 0.4;
        starGroup.scale.set(scale, scale, scale);

        // Make the star always face the camera
        starGroup.lookAt(camera.position);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Auto-advance locations
    const interval = setInterval(() => {
      if (!isAnimating) {
        setCurrentLocation((prev) => (prev + 1) % locations.length);
      }
    }, 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update connection lines when location changes
  useEffect(() => {
    if (sceneRef.current && markersRef.current.length) {
      updateConnectionLines(currentLocation);
    }
  }, [currentLocation, textureLoaded]);

  // Animate camera to focus on current location
  useEffect(() => {
    if (!earthRef.current || !markersRef.current.length || !cameraRef.current)
      return;

    setIsAnimating(true);
    const currentMarker = markersRef.current[currentLocation];
    const targetPosition = currentMarker.location;

    // Calculate camera position to focus on the location
    const targetVector = latLonToVector3(
      targetPosition.lat,
      targetPosition.lon,
      2.5
    );
    const camera = cameraRef.current;

    // Animate camera position
    const startPos = camera.position.clone();
    const endPos = targetVector;
    let progress = 0;

    const animateCamera = () => {
      progress += 0.02;

      if (progress >= 1) {
        camera.position.copy(endPos);
        camera.lookAt(0, 0, 0);
        setIsAnimating(false);
        return;
      }

      camera.position.lerpVectors(startPos, endPos, progress);
      camera.lookAt(0, 0, 0);
      requestAnimationFrame(animateCamera);
    };

    animateCamera();
  }, [currentLocation]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-900 to-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />

      {/* Loading indicator */}
      {!textureLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="text-white text-xl">Loading Earth texture...</div>
        </div>
      )}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-black bg-opacity-50  backdrop-blur-md rounded-lg p-4 text-white">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Make Your Payment <span className="text-purple-400">Faster</span> At
            Any{" "}
            <span className="text-purple-400">
              Location{" "}
              <span className="text-green-400">
                ({locations[currentLocation].name})
              </span>
            </span>
          </h2>
        </div>
      </div>
      {/* UI Overlay */}
      {/* <div className="absolute top-6 left-6 z-10">
        <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white">
          <h2 className="text-xl font-bold mb-2">Global Locations</h2>
          <div className="space-y-2">
            {locations.map((location, index) => (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-all ${
                  index === currentLocation ? 'bg-white bg-opacity-20 scale-105' : 'hover:bg-white hover:bg-opacity-10'
                }`}
                onClick={() => setCurrentLocation(index)}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `#${location.color.toString(16).padStart(6, '0')}` }}
                />
                <span className={`${index === currentLocation ? 'font-semibold' : ''}`}>
                  {location.name}
                </span>
                {index === currentLocation && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Current Location Info */}
      {/* <div className="absolute bottom-6 right-6 z-10">
        <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold">Now Viewing</h3>
          <p className="text-2xl font-bold text-cyan-400">{locations[currentLocation].name}</p>
          <p className="text-sm opacity-70">
            {locations[currentLocation].lat.toFixed(2)}°, {locations[currentLocation].lon.toFixed(2)}°
          </p>
        </div>
      </div> */}

      {/* Controls */}
      {/* <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-lg p-3">
          <p className="text-white text-sm opacity-70 mb-2">Click any location to focus</p>
          <div className="text-white text-xs opacity-50">
            Auto-advancing every 2 seconds
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default AnimatedEarth;
