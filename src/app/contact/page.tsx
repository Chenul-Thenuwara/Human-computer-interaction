'use client'

import { useState } from 'react'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus('error')
            return
        }
        setStatus('sending')
        try {
            // Attempt to send to an API endpoint if available
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            })
            if (res.ok) {
                setStatus('success')
                setName(''); setEmail(''); setMessage('')
            } else {
                // Fallback: open mail client
                window.location.href = `mailto:hello@furnitureapp.example?subject=Contact from ${encodeURIComponent(
                    name
                )}&body=${encodeURIComponent(message + '\n\nContact: ' + email)}`
                setStatus('success')
            }
        } catch {
            window.location.href = `mailto:hello@furnitureapp.example?subject=Contact from ${encodeURIComponent(
                name
            )}&body=${encodeURIComponent(message + '\n\nContact: ' + email)}`
            setStatus('success')
        }
    }

    return (
        <main className="contact-root" style={{ padding: 28 }}>
            <section className="hero" aria-labelledby="contact-heading">
                <div className="hero-left">
                    <h1 id="contact-heading" className="title">Get in touch</h1>
                    <p className="subtitle">
                        Questions about visualization, 3D furniture assets, or collaboration? Send us a message —
                        we typically respond within one business day.
                    </p>

                    <form onSubmit={handleSubmit} className="form" noValidate>
                        <label className="label">
                            Name
                            <input
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
                            />
                        </label>

                        <label className="label">
                            Email
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@domain.com"
                                required
                            />
                        </label>

                        <label className="label">
                            Message
                            <textarea
                                className="textarea"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={6}
                                placeholder="Tell us what you need..."
                                required
                            />
                        </label>

                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <button
                                type="submit"
                                className="btn"
                                disabled={status === 'sending'}
                                aria-busy={status === 'sending'}
                            >
                                {status === 'sending' ? 'Sending…' : 'Send message'}
                            </button>
                            {status === 'success' && <span className="msg success">Thanks — we received it!</span>}
                            {status === 'error' && <span className="msg error">Please fill all fields.</span>}
                        </div>
                    </form>
                </div>

                <aside className="hero-right" aria-hidden={false}>
                    <div className="card float">
                        <svg className="icon" viewBox="0 0 24 24" width="36" height="36" fill="none">
                            <path d="M3 8v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 19h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="14" y="6" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M7 6V4a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                            <strong>Office</strong>
                            <div>123 Design Ave, Suite 5</div>
                        </div>
                    </div>

                    <div className="card float delay">
                        <svg className="icon" viewBox="0 0 24 24" width="36" height="36" fill="none">
                            <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 8v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                            <strong>Email</strong>
                            <div>hello@furnitureapp.example</div>
                        </div>
                    </div>

                    <div className="card float delay2">
                        <svg className="icon" viewBox="0 0 24 24" width="36" height="36" fill="none">
                            <path d="M22 16.92V21a1 1 0 01-1.11 1A19.86 19.86 0 013 5.11 1 1 0 014 4h4.09a1 1 0 01.95.68l.83 2.49a1 1 0 01-.24 1l-1.38 1.38a14 14 0 006.6 6.6l1.38-1.38a1 1 0 011-.24l2.49.83a1 1 0 01.68.95z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                            <strong>Phone</strong>
                            <div>+1 (555) 123-4567</div>
                        </div>
                    </div>
                </aside>
            </section>

            <style jsx>{`
                .contact-root { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #0f172a; max-width: 1100px; margin: 0 auto; }
                .hero { display: grid; grid-template-columns: 1fr 360px; gap: 36px; align-items: start; margin-top: 36px; }
                .title { font-size: 2.1rem; margin: 0 0 8px; animation: fadeUp 520ms var(--ease) both; }
                .subtitle { color: #475569; margin-bottom: 20px; animation: fadeUp 620ms var(--ease) both; }
                .hero-left { padding-right: 12px; }
                .form { display: grid; gap: 12px; max-width: 720px; }
                .label { display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #0f172a; }
                .input, .textarea { padding: 10px 12px; border: 1px solid #e6eef6; border-radius: 8px; outline: none; transition: box-shadow .15s, transform .15s; background: #fff; }
                .input:focus, .textarea:focus { box-shadow: 0 6px 18px rgba(15,23,42,0.06); transform: translateY(-2px); border-color: #c7e1ff; }
                .textarea { min-height: 120px; resize: vertical; }
                .btn { background: linear-gradient(90deg,#0ea5a4,#3b82f6); color: #fff; padding: 10px 16px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 8px 30px rgba(59,130,246,0.12); transition: transform .12s ease, box-shadow .12s; }
                .btn:active { transform: translateY(1px) scale(.995); }
                .btn[disabled] { opacity: .7; cursor: default; transform: none; }
                .msg { font-size: 13px; margin-left: 6px; }
                .msg.success { color: #16a34a; }
                .msg.error { color: #dc2626; }

                .hero-right { display: flex; flex-direction: column; gap: 14px; }
                .card { display: flex; gap: 14px; align-items: center; background: linear-gradient(180deg,#ffffff, #fbfdff); border: 1px solid #eef2f7; padding: 14px; border-radius: 12px; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
                .icon { color: #0f172a; opacity: .9; }
                .float { animation: floatUp 900ms cubic-bezier(.2,.9,.2,1) both; transform-origin: center; }
                .float.delay { animation-delay: 80ms; }
                .float.delay2 { animation-delay: 160ms; }

                /* animations */
                :root { --ease: cubic-bezier(.2,.9,.2,1); }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatUp {
                    0% { transform: translateY(14px); opacity: 0; }
                    60% { transform: translateY(-6px); opacity: 1; }
                    100% { transform: translateY(0); opacity: 1; }
                }

                /* responsive */
                @media (max-width: 880px) {
                    .hero { grid-template-columns: 1fr; }
                    .hero-right { order: -1; }
                }
            `}</style>
        </main>
    )
}