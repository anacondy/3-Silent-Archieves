import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc, ArrowLeft, Maximize2, Ghost, Terminal, Cpu, Clock, User, Shield, X, Snowflake } from 'lucide-react';

/**
 * SILENT ARCHIVE IMMERSIVE EXPERIENCE v3.3 (Atmospheric Frost Fix)
 * -----------------------------------
 * Author: Alvido
 * Origin Date: November 26, 2025
 * Updates:
 * - FIXED: Particle Layering (Particles now appear ON TOP of the dark registry background).
 * - PHYSICS: Slowed down frost particles for a "suspended/hovering" feel.
 * - VISUAL: Added "Fog" drift behavior to particles.
 */

/* --- SOUND ENGINE --- */
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const now = ctx.currentTime;

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'freeze') {
      osc.type = 'sawtooth';
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.linearRampToValueAtTime(100, now + 1.5);
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(400, now + 1.5);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (type === 'scanning') {
       osc.type = 'square';
       osc.frequency.setValueAtTime(60, now);
       gainNode.gain.setValueAtTime(0.03, now);
       gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
       osc.start(now);
       osc.stop(now + 0.1);
    }
  } catch (e) { console.error(e); }
};

/* --- PARTICLE SYSTEM --- */
// Updated to accept custom styling and physics tuning
const ParticleOverlay = ({ mode = 'ash', className = "" }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    const createParticles = () => {
      const particleCount = mode === 'frost' ? 250 : 80; 
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Slower, floatier physics for frost
          vx: mode === 'frost' ? (Math.random() - 0.5) * 0.8 : (Math.random() - 0.5) * 0.5,
          vy: mode === 'frost' ? Math.random() * 0.8 + 0.2 : Math.random() * 0.5 + 0.2, 
          size: mode === 'frost' ? Math.random() * 2 + 0.5 : Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
          color: mode === 'frost' ? '200, 230, 255' : (Math.random() > 0.9 ? '200, 50, 50' : '200, 200, 200')
        });
      }
    };
    createParticles();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; 
        p.y += p.vy; 
        
        // Slight randomization for "hovering" effect
        if (mode === 'frost') {
             p.vx += (Math.random() - 0.5) * 0.02;
             p.vy += (Math.random() - 0.5) * 0.02;
             // Cap speed
             if(p.vx > 1) p.vx = 1; if(p.vx < -1) p.vx = -1;
             if(p.vy > 1.5) p.vy = 1.5; if(p.vy < 0.1) p.vy = 0.1;
        }

        p.alpha += (Math.random() - 0.5) * 0.01;

        if (p.y > canvas.height) p.y = -10;
        if (p.x > canvas.width) p.x = 0; if (p.x < 0) p.x = canvas.width;
        if (p.alpha <= 0) p.alpha = 0.1; if (p.alpha > 0.8) p.alpha = 0.8;

        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        
        // Frost Sparkle
        if (mode === 'frost' && Math.random() > 0.99) { 
            ctx.fillStyle = `rgba(255, 255, 255, 0.6)`; 
            ctx.fillRect(p.x, p.y, 2, 2); 
        }
      });
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', resize); window.cancelAnimationFrame(animationFrameId); };
  }, [mode]);
  
  // Use absolute if inside a container, fixed if global
  return <canvas ref={canvasRef} className={`${className} pointer-events-none mix-blend-screen transition-opacity duration-1000`} />;
};

/* --- DATA MODELS --- */
const ITEMS = [
  { id: 1, title: "Silent Hill 2", subtitle: "Restless Dreams", color: "from-gray-900 to-black", accent: "text-red-500", desc: "In my restless dreams, I see that town. You promised you'd take me there again someday." },
  { id: 2, title: "Resident Evil 4", subtitle: "Biohazard", color: "from-blue-900 to-black", accent: "text-blue-400", desc: "A remote village in Europe. A mission to rescue the President's daughter. The nightmare begins." },
  { id: 3, title: "The Last of Us", subtitle: "Remastered", color: "from-emerald-900 to-black", accent: "text-emerald-500", desc: "Endure and survive. A brutal journey across a post-pandemic United States." },
  { id: 4, title: "Bloodborne", subtitle: "GotY Edition", color: "from-red-950 to-black", accent: "text-red-700", desc: "Fear the old blood. A hunter must hunt in the streets of Yharnam." },
  { id: 5, title: "Control", subtitle: "Ultimate", color: "from-slate-800 to-black", accent: "text-red-500", desc: "The Hiss has invaded the Bureau. Take control." },
  { id: 6, title: "Alan Wake II", subtitle: "Deluxe", color: "from-stone-900 to-black", accent: "text-orange-500", desc: "It's not a loop, it's a spiral. Written into reality." },
];

/* --- INPUT HOOK (ROBUST) --- */
const useChordHold = (targetKeys, duration = 2000, onSuccess) => {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const checkChord = (currentKeys) => targetKeys.every(k => currentKeys.has(k.toLowerCase()));
    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (pressedKeys.has(key)) return;
      pressedKeys.add(key);

      if (checkChord(pressedKeys) && !startTimeRef.current && !completedRef.current) {
        startTimeRef.current = Date.now();
        playSound('scanning');

        const animate = () => {
          if (!startTimeRef.current) return;
          const elapsed = Date.now() - startTimeRef.current;
          const p = Math.min((elapsed / duration) * 100, 100);
          setProgress(p);

          if (elapsed >= duration) {
            completedRef.current = true;
            onSuccess();
            startTimeRef.current = null;
            setProgress(0);
            setTimeout(() => { completedRef.current = false; }, 2000);
          } else {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      pressedKeys.delete(key);
      if (!checkChord(pressedKeys) && startTimeRef.current) {
        startTimeRef.current = null;
        setProgress(0);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [targetKeys, duration, onSuccess]);

  return progress;
};

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (ev) => setMousePosition({ x: ev.clientX, y: ev.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);
  return mousePosition;
};

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const { x, y } = useMousePosition();

  const unlockProgress = useChordHold(['c', 'o', '2'], 2000, () => {
    if (view !== 'registry') {
      playSound('freeze');
      setView('registry');
    }
  });

  const handleEnter = () => { playSound('click'); setView('collection'); };
  const handleHomeClick = () => { playSound('click'); setView('home'); setSelectedItem(null); };
  const handleRegistryClick = () => { playSound('freeze'); setView('registry'); };

  const handleItemClick = (item) => {
    if (isZooming) return;
    playSound('click'); setSelectedItem(item); setIsZooming(true);
    setTimeout(() => { setView('detail'); setIsZooming(false); }, 1200);
  };
  const handleBackToCollection = () => { playSound('click'); setView('collection'); setSelectedItem(null); };
  const closeRegistry = () => { playSound('click'); setView('home'); };

  return (
    <div className="relative min-h-screen bg-black text-gray-200 overflow-hidden font-sans selection:bg-red-900 selection:text-white">
      
      {/* Global Particle Overlay (Hidden when in registry to avoid duplication) */}
      {view !== 'registry' && <ParticleOverlay mode='ash' className="fixed top-0 left-0 w-full h-full" />}

      {/* REPLACED BACKGROUND: Deep Black Noise (No Birds) */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Access Animation */}
      <AnimatePresence>
        {unlockProgress > 0 && view !== 'registry' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0 }}
             className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 pointer-events-none"
           >
              <span className="text-xs font-mono text-red-500 tracking-widest animate-pulse">ACCESSING MAINFRAME</span>
              <div className="w-32 h-1 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-all duration-75 ease-linear"
                  style={{ width: `${unlockProgress}%` }}
                />
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: HOME */}
        {view === 'home' && (
          <motion.div 
            key="home"
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 2 }}
          >
            <div className="absolute inset-0 pointer-events-none mix-blend-soft-light"
              style={{ background: `radial-gradient(circle 300px at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 80%)` }}
            />
            <div className="relative z-20 text-center space-y-8 p-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 2 }} className="tracking-[1em] text-xs text-red-500 uppercase font-bold">
                System Status: Haunted
              </motion.div>
              <motion.h1 
                className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800"
                style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 3, ease: "easeOut" }}
              >
                SILENT ARCHIVE
              </motion.h1>
              <motion.p className="max-w-md mx-auto text-gray-500 italic text-sm md:text-base leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 2 }}>
                "In my restless dreams, I see that collection... You promised you'd take me there again someday."
              </motion.p>
              <motion.button onClick={handleEnter} onMouseEnter={() => playSound('hover')} className="group relative px-8 py-3 mt-12 bg-transparent border border-gray-800 hover:border-red-600 transition-colors duration-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
                <span className="relative z-10 text-xs tracking-[0.3em] group-hover:text-red-500 transition-colors duration-300">ENTER THE FOG</span>
                <div className="absolute inset-0 bg-red-900/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: COLLECTION */}
        {view === 'collection' && (
          <motion.div 
            key="collection"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: isZooming ? 3 : 1, filter: isZooming ? "blur(5px)" : "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 1 } }}
            transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
             <button onClick={handleHomeClick} className="absolute top-8 left-8 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity z-50 cursor-pointer">
                <Ghost className="w-6 h-6 text-red-600 animate-pulse" />
                <span className="tracking-widest text-xs uppercase hover:text-red-500 transition-colors">Collection 03</span>
             </button>

             {/* Registry Button */}
             <button onClick={handleRegistryClick} className="absolute top-8 right-8 flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity z-50 cursor-pointer">
                <span className="tracking-widest text-xs uppercase hover:text-cyan-400 transition-colors font-mono">Registry</span>
             </button>

            <div className="w-full max-w-md perspective-1000">
              <div className={`space-y-[-40px] md:space-y-[-60px] transition-all duration-1000 ${isZooming ? 'opacity-0 translate-y-20' : 'opacity-100'}`}>
                {ITEMS.map((item, index) => (
                  <motion.div
                    key={item.id} layoutId={`card-${item.id}`} onClick={() => handleItemClick(item)} onMouseEnter={() => playSound('hover')}
                    initial={{ opacity: 0, x: -50, rotateX: 40 }} animate={{ opacity: 1, x: 0, rotateX: 25 }} transition={{ delay: index * 0.1, duration: 0.8 }}
                    whileHover={{ y: -30, rotateX: 0, scale: 1.05, zIndex: 10, boxShadow: "0 20px 50px -10px rgba(0,0,0,0.8)" }}
                    className={`relative h-24 md:h-32 w-full rounded-sm border-l-4 border-gray-800 bg-gradient-to-r ${item.color} shadow-2xl cursor-pointer group transform-style-3d flex items-center justify-between px-6 overflow-hidden`}
                    style={{ zIndex: index }}
                  >
                    <div className="flex flex-col z-10">
                       <span className={`text-xl md:text-2xl font-bold tracking-tighter uppercase ${item.accent} drop-shadow-lg`}>{item.title}</span>
                       <span className="text-xs text-gray-400 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.subtitle}</span>
                    </div>
                    <div className="opacity-20 group-hover:opacity-40 transition-opacity"><Disc className="w-12 h-12 text-white animate-spin-slow" style={{ animationDuration: '10s' }}/></div>
                    <div className="absolute inset-0 bg-repeat-y opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-scan.png')]" />
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} className="absolute bottom-8 text-xs tracking-[0.5em] text-gray-500">SELECT A MEMORY</motion.div>
          </motion.div>
        )}

        {/* VIEW 3: DETAIL */}
        {view === 'detail' && selectedItem && (
          <motion.div
            key="detail"
            className="absolute inset-0 z-20 flex flex-col md:flex-row items-center justify-center bg-black/90 p-8"
            initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(20px)" }} transition={{ duration: 1.5, ease: "easeOut" }}
          >
             <button onClick={handleBackToCollection} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors" onMouseEnter={() => playSound('hover')}>
               <ArrowLeft className="w-4 h-4" />
               <span className="text-xs tracking-widest uppercase">Return to Stack</span>
             </button>
             <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 items-center">
               <motion.div className="relative w-full md:w-1/2 aspect-[3/4] bg-neutral-900 rounded-sm overflow-hidden shadow-[0_0_100px_rgba(200,0,0,0.1)]" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1.5, type: "spring" }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedItem.color} opacity-50`} />
                  <div className="absolute inset-0 p-8 flex flex-col justify-between border-8 border-transparent">
                    <div className="flex justify-between items-start">
                       <div className="bg-black text-white px-2 py-1 text-[10px] font-bold tracking-wider">PAL</div>
                       <Maximize2 className="text-white/30 w-6 h-6" />
                    </div>
                    <div className="space-y-2 mix-blend-overlay">
                       <h1 className="text-6xl font-black text-white leading-none tracking-tighter break-words opacity-80">{selectedItem.title}</h1>
                       <p className="text-xl text-white font-serif italic opacity-60">{selectedItem.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                       <div className="text-[10px] text-white/50">KONAMI / CAPCOM / SONY</div>
                       <div className="h-8 w-16 bg-white/10" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 skew-x-12 translate-x-[-100%] animate-sheen" />
               </motion.div>
               <div className="w-full md:w-1/2 space-y-6 text-left">
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 1 }}>
                   <h2 className={`text-4xl md:text-5xl font-serif font-bold ${selectedItem.accent} mb-4`}>Item 0{selectedItem.id}</h2>
                   <div className="h-1 w-24 bg-gray-800 mb-8" />
                   <p className="text-lg md:text-xl leading-relaxed text-gray-300 font-light font-serif">"{selectedItem.desc}"</p>
                 </motion.div>
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-900">
                   <div className="text-center p-4 bg-gray-900/50 rounded hover:bg-red-900/20 transition-colors cursor-crosshair">
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Condition</div>
                      <div className="font-mono text-red-500">WORN</div>
                   </div>
                   <div className="text-center p-4 bg-gray-900/50 rounded hover:bg-red-900/20 transition-colors cursor-crosshair">
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Region</div>
                      <div className="font-mono text-gray-300">NTSC-J</div>
                   </div>
                   <div className="text-center p-4 bg-gray-900/50 rounded hover:bg-red-900/20 transition-colors cursor-crosshair">
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status</div>
                      <div className="font-mono text-gray-300">LOADED</div>
                   </div>
                 </motion.div>
               </div>
             </div>
          </motion.div>
        )}

        {/* VIEW 4: SYSTEM REGISTRY (DARK FROST) */}
        {view === 'registry' && (
          <motion.div
            key="registry"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 overflow-hidden"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
             {/* 1. LAYER ONE: Deep Black Void */}
             <div className="absolute inset-0 z-0 bg-black opacity-95" />
             
             {/* 2. LAYER TWO: Particles (NOW VISIBLE) */}
             {/* Positioned absolute z-10 so it's ON TOP of black layer but BEHIND glass card */}
             <ParticleOverlay mode="frost" className="absolute top-0 left-0 w-full h-full z-10" />

             {/* 3. LAYER THREE: Glass Container */}
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="w-full max-w-2xl bg-white/5 border border-white/20 rounded-xl p-8 relative overflow-hidden font-mono backdrop-blur-xl z-20"
               style={{
                  boxShadow: "0 0 100px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(255,255,255,0.1)"
               }}
             >
               {/* Close Button (Hover Red) */}
               <button 
                 onClick={closeRegistry} 
                 className="absolute top-8 right-8 text-white/50 hover:text-red-600 hover:rotate-90 transition-all duration-300 z-50"
               >
                 <X className="w-6 h-6" />
               </button>

               {/* Frost Texture (Inside Card) */}
               <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/snow.png')]" />

               {/* Header (Aligned) */}
               <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8 relative z-10 pr-12">
                 <div className="flex items-center gap-3 text-cyan-100 tracking-[0.2em] text-lg text-shadow-glow">
                   <Snowflake className="w-5 h-5 animate-spin-slow" />
                   <span>SYSTEM_REGISTRY<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span></span>
                 </div>
                 
                 <div className="text-xs text-cyan-300 font-bold tracking-widest flex items-center gap-1">
                   ICE_PROTOCOL_ACTIVE
                   <motion.span 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.2, ease: "linear" }}
                   >
                     __
                   </motion.span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm relative z-10">
                 <div className="space-y-6">
                    <div className="group">
                      <h3 className="text-cyan-200/70 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <User className="w-3 h-3" /> Author Identity
                      </h3>
                      <p className="text-2xl text-white tracking-wider font-bold drop-shadow-md group-hover:text-cyan-300 transition-colors">Alvido</p>
                    </div>
                    <div>
                      <h3 className="text-cyan-200/70 text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Origin Date</h3>
                      <p className="text-gray-100">November 26, 2025</p>
                    </div>
                    <div>
                      <h3 className="text-cyan-200/70 text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><Shield className="w-3 h-3" /> Build Version</h3>
                      <p className="text-gray-100">v3.3.0 (Atmospheric Frost)</p>
                    </div>
                 </div>
                 <div className="border-l border-white/20 pl-8">
                    <h3 className="text-cyan-200/70 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Cpu className="w-3 h-3" /> System Modules</h3>
                    <ul className="space-y-4 text-gray-200">
                      <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_cyan]" /> Frost_Engine.css</li>
                      <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_cyan]" /> Particle_Sim_v2</li>
                      <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_cyan]" /> Chord_Detection</li>
                      <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Atmospheric_Fog</li>
                    </ul>
                 </div>
               </div>
               <div className="mt-12 pt-6 border-t border-white/20 text-center relative z-10">
                 <div className="text-[10px] text-cyan-200/50 uppercase tracking-[0.3em]">Secure Connection Established</div>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
