import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
// FIX: Replaced 'Hospital' with 'Building2' and 'HeartPulse' with 'Activity' to prevent import errors
import { 
  MapPin, Navigation, Siren, Signal, Building2, Activity, 
  ArrowRight, ShieldAlert, CheckCircle, Clock, Power,
  ChevronUp, ChevronDown, Lock, ThumbsUp, Sun, Moon
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, onSnapshot, 
  doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

/* --------------------------------------------------------------------------------
   CONFIGURATION & ASSETS
-------------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* --- ASSETS --- */

// Optimized Ambulance SVG
const AMBULANCE_RAW_SVG = `
<svg width="128px" height="128px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <path d="M47.95 111.51l37.52.05l39.77-16.2s.26-12.59-.51-25.62c-.77-13.03-4.38-32.84-4.38-32.84s.22-3.62-.22-5.58c-.42-1.86-1.54-3.37-4.65-3.55c-2.85-.17-67.12 0-68.87.22s-12.3 12.97-12.3 12.97S19.43 65.58 19 66.13c-.44.55-10.16 7.1-11.71 9.09C5.67 77.3 5.78 79 5.78 79l.06 16.83l42.11 15.68z" fill="#e1e1e1"></path>
  <path d="M125.25 95.35s-21.72-.2-26.21.74s-7.51 3.62-10.05 7.71c-2.55 4.09-3.55 7.78-3.55 7.78s35.46-.07 36.66 0s2.82-1.81 2.95-4.36c.14-2.55.2-11.87.2-11.87z" fill="#516c73"></path>
  <path d="M47.97 111.5s-3.08-7.37-6.3-10.66s-7.91-5.5-13.54-5.7c-5.63-.2-22.27-.33-22.27-.33s-3.74 3.08-4.01 7.43c-.27 4.36 0 8.51 3.49 8.78s42.63.48 42.63.48z" fill="#516c73"></path>
  <path d="M15.48 112.45c.08 4.73 3.85 11.55 12.07 11.6s12.48-6.24 12.22-12.69c-.26-6.56-5.36-11.18-12.69-10.98c-6.87.2-11.71 5.52-11.6 12.07z" fill="#4e433d"></path>
  <path d="M21.35 112.17c.04 2.5 2.02 6.09 6.34 6.12c4.32.03 6.42-3.1 6.28-6.5c-.14-3.46-2.9-6.03-6.53-5.98c-3.6.05-6.14 2.91-6.09 6.36z" fill="#c8c8c8"></path>
  <path d="M93.93 111.89c.08 4.73 3.85 11.55 12.07 11.6s12.48-6.24 12.22-12.69c-.26-6.56-5.36-11.18-12.69-10.98c-6.86.19-11.7 5.51-11.6 12.07z" fill="#4e433d"></path>
  <path d="M99.81 111.61c.04 2.5 2.02 6.09 6.34 6.12c4.32.03 6.42-3.1 6.28-6.5c-.14-3.46-2.9-6.03-6.53-5.98c-3.6.05-6.15 2.9-6.09 6.36z" fill="#c8c8c8"></path>
  <path d="M5.82 90.86l119.47.47s.02-2.12.02-4.92c0-2.76-.1-4.83-.1-4.83L5.74 81.55l.08 9.31z" fill="#d70617"></path>
  <path d="M5.76 78.97s12.17-.05 12.83-.05s1.18.51 1.18 1.38c0 .87.36 4.09-2.25 6.49c-1.12 1.03-3.54 1.25-5.83 1.28c-3.43.04-5.62.06-5.9.06c0 0-.15-6.81-.13-7.64c.04-.97.1-1.52.1-1.52z" fill="#ffe365"></path>
  <path d="M34.05 41.4l87.09-.02l-.35-2.26c-.2-1.29-.43-2.21-.43-2.21L46.53 37l.09-9.02s-1.79-.21-2.73.67c-1.33 1.25-3.72 3.76-6.03 6.79c-1.81 2.37-3.81 5.96-3.81 5.96z" fill="#c9c9c9"></path>
  <path d="M37.32 31.86c-2.3 2.57-1.65 6.79-1.65 6.79s7.48.24 7.74-.18c.26-.41.15-9.46.15-9.46s-3.13-.64-6.24 2.85z" fill="#fa2b23"></path>
  <path d="M46.62 28.01c.41-.05 23.78-.2 23.78-.2s0-4.01-.04-5.46c-.05-1.97-1.61-3.47-4.45-3.57c-1.99-.07-13.31-.16-15.12-.05c-1.81.1-3.88 1.61-3.99 3.88s-.18 5.4-.18 5.4z" fill="#dd0f26"></path>
  <path d="M55.42 23.2l1.32 2.88l-3.16-.05s-2.43-2.33-2.43-2.85s2.69-2.54 2.69-2.54l3.33-.04l-1.75 2.6z" fill="#ff5b5e"></path>
  <path d="M61.07 23.26l-1.17 2.9l2.63-.02s2.7-2.32 2.73-2.77c.04-.65-2.71-2.76-2.71-2.76l-2.95-.01l1.47 2.66z" fill="#ff5b5e"></path>
  <path d="M90.78 44.69c-.21 1.68-.35 16.27-.35 16.27l.07 14.94l7.47-.14l.42-15.29l-.28-15.64l-7.33-.14z" fill="#1e86fe"></path>
  <path fill="#1e86fe" d="M79.77 65.24l12.56-8.59l12.99-8.24l4.05 6l-12.85 8.94l-12.98 8.03z"></path>
  <path fill="#1e86fe" d="M83.12 48.69l-3.91 5.86l12.42 9.15l12.85 7.96l4.12-5.87l-12.99-9.14z"></path>
  <path d="M38.09 45.76c-1.39.13-2.72.56-3.77 2.16c-1.05 1.61-10.12 18.01-11.03 19.55c-.49.83-1.07 2.12-.85 3.13c.19.85 1.07 1.49 2.03 1.55c2.09.14 28.76-.07 30.23-.07c1.47 0 2.72-1.26 2.79-3.49s.18-18.44 0-20.18c-.21-2.02-1.54-2.65-3.21-2.72c-1.54-.07-14.73-.07-16.19.07z" fill="#557077"></path>
  <path d="M39.7 50.04c-1.37.02-2.43.47-3.48 2.22c-.61 1.02-7.89 14.24-8.1 14.87c-.21.63.28 1.19 1.33 1.19s21.22-.14 22.48-.14c1.26 0 1.89-.91 1.95-2.79c.07-1.89 0-12.36 0-13.47s-.56-1.89-2.02-1.89c-1.46-.01-10.9-.02-12.16.01z" fill="#afe3fb"></path>
</svg>`;
const AMBULANCE_ICON_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(AMBULANCE_RAW_SVG)}`;

const TRAFFIC_LIGHT_SVG = `
<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#111827" stroke="#22c55e" stroke-width="2"/>
  <circle cx="12" cy="12" r="6" fill="#22c55e">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
  </circle>
</svg>`;
const TRAFFIC_LIGHT_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(TRAFFIC_LIGHT_SVG)}`;

const MAP_STYLES_DARK = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

const AmbulanceDriverApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(false); 
  const [appState, setAppState] = useState('STANDBY'); 
  const [missionData, setMissionData] = useState(null);
  const [user, setUser] = useState(null);
  const [initialDriverLoc, setInitialDriverLoc] = useState({ lat: 12.9716, lng: 77.5946 });
  const [hasArrived, setHasArrived] = useState(false); 
  const [tripsCount, setTripsCount] = useState(5); 
  const [showSuccess, setShowSuccess] = useState(false); 

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Auth Error:", error));

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const APP_ID = 'etaforge-live-main';
        const q = collection(db, 'artifacts', APP_ID, 'public', 'data', 'emergency_alerts');
        
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const incomingAlerts = allDocs.filter(d => {
              const status = d.status ? d.status.toUpperCase() : '';
              return (status === 'ACTIVE' || status === 'PENDING');
            });

            const myActiveMission = allDocs.find(d => 
              d.status === 'ACCEPTED' && (d.driverId === currentUser.uid || missionData?.id === d.id)
            );

            if (myActiveMission) {
              setAppState('ACTIVE');
              setMissionData(mapFirestoreData(myActiveMission));
            } 
            else if (incomingAlerts.length > 0) {
              const latestRequest = incomingAlerts.sort((a,b) => {
                  const getTime = (t) => t?.seconds || new Date(t).getTime() || 0;
                  return getTime(a.timestamp) - getTime(b.timestamp);
              }).pop();
              
              const formattedData = mapFirestoreData(latestRequest);
              
              if (appState !== 'ACTIVE' && isOnline) {
                 const offsetLat = (Math.random() - 0.5) * 0.03; 
                 const offsetLng = (Math.random() - 0.5) * 0.03;
                 const newDriverLoc = {
                     lat: formattedData.location.lat + offsetLat,
                     lng: formattedData.location.lng + offsetLng
                 };
                 setInitialDriverLoc(newDriverLoc);
                 setMissionData(formattedData);
                 setAppState('ALERT');
              }
            }
          }
        });
        return () => unsubscribeFirestore();
      }
    });
    return () => unsubscribeAuth();
  }, [appState, isOnline]); 

  const mapFirestoreData = (docData) => {
    let hospitalData = { name: "Nearest Hospital", lat: null, lng: null };
    if (typeof docData.nearestHospital === 'string') {
        hospitalData.name = docData.nearestHospital;
    } else if (docData.hospital) {
        hospitalData = docData.hospital;
    }
    return {
      id: docData.id, ...docData,
      location: {
          lat: docData.location?.lat || 12.9716, lng: docData.location?.lng || 77.5946,
          address: docData.address || "Location Shared"
      },
      user: docData.user || { name: "Emergency Caller", phone: docData.userId || "Unknown", bpm: "142", bloodType: "O+" },
      hospital: hospitalData
    };
  };

  const acceptMission = async () => {
    if (!missionData?.id) return;
    setAppState('ACTIVE'); 
    setHasArrived(false); 
    try {
      const APP_ID = 'etaforge-live-main';
      const missionRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'emergency_alerts', missionData.id);
      await updateDoc(missionRef, {
        status: "ACCEPTED", 
        driverId: user?.uid || "anon_driver",
        acceptedAt: serverTimestamp()
      });
    } catch (e) { console.error("Error updating mission:", e); }
  };

  const rejectMission = async () => {
    if (!missionData?.id) return;
    try {
      const APP_ID = 'etaforge-live-main';
      const missionRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'emergency_alerts', missionData.id);
      await updateDoc(missionRef, {
        status: "REJECTED", 
        rejectedBy: user?.uid || "anon_driver",
        rejectedAt: serverTimestamp()
      });
    } catch (e) { console.error("Error rejecting mission:", e); }
    // Return to standby
    setAppState('STANDBY');
    setMissionData(null);
  };

  const completeMission = async () => {
      if (missionData?.id) {
          try {
              const APP_ID = 'etaforge-live-main';
              const missionRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'emergency_alerts', missionData.id);
              await updateDoc(missionRef, { status: "COMPLETED", completedAt: serverTimestamp() });
          } catch(e) { console.error("Completion update failed", e); }
      }
      setShowSuccess(true);
      setTimeout(() => {
          setTripsCount(prev => prev + 1);
          setAppState('STANDBY');
          setMissionData(null);
          setHasArrived(false);
          setShowSuccess(false);
      }, 3000);
  };

  const handleArrival = useCallback(() => {
      setHasArrived(true);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleOnline = () => setIsOnline(!isOnline);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-900'} font-sans transition-colors duration-500`}>
      <MemoizedGoogleMapLayer 
        isDarkMode={isDarkMode} 
        appState={appState} 
        initialDriverLoc={initialDriverLoc}
        missionId={missionData?.id}
        targetLocation={missionData?.location}
        hospitalLocation={missionData?.hospital}
        onArrival={handleArrival}
      />
      <TopBar isDarkMode={isDarkMode} appState={appState} toggleTheme={toggleTheme} />
      <AnimatePresence>
        {appState === 'STANDBY' && (
          <StandbyDock 
            key="standby" 
            isDarkMode={isDarkMode} 
            tripsCount={tripsCount} 
            isOnline={isOnline}
            toggleOnline={toggleOnline}
          />
        )}
        {appState === 'ALERT' && missionData && (
          <IncomingAlertModal key="alert" data={missionData} onAccept={acceptMission} onReject={rejectMission} />
        )}
        {appState === 'ACTIVE' && missionData && (
          <CollapsibleActiveDock 
            key="active" 
            data={missionData} 
            isDarkMode={isDarkMode} 
            hasArrived={hasArrived}
            onComplete={completeMission}
          />
        )}
        {showSuccess && <SuccessOverlay key="success" />}
      </AnimatePresence>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   GOOGLE MAP LAYER - STANDARD MARKER (NO ROTATION)
--------------------------------------------------------------------------- */
const GoogleMapLayer = ({ isDarkMode, appState, initialDriverLoc, missionId, targetLocation, hospitalLocation, onArrival }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef({ driver: null, patient: null, hospital: null, signals: [] });
  const pathsRef = useRef({ red: null, green: null });
  const animationRef = useRef(null);
  const activeMissionIdRef = useRef(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true; script.defer = true;
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else { setMapReady(true); }
  }, []);

  useEffect(() => {
    if (mapReady && mapRef.current && !googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: initialDriverLoc, 
        zoom: 14, 
        disableDefaultUI: true, 
        styles: isDarkMode ? MAP_STYLES_DARK : [], 
        backgroundColor: isDarkMode ? '#242f3e' : '#e5e3df',
        gestureHandling: 'greedy', 
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
    } else if (googleMapRef.current) {
        googleMapRef.current.setOptions({
            styles: isDarkMode ? MAP_STYLES_DARK : [], 
            backgroundColor: isDarkMode ? '#242f3e' : '#e5e3df',
        });
    }
  }, [mapReady, isDarkMode]);

  // Cleanup on standby
  useEffect(() => {
      if (appState === 'STANDBY' && googleMapRef.current) {
          activeMissionIdRef.current = null;
          if (markersRef.current.driver) markersRef.current.driver.setMap(null);
          if (markersRef.current.patient) markersRef.current.patient.setMap(null);
          if (markersRef.current.hospital) markersRef.current.hospital.setMap(null);
          markersRef.current.signals.forEach(m => m.setMap(null));
          markersRef.current.signals = [];
          if (pathsRef.current.red) pathsRef.current.red.setMap(null);
          if (pathsRef.current.green) pathsRef.current.green.setMap(null);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
  }, [appState]);

  useEffect(() => {
    if (appState === 'ACTIVE' && mapReady && targetLocation && googleMapRef.current && missionId) {
        
        if (activeMissionIdRef.current === missionId) return; 
        activeMissionIdRef.current = missionId;

        const map = googleMapRef.current;
        const directionsService = new window.google.maps.DirectionsService();
        const placesService = new window.google.maps.places.PlacesService(map);

        // CLEANUP
        if (markersRef.current.driver) markersRef.current.driver.setMap(null);
        if (markersRef.current.patient) markersRef.current.patient.setMap(null);
        if (markersRef.current.hospital) markersRef.current.hospital.setMap(null);
        markersRef.current.signals.forEach(m => m.setMap(null));
        markersRef.current.signals = [];
        if (pathsRef.current.red) pathsRef.current.red.setMap(null);
        if (pathsRef.current.green) pathsRef.current.green.setMap(null);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        // --- MARKERS (STANDARD GOOGLE MAPS MARKER - NO ROTATION) ---
        markersRef.current.driver = new window.google.maps.Marker({
            position: initialDriverLoc, map, title: "Ambulance", zIndex: 999,
            icon: { url: AMBULANCE_ICON_URL, scaledSize: new window.google.maps.Size(45, 45), anchor: new window.google.maps.Point(22.5, 22.5) }
        });

        markersRef.current.patient = new window.google.maps.Marker({
            position: targetLocation, map, title: "Patient",
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#ef4444", fillOpacity: 1, strokeWeight: 4, strokeColor: "#ffffff" }
        });

        const addSignalsToPath = (points) => {
            const distanceBetweenSignals = 30; 
            points.forEach((point, index) => {
                if (index > 0 && index < points.length - 1 && index % distanceBetweenSignals === 0) {
                     const sig = new window.google.maps.Marker({
                         position: point, map,
                         icon: { url: TRAFFIC_LIGHT_URL, scaledSize: new window.google.maps.Size(16, 16), anchor: new window.google.maps.Point(8, 8) }
                     });
                     markersRef.current.signals.push(sig);
                }
            });
        };

        const fetchRoute = (origin, destination) => {
            return new Promise((resolve) => {
                directionsService.route({
                    origin, destination, travelMode: window.google.maps.TravelMode.DRIVING
                }, (result, status) => {
                    if (status === 'OK') resolve(result);
                    else resolve(null);
                });
            });
        };

        const resolveHospital = () => {
            return new Promise((resolve) => {
                if (hospitalLocation?.name && !hospitalLocation.lat) {
                     placesService.findPlaceFromQuery({
                        query: hospitalLocation.name, fields: ['geometry'], locationBias: { radius: 5000, center: initialDriverLoc }
                    }, (results, status) => {
                        if (status === 'OK' && results[0]) resolve(results[0].geometry.location);
                        else resolve({ lat: targetLocation.lat + 0.02, lng: targetLocation.lng + 0.02 }); 
                    });
                } else {
                    resolve(hospitalLocation?.lat ? hospitalLocation : { lat: targetLocation.lat + 0.02, lng: targetLocation.lng + 0.02 });
                }
            });
        };

        resolveHospital().then(hospitalLoc => {
            markersRef.current.hospital = new window.google.maps.Marker({
                 position: hospitalLoc, map, title: "Hospital",
                 icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#22c55e", fillOpacity: 1, strokeWeight: 4, strokeColor: "#ffffff" }
            });

            Promise.all([
                fetchRoute(initialDriverLoc, targetLocation),
                fetchRoute(targetLocation, hospitalLoc)
            ]).then(([redResult, greenResult]) => {
                
                let fullPath = [];

                if (redResult) {
                    const overviewPath = redResult.routes[0].overview_path;
                    pathsRef.current.red = new window.google.maps.Polyline({
                        path: overviewPath, map, strokeColor: "#ef4444", strokeOpacity: 1.0, strokeWeight: 5
                    });
                    
                    let detailedRed = [];
                    redResult.routes[0].legs[0].steps.forEach(step => {
                        step.path.forEach(p => detailedRed.push(p));
                    });
                    addSignalsToPath(detailedRed);
                    fullPath.push(...detailedRed);
                }

                // Inject PAUSE at User Location
                if (fullPath.length > 0) {
                    const stopPoint = fullPath[fullPath.length - 1];
                    for(let i=0; i<120; i++) fullPath.push(stopPoint);
                }

                if (greenResult) {
                    const overviewPath = greenResult.routes[0].overview_path;
                    pathsRef.current.green = new window.google.maps.Polyline({
                        path: overviewPath, map, strokeColor: "#22c55e", strokeOpacity: 0.8, strokeWeight: 6
                    });

                    let detailedGreen = [];
                    greenResult.routes[0].legs[0].steps.forEach(step => {
                        step.path.forEach(p => detailedGreen.push(p));
                    });
                    addSignalsToPath(detailedGreen);
                    fullPath.push(...detailedGreen);
                }

                const bounds = new window.google.maps.LatLngBounds();
                fullPath.forEach(p => bounds.extend(p));
                map.fitBounds(bounds, { bottom: 300, top: 100, left: 50, right: 50 });

                let currentIndex = 0;
                let progress = 0; 
                
                // SPEED: 100 km/h
                const speedKmph = 100; 
                const speedMps = (speedKmph * 1000) / 3600; 
                const fps = 60;
                
                const animateDriver = () => {
                    if (currentIndex >= fullPath.length - 1) {
                        if (onArrival) onArrival(); 
                        return; 
                    }

                    const start = fullPath[currentIndex];
                    const end = fullPath[currentIndex + 1];
                    
                    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(start, end);
                    
                    if (distance < 5) { 
                         currentIndex++;
                         progress = 0;
                         animationRef.current = requestAnimationFrame(animateDriver);
                         return;
                    }

                    const metersPerFrame = speedMps / fps;
                    const increment = metersPerFrame / distance;
                    
                    progress += increment;

                    if (progress >= 1) {
                        progress = 0;
                        currentIndex++;
                        if (currentIndex >= fullPath.length - 1) {
                            markersRef.current.driver.setPosition(end);
                            if (onArrival) onArrival(); 
                            return; 
                        }
                    } else {
                        // Standard interpolation (no rotation logic needed)
                        const lat = start.lat() + (end.lat() - start.lat()) * progress;
                        const lng = start.lng() + (end.lng() - start.lng()) * progress;
                        const newPos = new window.google.maps.LatLng(lat, lng);
                        markersRef.current.driver.setPosition(newPos);
                    }
                    
                    animationRef.current = requestAnimationFrame(animateDriver);
                };
                animateDriver();
            });
        });
    }
  }, [appState, mapReady, initialDriverLoc, targetLocation, hospitalLocation, missionId, onArrival]);

  return <div ref={mapRef} className="w-full h-full" />;
};

const MemoizedGoogleMapLayer = memo(GoogleMapLayer);

/* ---------------------------------------------------------------------------
   UI COMPONENTS
--------------------------------------------------------------------------- */
const TopBar = ({ isDarkMode, appState, toggleTheme }) => (
  <div className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
    <div className={`flex justify-between items-center px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-slate-900/80 text-white' : 'bg-white/80 text-slate-900'} pointer-events-auto transition-colors`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${appState === 'ACTIVE' ? 'bg-red-500 animate-pulse' : (isDarkMode ? 'bg-white/10' : 'bg-black/5')}`}>
          <Siren size={24} className={appState === 'ACTIVE' ? "text-white" : (isDarkMode ? "text-white" : "text-slate-800")} />
        </div>
        <div className="flex flex-col">
          {appState === 'ACTIVE' ? (
             <>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">Emergency Active</span>
              <span className="font-bold font-mono text-sm leading-none">PRIORITY 1</span>
             </>
          ) : (
             <>
              <span className="text-xs uppercase tracking-wider opacity-70">Driver ID</span>
              <span className="font-bold font-mono text-sm">Rajesh Kumar (KA-05-EM-2024)</span>
             </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </div>
  </div>
);

const ThemeSwitch = ({ isDarkMode, toggleTheme }) => (
  <>
    <style>{`
      .switch { font-size: 10px; position: relative; display: inline-block; width: 4em; height: 2.2em; border-radius: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #2a2a2a; transition: 0.4s; border-radius: 30px; overflow: hidden; }
      .slider:before { position: absolute; content: ""; height: 1.2em; width: 1.2em; border-radius: 20px; left: 0.5em; bottom: 0.5em; transition: 0.4s; transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5); box-shadow: inset 8px -4px 0px 0px #fff; }
      .switch input:checked + .slider { background-color: #00a6ff; }
      .switch input:checked + .slider:before { transform: translateX(1.8em); box-shadow: inset 15px -4px 0px 15px #ffcf48; }
      .star { background-color: #fff; border-radius: 50%; position: absolute; width: 5px; transition: all 0.4s; height: 5px; }
      .star_1 { left: 2.5em; top: 0.5em; }
      .star_2 { left: 2.2em; top: 1.2em; }
      .star_3 { left: 3em; top: 0.9em; }
      .switch input:checked ~ .slider .star { opacity: 0; }
      .cloud { width: 3.5em; position: absolute; bottom: -1.4em; left: -1.1em; opacity: 0; transition: all 0.4s; }
      .switch input:checked ~ .slider .cloud { opacity: 1; }
    `}</style>
    <label className="switch">
      <input type="checkbox" checked={!isDarkMode} onChange={toggleTheme} />
      <span className="slider">
        <div className="star star_1"></div>
        <div className="star star_2"></div>
        <div className="star star_3"></div>
        <svg viewBox="0 0 16 16" className="cloud_1 cloud">
          <path transform="matrix(.77976 0 0 .78395-299.99-418.63)" fill="#fff" d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925" />
        </svg>
      </span>
    </label>
  </>
);

/* NEW POWER SWITCH COMPONENT */
const PowerSwitch = ({ isOnline, toggleOnline }) => (
  <>
    <style>{`
      /* The switch - the box around the slider */
      .power-switch { font-size: 12px; position: relative; display: inline-block; width: 3.5em; height: 2em; animation: subtle__float 3s infinite; cursor: pointer; }
      
      /* Switch Glow Background */
      .power-switch::before { content: ""; position: absolute; width: 100%; height: 100%; left: 0; top: 0; filter: blur(20px); z-index: -1; border-radius: 50px; background-color: ${isOnline ? '#008000' : '#B22222'}; transition: 0.4s; opacity: 0.6; }
      
      .power-switch input { opacity: 0; width: 0; height: 0; }
      
      /* The slider */
      .power-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${isOnline ? '#008000' : '#B22222'}; transition: .4s; border-radius: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
      
      .power-slider:before { position: absolute; content: "⏻"; height: 1.4em; width: 1.4em; left: 0.3em; bottom: 0.3em; transition: .4s; border-radius: 50%; box-shadow: rgba(0, 0, 0, 0.17) 0px -10px 10px 0px inset, rgba(0, 0, 0, 0.09) 0px -1px 15px -8px; background-color: #000000; color: #FFFFFF; text-align: center; line-height: 1.4em; }
      
      .power-input:checked + .power-slider:before { transform: translateX(1.5em); }
      
      @keyframes subtle__float { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(0px); } }
    `}</style>
    <label className="power-switch">
      <input className="power-input" type="checkbox" checked={isOnline} onChange={toggleOnline} />
      <span className="power-slider" />
    </label>
  </>
);

const StandbyDock = ({ isDarkMode, tripsCount, isOnline, toggleOnline }) => (
  <motion.div 
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className={`absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl border-t border-white/10 backdrop-blur-2xl shadow-2xl p-6 pb-10 ${isDarkMode ? 'bg-slate-950/90 text-white' : 'bg-white/90 text-slate-900'}`}
  >
    <div className="w-12 h-1.5 bg-slate-500/30 rounded-full mx-auto mb-6"></div>
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-4">
        {isOnline && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500 blur-xl"
          />
        )}
        <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-inner transition-colors duration-500 ${isOnline ? 'border-green-500 bg-slate-900' : 'border-red-500 bg-slate-900'}`}>
          <Siren size={40} className={`transition-colors duration-500 ${isOnline ? 'text-green-400' : 'text-red-500'}`} />
        </div>
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Status: {isOnline ? 'Online' : 'Offline'}</h2>
      <p className="text-sm opacity-60 mt-1">{isOnline ? 'Scanning for alerts...' : 'Go online to receive jobs'}</p>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
       <div className={`col-span-2 flex items-center justify-between p-4 rounded-xl border border-white/5 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
          <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px] transition-colors duration-500 ${isOnline ? 'bg-green-500 shadow-green-500' : 'bg-red-500 shadow-red-500'}`} />
             <div>
                <p className="text-sm font-bold">You are {isOnline ? 'Online' : 'Offline'}</p>
                <p className="text-xs opacity-50">{isOnline ? 'Receiving alerts' : 'Paused'}</p>
             </div>
          </div>
          <PowerSwitch isOnline={isOnline} toggleOnline={toggleOnline} />
       </div>
       <StatBox label="Current Shift" value="4h 20m" icon={<Clock size={14} className="text-blue-400" />} isDark={isDarkMode} />
       <StatBox label="Trips Today" value={tripsCount} icon={<Navigation size={14} className="text-purple-400" />} isDark={isDarkMode} />
    </div>
  </motion.div>
);

const IncomingAlertModal = ({ data, onAccept, onReject }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative flex flex-col justify-end gap-3 p-4 rounded-lg w-[300px] h-[450px] cursor-pointer group"
        style={{ background: 'linear-gradient(-45deg, #161616 0%, #000000 100%)', color: 'rgba(129, 129, 129, 0.267)' }}
      >
        <div 
          className="absolute inset-0 m-auto w-full h-[460px] rounded-[10px] -z-10 transition-all duration-700 ease-[cubic-bezier(0.175,0.95,0.9,1.275)] shadow-[0px_20px_30px_hsla(0,0%,0%,0.521)] group-hover:scale-[1.02] group-hover:shadow-[0px_0px_30px_0px_hsla(0,100%,50%,0.356)]"
          style={{ background: 'linear-gradient(-45deg, #ff0000 0%, #d80000 40%)' }}
        />
        <div 
          className="absolute inset-0 z-[-1] w-[260px] h-[400px] m-auto transition-all duration-200 ease-[cubic-bezier(0.175,0.285,0.82,1.275)]"
          style={{ background: 'linear-gradient(-45deg, #fc0000 0%, #f00000 100%)', transform: 'scale(0.45)' }}
        />
        <div className="z-10 flex flex-col h-full justify-between pt-4">
            <div>
               <p className="text-xl font-black capitalize text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Emergency Alert</p>
               <div className="text-sm font-bold text-red-500 uppercase tracking-widest mt-1">Priority: High</div>
            </div>
            <div className="space-y-4 mb-4">
               <div><p className="text-[18px] text-white font-bold leading-tight">{data.user.name}</p><p className="text-sm text-gray-400">Patient</p></div>
               <div><p className="text-[18px] text-white font-bold leading-tight">{data.hospital.name}</p><p className="text-sm text-gray-400">Destination</p></div>
               <div className="flex items-start gap-2 bg-black/40 p-2 rounded border border-white/5">
                  <MapPin size={14} className="text-red-500 mt-1 flex-shrink-0" /><p className="text-xs text-gray-300 line-clamp-2">{data.location.address}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={onReject} 
                  className="py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                  <ShieldAlert size={18} />
                  Reject
               </button>
               <button 
                  onClick={onAccept} 
                  className="py-3 bg-green-600 text-white font-black uppercase tracking-widest rounded shadow-lg hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                  <CheckCircle size={18} />
                  Accept
               </button>
            </div>
            <div className="flex justify-between items-end mt-2"><p className="text-xs opacity-50 text-white">ETAForge Network</p><p className="text-sm font-black text-[#fa0000]">LIVE</p></div>
        </div>
      </div>
    </div>
);

const SuccessOverlay = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-500/90 backdrop-blur-md text-white"
    >
        <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl"
        >
            <CheckCircle size={64} className="text-green-500" strokeWidth={3} />
        </motion.div>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Ride Complete</h2>
        <p className="text-lg opacity-90">Returning to standby...</p>
    </motion.div>
);

const CollapsibleActiveDock = ({ data, isDarkMode, hasArrived, onComplete }) => {
  const [isOpen, setIsOpen] = useState(true);
  const sliderConstraintsRef = useRef(null); 
  
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 150, 300], ["#ef4444", "#eab308", "#22c55e"]);

  useEffect(() => {
      if (!hasArrived) x.set(0);
  }, [hasArrived, x]);

  const handleDragEnd = () => {
      const containerWidth = sliderConstraintsRef.current?.offsetWidth || 300;
      const handleWidth = 56;
      const dragDistance = containerWidth - handleWidth;
      
      if (x.get() > (dragDistance * 0.85) && hasArrived) {
          onComplete();
      } else {
          x.set(0);
      }
  };

  return (
    <motion.div 
      initial={{ y: 300 }} 
      animate={{ y: isOpen ? 0 : 220 }} 
      className={`absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl border-t border-white/10 backdrop-blur-xl shadow-2xl ${isDarkMode ? 'bg-slate-900/95 text-white' : 'bg-white/95 text-slate-900'} transition-all duration-300`}
    >
      <div onClick={() => setIsOpen(!isOpen)} className="w-full h-8 flex items-center justify-center cursor-pointer hover:bg-white/5 rounded-t-3xl">
        <div className="w-12 h-1.5 bg-slate-500/30 rounded-full" />
      </div>
      <div className="px-6 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-red-500/20 text-red-500"><Navigation size={24} /></div>
          <div><p className="text-xs opacity-60 uppercase font-bold">Current Objective</p><h3 className="text-xl font-bold leading-tight">Pickup {data.user.name}</h3></div>
        </div>
        <div className="text-right">
           <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-white/10">{isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}</button>
        </div>
      </div>
      <div className={`p-6 grid gap-4 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex gap-4">
          <div className={`flex-1 p-3 rounded-xl border border-white/5 flex items-center gap-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
            <Activity className="text-red-500" size={24} /><div><p className="text-xs opacity-50">Heart Rate</p><p className="font-bold font-mono">{data.user.bpm} BPM</p></div>
          </div>
          <div className={`flex-1 p-3 rounded-xl border border-white/5 flex items-center gap-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-xs font-bold text-white">{data.user.bloodType}</div>
            <div><p className="text-xs opacity-50">Blood Type</p><p className="font-bold">Required</p></div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border border-l-4 border-l-green-500 border-white/5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-1"><Building2 size={16} className="text-green-500" /><span className="text-xs font-bold uppercase text-green-500">Green Corridor Destination</span></div>
          <p className="font-bold truncate">{data.hospital.name}</p>
        </div>
        
        {/* --- DYNAMIC SLIDE TO COMPLETE BUTTON --- */}
        <div 
            ref={sliderConstraintsRef} 
            className={`relative h-16 rounded-full border border-white/10 overflow-hidden flex items-center px-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}
        >
            <motion.div 
                className="absolute inset-0 z-0" 
                style={{ background, opacity: hasArrived ? 0.3 : 0.1 }} 
            />
            
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <span className={`text-sm font-bold uppercase tracking-widest ${hasArrived ? 'animate-pulse opacity-100 text-green-500' : 'opacity-40'}`}>
                    {hasArrived ? "Slide to Complete" : "En Route..."}
                </span>
            </div>

            <motion.div
                drag={hasArrived ? "x" : false}
                dragConstraints={sliderConstraintsRef}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`relative w-14 h-14 rounded-full shadow-lg z-10 flex items-center justify-center cursor-grab active:cursor-grabbing ${hasArrived ? 'bg-white' : 'bg-gray-500'}`}
            >
                {hasArrived ? <ArrowRight size={24} className="text-black" /> : <Lock size={20} className="text-white" />}
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const StatBox = ({ label, value, icon, isDark }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
    <div className="mb-2 opacity-80">{icon}</div><span className="text-xl font-bold font-mono">{value}</span><span className="text-[10px] uppercase tracking-wider opacity-50 mt-1">{label}</span>
  </div>
);

export default AmbulanceDriverApp;
