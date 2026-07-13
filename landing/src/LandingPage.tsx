import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Elements ---

const AbstractOrb = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.2}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial 
          color="#22d3ee" 
          emissive="#a855f7" 
          emissiveIntensity={0.4} 
          wireframe={true} 
          distort={0.3} 
          speed={2} 
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#a855f7" intensity={2} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <group position={[3, 0, -2]}>
          <AbstractOrb />
        </group>
      </Canvas>
    </div>
  );
};

// --- SVG Icons ---

const IconATS = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

const IconPrivacy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

const IconRadar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="12" x2="19" y2="12"></line></svg>
);

// --- Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0b1220]/80 backdrop-blur-lg border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}
    >
      <div className="shell flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aqua to-plum p-[1px]">
            <div className="w-full h-full bg-[#0b1220] rounded-[11px] flex items-center justify-center">
               <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">Pathora</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#features" className="hover:text-aqua transition-colors duration-300">Architecture</a>
          <a href="#technology" className="hover:text-aqua transition-colors duration-300">Engine</a>
          <a href="#security" className="hover:text-aqua transition-colors duration-300">Security</a>
        </div>
        <div>
          <button className="btn btn-solid">
            Launch Platform
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="relative group rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-aqua/20 to-plum/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
    <div className="relative h-full bg-[#0d1627]/95 backdrop-blur-xl rounded-[31px] p-10 flex flex-col gap-5 border border-white/5 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-aqua border border-white/10 group-hover:border-aqua/50 transition-colors duration-500 shadow-glow">
        {icon}
      </div>
      <h3 className="font-display font-bold text-2xl text-white tracking-tight">{title}</h3>
      <p className="text-muted leading-relaxed text-base">
        {description}
      </p>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 400]);

  return (
    <div className="min-h-screen bg-[#0b1220] text-white selection:bg-aqua/30 overflow-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <Scene3D />
        
        {/* Deep ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-aqua/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-plum/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        <div className="shell relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-aqua animate-pulse shadow-[0_0_10px_#22d3ee]" />
              <span className="text-xs font-mono text-aqua font-semibold tracking-widest uppercase">System Core v2.0</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5rem] font-bold leading-[1.05] tracking-display text-white">
              Career Logic, <br />
              <span className="text-shine">Engineered.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted max-w-xl leading-relaxed font-light">
              Pathora combines advanced RAG architecture with local Large Language Models to deliver real-time ATS scoring—without ever exposing your data to the cloud.
            </p>
            
            <div className="flex flex-wrap items-center gap-5 pt-4">
              <button className="btn btn-solid px-8 py-4 text-base shadow-glow hover:scale-105">
                Download for Windows
              </button>
              <button className="btn btn-line px-8 py-4 text-base group backdrop-blur-md">
                Explore Architecture
                <span className="inline-block transition-transform group-hover:translate-x-2 ml-2">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="relative py-40 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#101a2e]/60 to-transparent skew-y-[-2deg] transform origin-top-left -z-10 border-y border-white/5" />
        <div className="shell relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-24"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">Built for the <span className="text-shine">Modern Elite</span></h2>
            <p className="text-muted text-lg font-light">Sophisticated algorithms analyze your professional footprint against market demands, running completely on local silicon for ultimate zero-trust privacy.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              delay={0.1}
              icon={<IconATS />}
              title="Instant ATS Analytics"
              description="Algorithmic scoring matches your CV with job descriptions in milliseconds. Identify critical missing keywords dynamically before submission."
            />
            <FeatureCard 
              delay={0.2}
              icon={<IconRadar />}
              title="RAG-Powered Insights"
              description="Vector embeddings and ChromaDB ensure the inference engine understands the deep semantic context of your career history."
            />
            <FeatureCard 
              delay={0.3}
              icon={<IconPrivacy />}
              title="Air-gapped Security"
              description="Zero API endpoints. Your PII never leaves your workstation. Pathora runs Llama 3.1 entirely on-premise for enterprise-grade confidentiality."
            />
          </div>
        </div>
      </section>

      {/* Parallax Showcase Section */}
      <section className="relative py-40 overflow-hidden">
        <motion.div style={{ y: yParallax }} className="absolute inset-0 opacity-40 z-0 pointer-events-none">
           <div className="w-full h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-plum/10 via-[#0b1220] to-[#0b1220]" />
        </motion.div>

        <div className="shell relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className="w-full lg:w-1/2 relative perspective-1000"
          >
            <div className="absolute inset-0 bg-aqua blur-[120px] opacity-20 rounded-full mix-blend-screen" />
            <div className="relative rounded-3xl border border-white/10 bg-[#0d1525]/90 backdrop-blur-xl overflow-hidden shadow-2xl transform-gpu">
              <div className="h-10 border-b border-white/5 bg-[#080d17] flex items-center px-5 gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="p-8 font-mono text-sm leading-relaxed text-aqua/90">
                <p className="text-white/40 mb-4">// System Process: Pathora Core Inference Engine</p>
                <p className="mb-2"><span className="text-plum">const</span> <span className="text-white">resumeScore</span> = <span className="text-aqua">await</span> <span className="text-white">engine.analyze</span>(cvData, jobDesc);</p>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="pl-4 border-l-2 border-emerald-500/30 my-4 py-2"
                >
                  <p className="text-emerald-400 font-bold">{">> Keyword Match Precision: 94.2%"}</p>
                  <p className="text-emerald-400 font-bold">{">> Semantic Alignment: Optimal"}</p>
                </motion.div>
                <p className="mt-4 text-white/50 animate-pulse">Initializing personalized roadmap generation...</p>
                <p className="text-white mt-2">Execution completed in 241ms.</p>
              </div>
            </div>
          </motion.div>
          
          <div className="w-full lg:w-1/2">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 tracking-tight leading-[1.1]">Developer-grade <br />Career Engineering</h2>
            <p className="text-muted text-lg mb-10 leading-relaxed font-light">
              We didn't just build another AI wrapper. Pathora integrates a local ChromaDB vector store directly with Ollama's inference framework, providing an isolated sandbox for you to reverse-engineer HR screening parameters.
            </p>
            
            <ul className="space-y-6">
              {[
                "Local semantic search & retrieval capabilities",
                "Automated high-fidelity Markdown reporting",
                "Behavioral interview stress-test simulations"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-white/90 text-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aqua/20 to-plum/20 border border-white/10 flex items-center justify-center text-aqua shadow-glow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-40">
        <div className="shell relative z-10">
          <div className="relative rounded-[3rem] bg-gradient-to-b from-[#121c2e] to-[#0b1220] border border-white/10 p-12 md:p-24 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-plum/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-aqua/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-8 relative z-10 tracking-tight">
              Ready to take control?
            </h2>
            <p className="text-xl text-muted font-light max-w-2xl mx-auto mb-12 relative z-10 leading-relaxed">
              Deploy Pathora today and start analyzing your career trajectory with the raw power of localized artificial intelligence.
            </p>
            
            <div className="relative z-10">
              <button className="btn btn-solid px-12 py-5 text-lg font-bold shadow-glow hover:scale-105 transition-all">
                Initialize Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-muted/50 text-sm font-medium">
        <div className="shell flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Pathora. Engineered with Precision.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-aqua transition-colors">Documentation</a>
            <a href="#" className="hover:text-aqua transition-colors">Privacy</a>
            <a href="#" className="hover:text-aqua transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
