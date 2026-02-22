"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  LogOut,
  Users,
  LayoutDashboard,
  Settings,
  Sofa,
  Upload,
  PlusCircle,
  PackagePlus,
  Home,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddFurniturePage() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "chair",
    width: "",
    depth: "",
    height: "",
    color: "#000000",
    price: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [glbFile, setGlbFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e1713]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-t-[#f3b5a1] border-white/10"
        />
      </div>
    );
  }

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: false,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: false,
    },

    {
      href: "/admin/furniture/add",
      label: "Add Furniture",
      icon: Sofa,
      active: true,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: false,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "glb") => {
    if (e.target.files && e.target.files[0]) {
      if (type === "image") setImageFile(e.target.files[0]);
      if (type === "glb") setGlbFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!imageFile || !glbFile) {
      setErrorMessage("Please upload both an image and a GLB model file.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload files to Firebase Storage
      const imageRef = ref(storage, `furniture/images/${Date.now()}_${imageFile.name}`);
      const glbRef = ref(storage, `furniture/models/${Date.now()}_${glbFile.name}`);

      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      await uploadBytes(glbRef, glbFile);
      const glbUrl = await getDownloadURL(glbRef);

      // 2. Save data to Firestore
      const furnitureData = {
        name: formData.name,
        type: formData.type,
        width: parseFloat(formData.width) || 0,
        depth: parseFloat(formData.depth) || 0,
        height: parseFloat(formData.height) || 0,
        color: formData.color,
        price: formData.price,
        imageUrl: imageUrl,
        modelUrl: glbUrl, // The property in design-context is modelUrl
      };

      await addDoc(collection(db, "furniture"), furnitureData);

      setSuccessMessage("Furniture item added successfully!");
      // Reset form
      setFormData({
        name: "",
        type: "chair",
        width: "",
        depth: "",
        height: "",
        color: "#000000",
        price: "",
      });
      setImageFile(null);
      setGlbFile(null);
    } catch (error: any) {
      console.error("Error adding furniture:", error);
      setErrorMessage(error.message || "Failed to add furniture. Make sure Storage is enabled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      {/* Decorative gradient orbs for ambient lighting */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-col w-64 flex-shrink-0 h-screen backdrop-blur-xl bg-black/20 border-r border-white/10 overflow-y-auto"
        >
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#f3b5a1]" />
            </div>
            <span
              className="text-lg font-medium tracking-wide text-white"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              Prism Admin
            </span>
          </div>


          {/* Nav */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navLinks.map(({ href, label, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all ${
                  active
                    ? "bg-white/10 text-[#f3b5a1] border border-white/10"
                    : "text-[#a8b5b1] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* User info at bottom */}
          <div className="px-4 py-5 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f3b5a1]/20 border border-[#f3b5a1]/30 flex items-center justify-center text-[#f3b5a1] text-sm font-medium">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.displayName || user.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                  Admin
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#a8b5b1] hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </motion.aside>


        {/* ── Main Content ── */}
        <div className="flex-1 h-screen overflow-y-auto py-8 px-4 md:px-8 lg:px-12">
          <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
              <PackagePlus className="w-8 h-8 text-[#f3b5a1]" />
            </div>
            <h1 className="text-5xl font-medium tracking-tight text-white mb-2" style={{ fontFamily: "var(--font-italiana)" }}>
              Add Furniture
            </h1>
            <p className="text-lg text-white/60 font-light">
              Upload new furniture models and details to the database
            </p>
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeUp} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden p-8 shadow-2xl relative">
            {/* Subtle glow behind form */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {successMessage && (
              <div className="mb-6 p-4 bg-primary/20 border border-primary/30 rounded-xl text-[#8ea37e] relative z-10 font-light">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 relative z-10 font-light">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Furniture Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Minimalist Oak Chair"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Type *</label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.2rem",
                    }}
                  >
                    <option value="chair" className="bg-[#10251f] text-white">Chair</option>
                    <option value="sofa" className="bg-[#10251f] text-white">Sofa</option>
                    <option value="table" className="bg-[#10251f] text-white">Table</option>
                    <option value="dining-table" className="bg-[#10251f] text-white">Dining Table</option>
                    <option value="side-table" className="bg-[#10251f] text-white">Side Table</option>
                    <option value="bed" className="bg-[#10251f] text-white">Bed</option>
                    <option value="cabinet" className="bg-[#10251f] text-white">Cabinet</option>
                    <option value="bookcase" className="bg-[#10251f] text-white">Bookcase</option>
                    <option value="clock" className="bg-[#10251f] text-white">Clock</option>
                    <option value="plant" className="bg-[#10251f] text-white">Plant</option>
                    <option value="picture-frame" className="bg-[#10251f] text-white">Picture Frame</option>
                    <option value="fireplace" className="bg-[#10251f] text-white">Fireplace</option>
                    <option value="other" className="bg-[#10251f] text-white">Other</option>
                  </select>
                </div>

                {/* Dimensions */}
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Width (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    placeholder="e.g. 0.9"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Depth (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="depth"
                    value={formData.depth}
                    onChange={handleInputChange}
                    placeholder="e.g. 0.9"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Height (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.1"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Hex Color Code</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-12 bg-transparent rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light text-sm uppercase"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-light text-white/70">Price (String) *</label>
                  <input
                    type="text"
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 45,000 LKR"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>
                
                {/* File Uploads */}
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Cover Image (.jpg, .png) *</label>
                  <div className="w-full relative px-4 py-6 bg-black/20 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-white/30 transition-colors cursor-pointer flex flex-col items-center justify-center">
                    <input
                      title="Upload Image"
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => handleFileChange(e, "image")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-white/50 mb-2" />
                    <span className="text-sm text-white/50 font-light">
                      {imageFile ? imageFile.name : "Click to attach image"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">3D Model (.glb) *</label>
                  <div className="w-full relative px-4 py-6 bg-black/20 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-white/30 transition-colors cursor-pointer flex flex-col items-center justify-center">
                    <input
                      title="Upload Model"
                      type="file"
                      accept=".glb"
                      required
                      onChange={(e) => handleFileChange(e, "glb")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-white/50 mb-2" />
                    <span className="text-sm text-white/50 font-light">
                      {glbFile ? glbFile.name : "Click to attach .glb file"}
                    </span>
                  </div>
                </div>

              </div>
              
              <div className="pt-6 border-t border-white/10 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-[#f3b5a1] hover:text-[#233529] hover:border-[#f3b5a1] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-inherit border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Add to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
