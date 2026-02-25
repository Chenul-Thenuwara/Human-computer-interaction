"use client";

import { useState } from "react"
import Image from "next/image"
import { SiteHeader } from "@/components/SiteHeader";
import { motion, Variants } from "framer-motion"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus("error");
            return;
        }
        setStatus("sending")
        
        try {
            // Call the secure Next.js API route to handle the Firebase insertion
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            })
            
            if (!res.ok) {
                throw new Error("Failed to send message via API")
            }
            
            setStatus("success")
            setName("")
            setEmail("")
            setSubject("")
            setMessage("")
            
            // Revert back to idle after a few seconds
            setTimeout(() => setStatus("idle"), 5000)
            
        } catch (err) {
            console.error("Error saving contact message:", err)
            // fallback to mail client if API not available or blocked
            window.location.href = `mailto:hello@furnitureapp.example?subject=${encodeURIComponent(
                subject || `Contact from ${name}`
            )}&body=${encodeURIComponent(message + "\n\nContact: " + email)}`
            setStatus("success")
        }
    }

    // --- Animation Variants ---
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    }

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    }

    return (
        <div className="relative min-h-screen text-white selection:bg-[#f3b5a1] overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#9fbda9]/5 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#f3b5a1]/5 blur-[150px] pointer-events-none" />

            {/* Navigation */}
            <SiteHeader delay={0.2} />

            <main className="max-w-[1400px] mx-auto px-8 md:px-12 py-12 md:py-20 relative z-10 min-h-[calc(100vh-100px)] flex flex-col justify-center">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    
                    {/* Left Column - Form */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-10"
                    >
                        <div>
                            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-medium tracking-tight mb-4" style={{ fontFamily: "var(--font-italiana)" }}>
                                Let&apos;s create <br/><span className="text-[#f3b5a1] italic" style={{ fontFamily: "var(--font-italianno)", fontSize: "1.2em", lineHeight: "0.8" }}>together</span>
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-lg text-white/50 font-light max-w-md">
                                Have a vision in mind? Reach out to our design concierge team and let&apos;s craft your perfect space.
                            </motion.p>
                        </div>

                        <motion.form variants={fadeUp} className="flex flex-col gap-8 w-full max-w-xl" onSubmit={handleSubmit} noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group relative">
                                    <input 
                                        type="text" 
                                        id="name"
                                        className="w-full bg-transparent border-b border-white/20 py-4 text-white outline-none focus:border-[#f3b5a1] transition-colors peer placeholder-transparent" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        placeholder="Name"
                                        required 
                                    />
                                    <label htmlFor="name" className="absolute left-0 top-4 text-white/40 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#f3b5a1] peer-valid:-top-3 peer-valid:text-xs">
                                        Your Name
                                    </label>
                                </div>

                                <div className="group relative">
                                    <input 
                                        type="email" 
                                        id="email"
                                        className="w-full bg-transparent border-b border-white/20 py-4 text-white outline-none focus:border-[#f3b5a1] transition-colors peer placeholder-transparent" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="Email"
                                        required 
                                    />
                                    <label htmlFor="email" className="absolute left-0 top-4 text-white/40 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#f3b5a1] peer-valid:-top-3 peer-valid:text-xs">
                                        Email Address
                                    </label>
                                </div>
                            </div>

                            <div className="group relative">
                                <input 
                                    type="text" 
                                    id="subject"
                                    className="w-full bg-transparent border-b border-white/20 py-4 text-white outline-none focus:border-[#f3b5a1] transition-colors peer placeholder-transparent" 
                                    value={subject} 
                                    onChange={(e) => setSubject(e.target.value)} 
                                    placeholder="Subject"
                                />
                                <label htmlFor="subject" className="absolute left-0 top-4 text-white/40 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#f3b5a1] peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-xs">
                                    Inquiry Subject (Optional)
                                </label>
                            </div>

                            <div className="group relative">
                                <textarea 
                                    id="message"
                                    className="w-full bg-transparent border-b border-white/20 py-4 text-white outline-none focus:border-[#f3b5a1] transition-colors peer placeholder-transparent min-h-[120px] resize-y" 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    placeholder="Message"
                                    required 
                                />
                                <label htmlFor="message" className="absolute left-0 top-4 text-white/40 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#f3b5a1] peer-valid:-top-3 peer-valid:text-xs">
                                    Tell us about your project
                                </label>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button 
                                    className="group relative inline-flex items-center gap-4 bg-[#9fbda9] text-[#10251f] px-8 py-4 rounded-full overflow-hidden transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" 
                                    type="submit" 
                                    disabled={status === "sending"}
                                >
                                    <span className="font-medium tracking-wide relative z-10">
                                        {status === "sending" ? "Sending..." : "Send Request"}
                                    </span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    {/* Hover effect background */}
                                    <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                                </button>
                                
                                {status === "error" && (
                                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-sm font-light">
                                        Please fill out all required fields.
                                    </motion.span>
                                )}
                                {status === "success" && (
                                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[#9fbda9] text-sm font-light">
                                        Message sent successfully!
                                    </motion.span>
                                )}
                            </div>
                        </motion.form>
                    </motion.div>

                    {/* Right Column - Image & Info */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative h-[600px] rounded-[2rem] overflow-hidden group"
                    >
                        <Image 
                            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1200&auto=format&fit=crop" 
                            alt="Prism Studio" 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#10251f] via-transparent to-transparent opacity-80" />
                        
                        {/* Glassmorphic Contact Info Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute bottom-8 left-8 right-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-full shrink-0">
                                    <MapPin className="w-5 h-5 text-[#f3b5a1]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-1" style={{ fontFamily: "var(--font-jacques-francois)" }}>Prism Showroom</h3>
                                    <p className="text-white/60 text-sm font-light leading-relaxed">
                                        123 Luxury Lane, Design District<br/>New York, NY 10012
                                    </p>
                                </div>
                            </div>
                            
                            <div className="h-[1px] w-full bg-white/10" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/70 font-light">+1 (212) 555-0123</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/70 font-light">design@prism.com</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </main>
        </div>
    )
}