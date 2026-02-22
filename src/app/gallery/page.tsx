"use client";

import { useState } from "react";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { furnitureLibrary } from "@/lib/furniture-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Helper function to generate a dummy price based on furniture type
const getDummyPrice = (type: string) => {
  switch (type) {
    case 'chair': return "45,000 LKR";
    case 'dining-table': return "120,000 LKR";
    case 'side-table': return "35,000 LKR";
    case 'sofa': return "185,000 LKR";
    case 'cabinet': return "95,000 LKR";
    case 'clock': return "15,000 LKR";
    case 'picture-frame': return "12,000 LKR";
    case 'fireplace': return "250,000 LKR";
    default: return "50,000 LKR";
  }
};

// Helper function to generate a dummy description based on furniture type
const getDummyDescription = (type: string) => {
  switch (type) {
    case 'chair': return "Ergonomic and stylish seating for any room.";
    case 'dining-table': return "Gather your family around this beautiful centerpiece.";
    case 'side-table': return "A perfect companion for your sofa or bed.";
    case 'sofa': return "Experience ultimate comfort and modern design.";
    case 'cabinet': return "Elegant storage solutions for a clutter-free space.";
    case 'clock': return "A timeless piece to elevate your wall decor.";
    case 'picture-frame': return "Showcase your memories with classic elegance.";
    case 'fireplace': return "Bring warmth and luxury to your living area.";
    default: return "A stunning addition to your home design.";
  }
};

export default function GalleryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Animation variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Filter furniture based on search query
  const filteredFurniture = furnitureLibrary.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      getDummyDescription(item.type).toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529]">
      {/* Decorative gradient orbs for ambient lighting */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/10 rounded-full blur-3xl pointer-events-none z-0"></div>

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
          <Link href="/gallery" className="text-[#f3b5a1] relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] auto after:bg-[#f3b5a1]">Gallery</Link>
          <Link href="/about" className="hover:text-[#f3b5a1] transition-colors">About</Link>
          <Link href="/contact" className="hover:text-[#f3b5a1] transition-colors">Contact</Link>
        </nav>

        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </motion.header>

      {/* Main Gallery Content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-12 py-12">
        {/* Page Title & Intro */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-16 space-y-8"
        >
          <div className="space-y-4">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-medium tracking-tight" style={{ fontFamily: "var(--font-italiana)" }}>
              Our Collection
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light">
              Discover a curated selection of premium furniture designed to elevate your living spaces with timeless elegance.
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div variants={fadeUp} className="max-w-md mx-auto relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-[#f3b5a1] transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder="Search furniture, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-full backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#f3b5a1]/50 focus-visible:border-[#f3b5a1]/50 transition-all hover:bg-white/10 text-base"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Furniture Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20"
        >
          {filteredFurniture.length > 0 ? (
            <AnimatePresence>
              {filteredFurniture.map((item, index) => (
                <motion.div
                  key={item.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group h-full"
                >
                  <Card className="h-full bg-white/5 border-white/10 backdrop-blur-md overflow-hidden transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#f3b5a1]/10 flex flex-col cursor-pointer">
                    {/* Image Container */}
                    <div className="relative aspect-square w-full overflow-hidden bg-black/20 p-6 flex items-center justify-center">
                      {/* Subtle highlight behind image */}
                      <div className="absolute inset-x-4 top-4 aspect-square rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>

                      <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110">
                        <Image
                          src={item.imageUrl || ''}
                          alt={item.name}
                          fill
                          className="object-contain drop-shadow-2xl"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="outline" className="bg-black/40 border-white/20 text-white/90 backdrop-blur-md font-normal text-xs uppercase tracking-wider">
                          {item.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col justify-between relative overflow-hidden">
                      <div className="space-y-3 z-10 relative">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-xl font-medium text-white leading-tight" style={{ fontFamily: "var(--font-italiana)" }}>
                            {item.name}
                          </h3>
                          <p className="text-[#f3b5a1] font-medium whitespace-nowrap">
                            {getDummyPrice(item.type)}
                          </p>
                        </div>

                        <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                          {getDummyDescription(item.type)}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-white/40 pt-2 border-t border-white/10 w-fit">
                          <span>W: {item.width}m</span>
                          <span>D: {item.depth}m</span>
                          <span>H: {item.height}m</span>
                        </div>
                      </div>

                      {/* Hover action button */}
                      <div className="mt-6 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/5 text-white opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-[#f3b5a1] hover:text-[#233529]"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Decorative background number on hover based on index */}
                      <div className="absolute -bottom-6 -left-4 text-8xl font-black text-white/[0.03] transition-transform duration-500 group-hover:-translate-y-4 group-hover:text-white/[0.05] pointer-events-none" style={{ fontFamily: "var(--font-italiana)" }}>
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center flex flex-col items-center justify-center space-y-4"
            >
              <div className="p-4 rounded-full bg-white/5 border border-white/10 text-white/30">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-medium text-white" style={{ fontFamily: "var(--font-italiana)" }}>No items found</h3>
              <p className="text-white/50 max-w-sm">
                We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Try adjusting your search or browse our categories.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4 rounded-full border-white/20 text-white hover:bg-white/10"
              >
                Clear Search
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
