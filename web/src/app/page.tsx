"use client";
import { useRef, useState } from "react";
import { useScroll, motion } from "framer-motion";
import PermanentSceneBackground from "@/components/canvas/PermanentSceneBackground";
import EscapeButton from "@/components/ui/EscapeButton";

// Project data for unified 3D space
const projects = [
  { id: 1, title: "SosheIQ", subtitle: "AI Social Coach", color: "#0891B2", link: "https://github.com/sam-t-g/SosheIQ" },
  { id: 2, title: "Vitalis", subtitle: "Emergency AI", color: "#10B981", link: "https://github.com/sam-t-g/vitalis" },
  { id: 3, title: "FullChat", subtitle: "Messaging Platform", color: "#F59E0B", link: "https://github.com/sam-t-g/fullchat" },
  { id: 4, title: "DoGood", subtitle: "Social Simulation", color: "#8B5CF6" },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-[#f5f5f5] via-[#fafafa] to-[#f0f0f0]">
      {/* Permanent 3D Background - Unified Spatial Experience */}
      <PermanentSceneBackground 
        projects={projects}
        onProjectClick={(project) => {
          if (project.link) {
            window.open(project.link, '_blank');
          }
        }}
        onFocusChange={(focused) => setIsFocused(focused)}
      />
      
      {/* ESC Button - Only in project highlight mode */}
      <EscapeButton show={isFocused} />

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

      {/* Projects - Pure 3D Space (Instructions exist IN the 3D scene) */}
      <section id="projects" className="pointer-events-none relative" style={{ minHeight: '150vh' }}>
        {/* Empty space - 3D content shows through, all interactions with 3D */}
      </section>

      {/* Skills - Floating in Space */}
      <section id="skills" className="pointer-events-none relative z-10 min-h-screen py-32">
        <div className="pointer-events-auto mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-3xl font-semibold text-brand-teal"
          >
            Skills / Tech Stack
          </motion.h2>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { category: "Languages", skills: ["C++", "TypeScript", "Python", "JavaScript", "HTML", "CSS"] },
              { category: "Frameworks & Tools", skills: ["React", "Next.js", "Node.js", "Docker", "Git", "Google Cloud Suite", "AWS"] },
              { category: "Specializations", skills: ["AI Integration", "Full-Stack Development", "Data Structures", "Algorithms", "RESTful APIs"] },
            ].map((group, groupIndex) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ 
                  duration: 0.7, 
                  delay: groupIndex * 0.2,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="group rounded-2xl border border-brand-teal/20 bg-white/80 p-6 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:border-brand-teal/40 hover:shadow-xl hover:shadow-brand-teal/10"
              >
                <h3 className="mb-4 text-lg font-semibold text-brand-orange">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.3, 
                        delay: groupIndex * 0.2 + skillIndex * 0.05 
                      }}
                      className="rounded-full border border-brand-teal/30 bg-brand-mint/10 px-3 py-1.5 text-sm text-brand-teal transition-colors hover:bg-brand-teal/20"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact - Floating in Space */}
      <section id="contact" className="pointer-events-none relative z-10 min-h-screen py-32">
        <div className="pointer-events-auto mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="mb-4 text-3xl font-semibold text-brand-orange">Contact</h2>
            <p className="mb-8 text-zinc-700">
              Reach me directly via any of the links below.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Email */}
            <motion.a
              href="mailto:samuelgerungan@gmail.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Email</p>
                <p className="font-medium text-zinc-800">samuelgerungan@gmail.com</p>
              </div>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/sam-t-g"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.799 8.206 11.387.6.111.82-.261.82-.58 0-.287-.011-1.243-.017-2.255-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.304.76-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.382 1.237-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.48 11.48 0 0 1 3.004-.404c1.019.005 2.046.138 3.003.404 2.293-1.552 3.3-1.23 3.3-1.23.654 1.653.242 2.873.119 3.176.77.839 1.236 1.911 1.236 3.221 0 4.61-2.804 5.625-5.475 5.921.43.371.814 1.102.814 2.222 0 1.604-.015 2.896-.015 3.29 0 .321.216.697.825.579C20.565 21.796 24 17.297 24 12 24 5.37 18.627 0 12 0z"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">GitHub</p>
                <p className="font-medium text-zinc-800">github.com/sam-t-g</p>
              </div>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://linkedin.com/in/samuelgerungan"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.036-1.849-3.036-1.853 0-2.136 1.447-2.136 2.943v5.662H9.0V9h3.112v1.561h.044c.434-.82 1.494-1.686 3.074-1.686 3.29 0 3.897 2.164 3.897 4.98v6.597zM5.337 7.433a1.805 1.805 0 1 1 0-3.61 1.805 1.805 0 0 1 0 3.61zM6.9 20.452H3.77V9H6.9v11.452z"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">LinkedIn</p>
                <p className="font-medium text-zinc-800">linkedin.com/in/samuelgerungan</p>
              </div>
            </motion.a>

            {/* Phone */}
            <motion.a
              href="tel:+19098106275"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Phone</p>
                <p className="font-medium text-zinc-800">(909) 810-6275</p>
              </div>
            </motion.a>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Location</p>
                <p className="font-medium text-zinc-800">San Bernardino, CA</p>
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Education</p>
                <p className="font-medium text-zinc-800">Riverside City College</p>
              </div>
            </motion.div>

            {/* Resume */}
            <motion.a
              href="/Samuel_Gerungan_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="group flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 shadow-lg shadow-brand-teal/5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-xl hover:shadow-brand-teal/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </span>
              <div>
                <p className="text-sm text-brand-orange">Resume</p>
                <p className="font-medium text-zinc-800">View Resume</p>
              </div>
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
