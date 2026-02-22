"use client";

import { motion, Variants } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Animation variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const archImageVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
    visible: {
      scale: 1,
      opacity: 1,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex justify-between items-center px-8 md:px-12 py-6 max-w-[1400px] mx-auto w-full"
        >
          <div className="text-3xl font-medium tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
            Prism
          </div>

            <nav className="hidden md:flex gap-10 text-[15px] font-light tracking-wide font-sans">
            <Link href="/" className="hover:text-[#f3b5a1] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] auto after:bg-white after:origin-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 hover:after:origin-left">Home</Link>
            <Link href="/gallery" className="hover:text-[#f3b5a1] transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-[#f3b5a1] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#f3b5a1] transition-colors">Contact</Link>
          </nav>

          <div className="flex gap-6 items-center">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 rounded-full border border-white/30 hover:bg-white hover:text-[#233529] transition-all font-light tracking-wide text-sm flex items-center gap-2"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 rounded-full bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-sm"
              >
                Login
              </button>
            )}
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 relative flex items-center justify-center pt-10 pb-20">

          {/* Centered Big Typography */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="absolute z-30 flex flex-col items-center justify-center w-full pointer-events-none"
          >
            <motion.h1 variants={fadeUp} className="text-[7rem] md:text-[10rem] leading-[0.85] tracking-tight font-medium" style={{ fontFamily: "var(--font-italiana)" }}>
              Discover
            </motion.h1>

            <motion.div variants={fadeUp} className="relative w-full flex justify-center -mt-6 md:-mt-10 mr-12 md:mr-24">
              <span className="text-[6rem] md:text-[9rem] text-[#f3b5a1] font-normal leading-[0.6] -rotate-2" style={{ fontFamily: "var(--font-italianno)" }}>
                The best
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[7rem] md:text-[10rem] leading-[0.9] tracking-tight font-medium" style={{ fontFamily: "var(--font-italiana)" }}>
              Furniture
            </motion.h1>
          </motion.div>

          {/* Abstract Circle Arch Behind Main Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute z-10 w-[24rem] h-[36rem] md:w-[28rem] md:h-[40rem] border border-[#f3b5a1]/40 rounded-t-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[2rem]"
          />

          {/* Left Arch Image */}
          <motion.div
            variants={archImageVariants}
            initial="hidden"
            animate="visible"
            className="absolute left-[5%] md:left-[10%] top-1/4 w-[14rem] h-[22rem] md:w-[18rem] md:h-[28rem] rounded-t-full overflow-hidden shadow-2xl z-20"
          >
            <Image
              src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1200&auto=format&fit=crop"
              alt="Decorative desk area"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 14rem, 18rem"
            />
          </motion.div>

          {/* Center Bottom Image */}
          <motion.div
            variants={archImageVariants}
            initial="hidden"
            animate="visible"
            className="absolute left-1/2 transform -translate-x-1/2 bottom-[5%] w-[18rem] h-[22rem] md:w-[26rem] md:h-[28rem] rounded-t-full overflow-hidden shadow-2xl z-20"
          >
            <Image
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1600&auto=format&fit=crop"
              alt="Green sofa setting"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 18rem, 26rem"
            />
          </motion.div>

          {/* Right Arch Image */}
          <motion.div
            variants={archImageVariants}
            initial="hidden"
            animate="visible"
            className="absolute right-[5%] md:right-[10%] top-1/4 w-[14rem] h-[22rem] md:w-[18rem] md:h-[28rem] rounded-t-full overflow-hidden shadow-2xl z-20"
          >
            <Image
              src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop"
              alt="Yellow armchair"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 14rem, 18rem"
            />
          </motion.div>

          {/* Floating Element: Star */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 1, type: "spring" }}
            className="absolute left-[28%] top-[30%] z-20 pointer-events-none"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#f3b5a1">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </motion.div>

          {/* Floating Element: Curved Arrow */}
          <motion.div
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute left-[26%] bottom-[45%] z-20 pointer-events-none"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8ea37e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-[-20deg]">
              <path d="M9 14 L4 9 L9 4" />
              <path d="M4 9 Q 15 9 20 20" />
            </svg>
          </motion.div>

          {/* Scroll Down Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute left-[20%] bottom-[15%] z-30"
          >
            <div className="relative w-28 h-28 cursor-pointer group flex items-center justify-center">
              <svg className="absolute w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                <defs>
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                </defs>
                <circle cx="50" cy="50" r="45" fill="#8ea37e" className="opacity-90 transition-opacity group-hover:opacity-100" />
                <text className="text-[12px] uppercase tracking-[0.2em] fill-[#233529] font-medium" style={{ fontFamily: "var(--font-abhaya-libre)" }}>
                  <textPath href="#circlePath" startOffset="0%">
                    Welcome   •   Welcome   •
                  </textPath>
                </text>
              </svg>
              <div className="z-10 text-[#233529]">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
          </motion.div>



        </main>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
