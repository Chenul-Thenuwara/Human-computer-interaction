"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function ContactPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus("error")
            return
        }
        setStatus("sending")
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            })
            if (res.ok) {
                setStatus("success")
                setName("")
                setEmail("")
                setSubject("")
                setMessage("")
                return
            }
        } catch {
            // fallthrough to mailto
        }

        // fallback to mail client if API not available
        window.location.href = `mailto:hello@furnitureapp.example?subject=${encodeURIComponent(
            subject || `Contact from ${name}`
        )}&body=${encodeURIComponent(message + "\n\nContact: " + email)}`
        setStatus("success")
    }

    return (
        <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529]">
            {/* Navigation Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-20 flex justify-between items-center px-8 md:px-12 py-6 max-w-[1400px] mx-auto w-full backdrop-blur-sm"
            >
                <div className="text-3xl font-medium tracking-wide cursor-pointer" style={{ fontFamily: "var(--font-italiana)" }} onClick={() => router.push('/')}>
                    Prism
                </div>

                <nav className="hidden md:flex gap-10 text-[15px] font-light tracking-wide font-sans">
                    <Link href="/" className="hover:text-[#f3b5a1] transition-colors">Home</Link>
                    <Link href="/gallery" className="hover:text-[#f3b5a1] transition-colors">Gallery</Link>
                    <Link href="/about" className="hover:text-[#f3b5a1] transition-colors">About</Link>
                    <Link href="/contact" className="text-[#f3b5a1] border-b border-[#f3b5a1]/60 pb-0.5">Contact</Link>
                </nav>

                <div className="flex gap-4 items-center">
                    {/* Placeholder for auth buttons if needed to match width, or just empty */}
                    <div className="w-24"></div>
                </div>
            </motion.header>

            <main className="contact-root">
                <section className="panel grid">
                    <div className="left card slideIn">
                        <h2 className="heading">Get in Touch</h2>
                        <p className="lead">We&apos;d love to hear from you. Fill the form and we&apos;ll get back within one business day.</p>

                        <form className="contact-form" onSubmit={handleSubmit} noValidate>
                            <div className="row two">
                                <label className="field">
                                    <span className="label-text">Name</span>
                                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                                </label>

                                <label className="field">
                                    <span className="label-text">Email</span>
                                    <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" required />
                                </label>
                            </div>

                            <label className="field">
                                <span className="label-text">Subject</span>
                                <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What is this regarding?" />
                            </label>

                            <label className="field">
                                <span className="label-text">Message</span>
                                <textarea className="textarea" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message..." required />
                            </label>

                            <div className="actions">
                                <button className="send" type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
                                    </svg>
                                    <span>{status === "sending" ? "Sending..." : "Send Message"}</span>
                                </button>
                                <div className="status">
                                    {status === "success" && <span className="ok">Thanks — we&apos;ll reply soon.</span>}
                                    {status === "error" && <span className="err">Please complete required fields.</span>}
                                </div>
                            </div>
                        </form>
                    </div>

                    <aside className="right">
                        <div className="info card slideIn delay">
                            <h3>Visit Our Showroom</h3>
                            <p>123 Luxury Lane, Design District<br />New York, NY 10012</p>

                            <h3>Call Us</h3>
                            <p>+1 (212) 555-0123<br /><small>Mon–Fri: 9am – 6pm</small></p>

                            <h3>Email Us</h3>
                            <p>concierge@prism-furniture.com<br />design@prism-furniture.com</p>
                        </div>

                        <div className="showroom card slideIn delay2">
                            <div className="imageWrap">
                                <Image src="/images/showroom.jpg" alt="Prism Showroom" width={720} height={420} className="img" />
                                <div className="badge">Prism Showroom</div>
                            </div>
                        </div>
                    </aside>
                </section>

                <style jsx>{`
                :root{ --bg:#233529; --panel:#294033; --muted:#8ea089; }
                .contact-root{ max-width:1120px; margin:36px auto; padding:28px; color: #e6efe6; }
                .panel.grid{ display:grid; grid-template-columns: 1fr 420px; gap:22px; align-items:start; }
                .card{ background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06)); border:1px solid rgba(255,255,255,0.03); padding:22px; border-radius:12px; }
                .left{ padding:28px 26px; }
                .heading{ margin:0 0 6px; font-size:1.8rem; color:#f5fff5; }
                .lead{ color: #cfe1cf; margin-bottom:18px; }
                .contact-form{ display:flex; flex-direction:column; gap:12px; }
                .row.two{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
                .field{ display:flex; flex-direction:column; gap:8px; }
                .label-text{ font-size:13px; color:#cfe1cf; }
                .input, .textarea{ background:transparent; border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:8px; color: #eef7ee; outline:none; }
                .input::placeholder, .textarea::placeholder{ color: rgba(230,245,230,0.35); }
                .input:focus, .textarea:focus{ box-shadow: 0 8px 30px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }
                .textarea{ min-height:140px; resize:vertical; }
                .actions{ display:flex; align-items:center; gap:12px; margin-top:6px; }
                .send{ display:inline-flex; align-items:center; gap:10px; background: linear-gradient(90deg, rgba(150,185,163,0.14), rgba(120,165,135,0.12)); color: #e8f6e8; padding:12px 18px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); cursor:pointer; }
                .send:disabled{ opacity:.6; cursor:default; }
                .status .ok{ color:#9fe3ad; }
                .status .err{ color:#ff9b9b; }

                .right{ display:flex; flex-direction:column; gap:14px; }
                .info h3{ margin:0 0 6px; color:#fff; }
                .info p{ color:#cfe1cf; margin:0 0 12px; }

                .showroom .imageWrap{ position:relative; border-radius:10px; overflow:hidden; }
                .showroom .img{ display:block; width:100%; height:auto; filter:grayscale(.05) contrast(.9); }
                .badge{ position:absolute; left:12px; bottom:12px; background:rgba(0,0,0,0.6); color:#fff; padding:6px 12px; border-radius:999px; font-size:13px; }

                /* entrance animations */
                .slideIn{ animation: slideUp .6s cubic-bezier(.2,.9,.2,1) both; }
                .delay{ animation-delay:80ms; }
                .delay2{ animation-delay:160ms; }
                @keyframes slideUp{ from{ opacity:0; transform: translateY(18px); } to{ opacity:1; transform: translateY(0); } }

                @media (max-width:980px){ .panel.grid{ grid-template-columns: 1fr; } .row.two{ grid-template-columns: 1fr; } }
            `}</style>
            </main>
        </div>
    )
}