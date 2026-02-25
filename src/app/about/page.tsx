"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
};

const teamMembers = [
  {
    name: "Sophia Laurent",
    role: "Lead Interior Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    bio: "15 years of experience blending classical European aesthetics with modern minimalism.",
  },
  {
    name: "Marcus Reid",
    role: "3D Visualization Expert",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    bio: "Former architect turned digital artist, bringing rooms to life before a single piece of furniture moves.",
  },
  {
    name: "Aiko Tanaka",
    role: "UX & Product Design",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
    bio: "Obsessed with creating interfaces that disappear — leaving only the joy of the experience.",
  },
];

const values = [
  { label: "Craftsmanship", desc: "Every pixel, every curve is considered with the same care a craftsman gives wood.", icon: "✦" },
  { label: "Simplicity", desc: "We strip away noise so your vision — and your space — can breathe fully.", icon: "◎" },
  { label: "Emotion", desc: "A room is not just furniture. It is mood, memory, and a sense of belonging.", icon: "♡" },
  { label: "Precision", desc: "From exact dimensions to material textures — accuracy is our creative obsession.", icon: "◈" },
];

export default function AboutPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* ── Navigation ── */}
      <SiteHeader delay={0.2} className="sticky top-0 z-50" />

      {/* ── Hero Section ── */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Parallax background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2400&auto=format&fit=crop"
            alt="Elegant interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#0e1713]/70" />
        </motion.div>

        {/* Decorative arch outline */}
        <div className="absolute z-10 w-[24rem] h-[36rem] md:w-[30rem] md:h-[45rem] border border-[#f3b5a1]/30 rounded-t-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-20 text-center px-6"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs uppercase tracking-[0.3em] text-[#f3b5a1] mb-6"
          >
            Our Story
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-[5rem] md:text-[8rem] leading-none font-medium tracking-tight"
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            Designed
          </motion.h1>
          <motion.span
            variants={fadeUp}
            className="block text-[4rem] md:text-[6rem] text-[#f3b5a1] -mt-4"
            style={{ fontFamily: "var(--font-italianno)" }}
          >
            with intention
          </motion.span>
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-md mx-auto text-white/60 font-light text-base leading-relaxed"
          >
            Prism was born from a single belief — that everyone deserves to see their dream space before committing to it.
          </motion.p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Mission Section ── */}
      <section className="py-32 px-8 md:px-20 max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — Arch Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="w-full max-w-[380px] mx-auto h-[520px] rounded-t-full overflow-hidden relative shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop"
                alt="Elegant sofa in a curated room"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating accent badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-6 -right-0 md:-right-10 bg-[#f3b5a1] text-[#233529] rounded-2xl px-6 py-4 shadow-xl"
            >
              <p className="text-3xl font-medium" style={{ fontFamily: "var(--font-italiana)" }}>2026</p>
              <p className="text-xs tracking-wider mt-0.5 font-medium uppercase">Founded</p>
            </motion.div>
          </motion.div>

          {/* Right — Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-6"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#f3b5a1]">
              Our Mission
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl leading-tight font-normal"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              We visualise the space before it exists
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 font-light leading-relaxed text-base">
              Choosing furniture has always been a leap of faith. You imagine how a piece will look, hope the scale is right, and trust the colours will work. We decided to change that.
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/60 font-light leading-relaxed text-base">
              Prism is a spatial design studio and tool that lets you see your room come alive — before a single delivery truck arrives. It is confidence made visual.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-4 flex gap-10">
              {[["500+", "Rooms Designed"], ["98%", "Client Satisfaction"], ["12+", "Design Awards"]].map(([num, label]) => (
                <div key={label}>
                  <p className="text-3xl font-medium text-[#f3b5a1]" style={{ fontFamily: "var(--font-italiana)" }}>{num}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="py-28 bg-[#0e1713]/60">
        <div className="max-w-[1200px] mx-auto px-8 md:px-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#f3b5a1] mb-4">
              What Drives Us
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              Our Values
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#f3b5a1]/30 transition-all duration-300"
              >
                <p className="text-3xl mb-5 text-[#f3b5a1]">{v.icon}</p>
                <h3 className="text-xl font-normal mb-3" style={{ fontFamily: "var(--font-jacques-francois)" }}>{v.label}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="py-32 px-8 md:px-20 max-w-[1200px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-20"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#f3b5a1] mb-4">
            The People
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            Meet the team
          </motion.h2>
          <motion.span
            variants={fadeUp}
            className="block text-3xl text-[#f3b5a1] mt-2"
            style={{ fontFamily: "var(--font-italianno)" }}
          >
            behind every room
          </motion.span>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col items-center text-center"
            >
              {/* Arch photo */}
              <div className="w-52 h-72 rounded-t-full overflow-hidden relative mb-6 ring-1 ring-white/10 group-hover:ring-[#f3b5a1]/40 transition-all duration-500">
                <Image src={member.image} alt={member.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="text-xl font-normal" style={{ fontFamily: "var(--font-jacques-francois)" }}>{member.name}</h3>
              <p className="text-xs uppercase tracking-wider text-[#f3b5a1] mt-1 mb-3">{member.role}</p>
              <p className="text-sm text-white/50 font-light leading-relaxed max-w-xs">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2400&auto=format&fit=crop"
            alt="Dream living room"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#233529] via-[#233529]/80 to-[#233529]" />
        </div>

        {/* Arch outline */}
        <div className="absolute z-10 w-[20rem] h-[30rem] border border-[#f3b5a1]/20 rounded-t-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-20 text-center px-6"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#f3b5a1] mb-4">
            Start Today
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-7xl font-medium leading-none mb-4"
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            Your room is waiting
          </motion.h2>
          <motion.span
            variants={fadeUp}
            className="block text-3xl md:text-4xl text-[#f3b5a1] mb-10"
            style={{ fontFamily: "var(--font-italianno)" }}
          >
            for you to design it
          </motion.span>
          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push("/signup")}
              className="px-10 py-4 rounded-full bg-white text-[#233529] hover:bg-[#f3b5a1] transition-all font-medium tracking-wide text-sm"
            >
              Get Started — It&apos;s Free
            </button>
            <button
              onClick={() => router.push("/gallery")}
              className="px-10 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-all font-light tracking-wide text-sm"
            >
              See the Gallery
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-10 px-8 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
        <span style={{ fontFamily: "var(--font-italiana)" }} className="text-white/60 text-xl">Prism</span>
        <span className="font-light">© 2026 Prism Designer. All rights reserved.</span>
        <div className="flex gap-6 font-light">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
