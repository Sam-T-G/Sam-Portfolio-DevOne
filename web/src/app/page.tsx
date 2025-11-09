"use client";
import { useRef, useState } from "react";
import { useScroll, motion } from "framer-motion";
import PermanentSceneBackground from "@/components/canvas/PermanentSceneBackground";
import EscapeButton from "@/components/ui/EscapeButton";
import HUDManager from "@/components/canvas/HUDManager";
import SectionIndicator from "@/components/canvas/SectionIndicator";
import TimelineNavigation from "@/components/canvas/TimelineNavigation";
import SwipeIndicator from "@/components/ui/SwipeIndicator";
import { useMobileTouch } from "@/hooks/useMobileTouch";
import { navigateToNextSection, navigateToPreviousSection } from "@/utils/sectionNavigation";

// Project data for unified 3D space
const projects = [
  { 
    id: 1, 
    title: "SosheIQ", 
    subtitle: "AI Social Interaction Trainer", 
    color: "#0891B2", 
    link: "https://github.com/sam-t-g/SosheIQ",
    description: "Advanced AI-powered platform leveraging Google Gemini and Imagen to create realistic conversation scenarios with visual feedback. Features scientifically-anchored personality traits, cinematic animations, and comprehensive progress tracking to help users master social interactions.",
    mobileDescription: "AI platform using Google Gemini and Imagen for realistic conversation training with visual feedback and progress tracking.",
    tags: ["Google Gemini", "Next.js 14", "TypeScript", "Framer Motion"],
    hackathon: "UC Berkeley AI Hackathon 2025"
  },
  { 
    id: 2, 
    title: "Vitalis", 
    subtitle: "Emergency Relief AI System", 
    color: "#10B981", 
    link: "https://github.com/sam-t-g/vitalis",
    description: "AI-powered emergency management system using fine-tuned GPT-OSS 20B for disaster response coordination. Aligned with FEMA, WHO, and Red Cross protocols, providing expert guidance for resource coordination and emergency operations with Apple Silicon optimization.",
    mobileDescription: "Fine-tuned GPT-OSS 20B model for disaster response coordination aligned with FEMA, WHO, and Red Cross protocols.",
    tags: ["AI/ML", "PyTorch", "GPT-OSS 20B", "Python"],
    hackathon: "OpenAI Open Model Hackathon"
  },
  { 
    id: 3, 
    title: "FullChat", 
    subtitle: "Developer Messaging Platform", 
    color: "#F59E0B", 
    link: "https://github.com/sam-t-g/fullchat",
    description: "Real-time communication platform built for developers from the ground up without modern React frameworks. An exercise in creating a responsive, modern instant messaging system using Socket.io-powered messaging, MySQL database architecture, and dynamic routing. Designed as a dedicated space for the developer community to collaborate and connect in real-time.",
    mobileDescription: "Ground-up instant messaging system built without modern React frameworks, featuring Socket.io real-time communication and MySQL architecture.",
    tags: ["Socket.io", "Express", "MySQL", "Node.js"]
  },
  { 
    id: 4, 
    title: "DoGood", 
    subtitle: "Gamified Social Impact App", 
    color: "#8B5CF6",
    link: "https://github.com/sam-t-g/calhacks25",
    description: "Cal Hacks 25 project featuring a unified low-latency context window between Claude AI, Poke by Interaction Co, and LiveKit for seamless voice interaction. Combines AI-driven activity generation with gamification mechanics, photo verification system, and an interactive voice assistant companion. Earn XP by completing real-world social good activities.",
    mobileDescription: "Unified low-latency context window between Claude AI, Poke, and LiveKit for seamless voice-powered social impact task generation.",
    tags: ["Claude AI", "Next.js", "LiveKit", "Voice AI"],
    hackathon: "UC Berkeley Cal Hacks 2025"
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Mobile touch navigation - swipe up/down to navigate between sections
  useMobileTouch({
    minSwipeDistance: 60,
    maxSwipeTime: 400,
    velocityThreshold: 0.3,
    enableHaptics: true,
    onSwipeUp: () => {
      // Swipe up = scroll down = next section
      navigateToNextSection();
    },
    onSwipeDown: () => {
      // Swipe down = scroll up = previous section
      navigateToPreviousSection();
    },
  });

  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-[#f5f5f5] via-[#fafafa] to-[#f0f0f0]" style={{ scrollSnapType: 'y proximity' }}>
      {/* Permanent 3D Background - Unified Spatial Experience */}
      <PermanentSceneBackground 
        projects={projects}
        onProjectClick={(project) => {
          if (project.link) {
            window.open(project.link, '_blank');
          }
        }}
        onFocusChange={(focused) => setIsFocused(focused)}
        onSectionChange={(section) => setActiveSection(section)}
      />
      
      {/* ESC Button - Only in project highlight mode */}
      <EscapeButton show={isFocused} />

      {/* Game-style HUD System */}
      <HUDManager />

      {/* Persistent Section Indicator - Top Right */}
      <SectionIndicator activeSection={activeSection} projects={projects} />

      {/* Timeline Navigation - Right Side */}
      <TimelineNavigation activeSection={activeSection} projects={projects} />

      {/* Mobile Swipe Indicator - Shows on first mobile visit */}
      <SwipeIndicator />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="progress-bar fixed top-0 left-0 right-0 z-50 h-1 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section - Floating in Space */}
      <section 
        id="home" 
        className="pointer-events-none relative flex min-h-screen items-center justify-center"
      >
        {/* Content Layer with subtle backdrop */}
        <div className="pointer-events-auto relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-teal)]"
          >
            DevOne Hack 2025
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-[family-name:var(--font-display)] mb-8 text-6xl font-black leading-[1.1] tracking-tight text-[var(--ink-black)] sm:text-7xl lg:text-8xl"
          >
            Samuel<br />Gerungan
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-[var(--charcoal)]"
          >
            Computer Science student at Riverside City College with expertise in full-stack development, AI integration, and competitive programming. Research assistant exploring computational programming competition datasets and runtime optimization.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a href="#projects" className="btn btn-primary">
              View Projects
            </a>
            <a href="#contact" className="btn btn-secondary">
              Contact Me
            </a>
          </motion.div>
        </div>
      </section>

      {/* Projects - Each gets dedicated viewport for cinematic presentation */}
      {projects.map((project, index) => (
        <section
          key={project.id}
          id={`project-${index}`}
          className="pointer-events-none relative flex min-h-screen items-center justify-center"
          style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always', paddingBottom: index === projects.length - 1 ? '25vh' : '0' }}
        >
          {/* 3D project presentation renders here - handled by CinematicShowcase */}
          {/* Optional: Add subtle gradient overlay or other 2D embellishments */}
        </section>
      ))}

      {/* Spacer between projects and skills - Critical breathing room */}
      <div className="h-screen" aria-hidden="true" />

      {/* Skills - Floating in Space */}
      <section id="skills" className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center pt-24 pb-40" style={{ scrollMarginTop: '120px' }}>
        <div className="pointer-events-auto mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { category: "Languages", skills: ["Python", "TypeScript", "JavaScript", "C++", "SQL", "HTML/CSS"] },
              { category: "Frameworks & Libraries", skills: ["React", "Next.js", "Node.js", "Express", "PyTorch", "Three.js", "Socket.io"] },
              { category: "Technical Skills", skills: ["Machine Learning", "LLM Fine-Tuning", "Real-Time Systems", "WebGL/3D Graphics", "REST APIs", "Database Design"] },
            ].map((group) => (
              <div
                key={group.category}
                className="group rounded-2xl border border-brand-teal/20 bg-white/80 p-6 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:border-brand-teal/40 hover:shadow-xl hover:shadow-brand-teal/10"
              >
                <h3 className="mb-4 text-lg font-semibold text-brand-orange">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-brand-teal/30 bg-brand-mint/10 px-3 py-1.5 text-sm text-brand-teal transition-colors hover:bg-brand-teal/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer between skills and contact - Breathing room */}
      <div className="h-96" aria-hidden="true" />

      {/* Contact - Floating in Space */}
      <section id="contact" className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center pt-16 pb-32" style={{ scrollMarginTop: '120px' }}>
        <div className="pointer-events-auto mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Email */}
            <a
              href="mailto:samuelgerungan@gmail.com"
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Email</p>
                <p className="font-medium text-zinc-800">samuelgerungan@gmail.com</p>
              </div>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/sam-t-g"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.799 8.206 11.387.6.111.82-.261.82-.58 0-.287-.011-1.243-.017-2.255-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.304.76-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.382 1.237-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.48 11.48 0 0 1 3.004-.404c1.019.005 2.046.138 3.003.404 2.293-1.552 3.3-1.23 3.3-1.23.654 1.653.242 2.873.119 3.176.77.839 1.236 1.911 1.236 3.221 0 4.61-2.804 5.625-5.475 5.921.43.371.814 1.102.814 2.222 0 1.604-.015 2.896-.015 3.29 0 .321.216.697.825.579C20.565 21.796 24 17.297 24 12 24 5.37 18.627 0 12 0z"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">GitHub</p>
                <p className="font-medium text-zinc-800">github.com/sam-t-g</p>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/in/samuelgerungan"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.036-1.849-3.036-1.853 0-2.136 1.447-2.136 2.943v5.662H9.0V9h3.112v1.561h.044c.434-.82 1.494-1.686 3.074-1.686 3.29 0 3.897 2.164 3.897 4.98v6.597zM5.337 7.433a1.805 1.805 0 1 1 0-3.61 1.805 1.805 0 0 1 0 3.61zM6.9 20.452H3.77V9H6.9v11.452z"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">LinkedIn</p>
                <p className="font-medium text-zinc-800">linkedin.com/in/samuelgerungan</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+19098106275"
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Phone</p>
                <p className="font-medium text-zinc-800">(909) 810-6275</p>
              </div>
            </a>

            {/* Location */}
            <div className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Location</p>
                <p className="font-medium text-zinc-800">San Bernardino, CA</p>
              </div>
            </div>

            {/* Education */}
            <div className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Education</p>
                <p className="font-medium text-zinc-800">Riverside City College</p>
              </div>
            </div>

            {/* Resume */}
            <a
              href="/Samuel_Gerungan_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Resume</p>
                <p className="font-medium text-zinc-800">View Resume</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
