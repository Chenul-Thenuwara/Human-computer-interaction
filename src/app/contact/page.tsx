"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function ContactPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus("error");
            return;
        }
        setStatus("sending");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            });
            if (res.ok) {
                setStatus("success");
                setName("");
                setEmail("");
                setSubject("");
                setMessage("");
                return;
            }
        } catch {
            // fallthrough to mailto
        }

        // fallback to mail client if API not available
        window.location.href = `mailto:hello@furnitureapp.example?subject=${encodeURIComponent(
            subject || `Contact from ${name}`
        )}&body=${encodeURIComponent(message + "\n\nContact: " + email)}`;
        setStatus("success");
    }

    return (
        <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
            {/* Decorative gradient orbs for ambient lighting */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

            {/* Navigation Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-20 flex justify-between items-center px-8 md:px-12 py-6 max-w-[1400px] mx-auto w-full backdrop-blur-sm"
            >
                <div
                    className="text-3xl font-medium tracking-wide cursor-pointer"
                    style={{ fontFamily: "var(--font-italiana)" }}
                    onClick={() => router.push("/")}
                >
                    Prism
                </div>

                <nav className="hidden md:flex gap-10 text-[15px] font-light tracking-wide font-sans">
                    <Link href="/" className="hover:text-[#f3b5a1] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] auto after:bg-white after:origin-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 hover:after:origin-left">Home</Link>
                    <Link href="/gallery" className="hover:text-[#f3b5a1] transition-colors">Gallery</Link>
                    <Link href="/about" className="hover:text-[#f3b5a1] transition-colors">About</Link>
                    <Link href="/contact" className="text-[#f3b5a1] border-b border-[#f3b5a1]/60 pb-0.5">Contact</Link>
                </nav>

                <div className="flex gap-4 items-center">
                    {user ? (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 rounded-full border border-white/30 hover:bg-white hover:text-[#233529] transition-all font-light tracking-wide text-sm hidden md:block"
                        >
                            Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-2 rounded-full bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-sm hidden md:block"
                        >
                            Login
                        </button>
                    )}
                    <ButtonMobileNav />
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-12 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* Left Side: Typography and Image */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-10"
                    >
                        <div>
                            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#f3b5a1] mb-6">
                                Get In Touch
                            </motion.p>
                            <motion.h1
                                variants={fadeUp}
                                className="text-[4rem] md:text-[6rem] leading-none font-medium tracking-tight"
                                style={{ fontFamily: "var(--font-italiana)" }}
                            >
                                Let&apos;s Design
                            </motion.h1>
                            <motion.span
                                variants={fadeUp}
                                className="block text-[3.5rem] md:text-[5rem] text-[#f3b5a1] -mt-2 mb-6"
                                style={{ fontFamily: "var(--font-italianno)" }}
                            >
                                your sanctuary
                            </motion.span>
                            <motion.p variants={fadeUp} className="text-white/60 font-light text-lg leading-relaxed max-w-md">
                                Whether you have a vision or need inspiration, our design concierge is here to bring your space to life.
                            </motion.p>
                        </div>

                        <motion.div variants={fadeUp} className="relative w-full max-w-[24rem] h-[32rem] rounded-t-full overflow-hidden shadow-2xl mt-4 hidden md:block">
                            <Image
                                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop"
                                alt="Elegant living room details"
                                fill
                                className="object-cover transition-transform duration-1000 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-[#233529]/10" />
                        </motion.div>
                    </motion.div>

                    {/* Right Side: Contact Form & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-16"
                    >
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-xl" noValidate>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent border-b border-white/20 pb-4 text-white placeholder-transparent focus:outline-none focus:border-[#f3b5a1] peer transition-colors font-light"
                                        placeholder="Your Name"
                                        required
                                    />
                                    <label
                                        htmlFor="name"
                                        className="absolute left-0 -top-5 text-sm text-white/40 uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[#f3b5a1]"
                                    >
                                        Name
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-b border-white/20 pb-4 text-white placeholder-transparent focus:outline-none focus:border-[#f3b5a1] peer transition-colors font-light"
                                        placeholder="Email Address"
                                        required
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-0 -top-5 text-sm text-white/40 uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[#f3b5a1]"
                                    >
                                        Email
                                    </label>
                                </div>
                            </div>

                            <div className="relative group mt-4">
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/20 pb-4 text-white placeholder-transparent focus:outline-none focus:border-[#f3b5a1] peer transition-colors font-light"
                                    placeholder="Subject"
                                />
                                <label
                                    htmlFor="subject"
                                    className="absolute left-0 -top-5 text-sm text-white/40 uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[#f3b5a1]"
                                >
                                    Subject (Optional)
                                </label>
                            </div>

                            <div className="relative group mt-4">
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-transparent border-b border-white/20 pb-4 text-white placeholder-transparent focus:outline-none focus:border-[#f3b5a1] peer transition-colors font-light resize-none"
                                    placeholder="Your Message"
                                    required
                                />
                                <label
                                    htmlFor="message"
                                    className="absolute left-0 -top-5 text-sm text-white/40 uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[#f3b5a1]"
                                >
                                    Message
                                </label>
                            </div>

                            <div className="flex items-center justify-between mt-8">
                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="group relative px-10 py-4 overflow-hidden rounded-full bg-white text-[#233529] font-medium tracking-wide uppercase text-xs disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(243,181,161,0.3)]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {status === "sending" ? "Sending..." : "Send Message"}
                                        {status !== "sending" && <svg className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>}
                                    </span>
                                    <div className="absolute inset-0 bg-[#f3b5a1] transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 z-0"></div>
                                </button>

                                <div className="text-sm">
                                    {status === "success" && <span className="text-[#f3b5a1] animate-pulse">Delivered. We&apos;ll be in touch.</span>}
                                    {status === "error" && <span className="text-red-400">Please fill out all required fields.</span>}
                                </div>
                            </div>
                        </form>

                        {/* Contact Info blocks */}
                        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10 w-full max-w-xl">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[#f3b5a1] mb-1">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    <span className="text-xs uppercase tracking-widest font-medium">Studio</span>
                                </div>
                                <p className="text-white/70 font-light text-sm leading-relaxed">
                                    123 Luxury Lane<br />
                                    Design District<br />
                                    New York, NY 10012
                                </p>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-[#f3b5a1] mb-1">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        <span className="text-xs uppercase tracking-widest font-medium">Direct</span>
                                    </div>
                                    <p className="text-white/70 font-light text-sm">
                                        +1 (212) 555-0123
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-[#f3b5a1] mb-1">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                        <span className="text-xs uppercase tracking-widest font-medium">Email</span>
                                    </div>
                                    <p className="text-white/70 font-light text-sm">
                                        hello@prism.com
                                    </p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </main>

            {/* Footer minimal version */}
            <footer className="relative z-10 border-t border-white/10 mt-20 py-8 px-8 md:px-12 flex justify-between items-center text-white/40 text-xs max-w-[1400px] mx-auto w-full">
                <span style={{ fontFamily: "var(--font-italiana)" }} className="text-white/60 text-lg">Prism</span>
                <span className="font-light tracking-wider uppercase hidden md:inline">© 2026 Prism Designer</span>
            </footer>
        </div>
    );
}

// Minimal Mobile Nav button for smaller screens (aesthetic placeholder)
function ButtonMobileNav() {
    return (
        <button className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
            <div className="w-6 h-px bg-white"></div>
            <div className="w-4 h-px bg-white self-end"></div>
        </button>
    )
}