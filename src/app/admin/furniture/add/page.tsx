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
  PackagePlus
} from "lucide-react";
import { motion } from "framer-motion";
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
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: false,
    },
    { href: "/admin/users", label: "Users", icon: Users, active: false },
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

  return (
    <div className="min-h-screen bg-[#0e1713] text-white flex">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col w-64 min-h-screen border-r border-[#4a5d5a] bg-[#10251f] sticky top-0 h-screen"
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#4a5d5a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8a9d96]/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#8a9d96]" />
          </div>
          <span
            className="text-lg font-medium tracking-wide text-[#a8b5b1]"
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
                  ? "bg-[#8a9d96]/15 text-[#8a9d96] border border-[#8a9d96]/20"
                  : "text-[#a8b5b1] hover:bg-[#2d3e3c] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-5 border-t border-[#4a5d5a]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#8a9d96]/20 flex items-center justify-center text-[#8a9d96] text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user.displayName || user.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-[#8a9d96] uppercase tracking-wider">
                Admin
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#a8b5b1] hover:text-white hover:bg-[#2d3e3c] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-h-screen bg-[#10251f] py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#4a5d5a] rounded-full flex items-center justify-center">
                <PackagePlus className="w-8 h-8 text-[#8a9d96]" />
              </div>
              <div>
                <h1 className="text-5xl font-serif font-normal text-white mb-2">
                  Add Furniture
                </h1>
                <p className="text-lg text-[#a8b5b1]">
                  Upload new furniture models and details to the database
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#2d3e3c] rounded-2xl border border-[#4a5d5a] overflow-hidden p-8 shadow-xl">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Furniture Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Minimalist Oak Chair"
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Type *</label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all appearance-none cursor-pointer"
                  >
                    <option value="chair">Chair</option>
                    <option value="sofa">Sofa</option>
                    <option value="table">Table</option>
                    <option value="dining-table">Dining Table</option>
                    <option value="side-table">Side Table</option>
                    <option value="bed">Bed</option>
                    <option value="cabinet">Cabinet</option>
                    <option value="bookcase">Bookcase</option>
                    <option value="clock">Clock</option>
                    <option value="plant">Plant</option>
                    <option value="picture-frame">Picture Frame</option>
                    <option value="fireplace">Fireplace</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Dimensions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Width (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    placeholder="e.g. 0.9"
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Depth (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="depth"
                    value={formData.depth}
                    onChange={handleInputChange}
                    placeholder="e.g. 0.9"
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Height (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.1"
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Hex Color Code</label>
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
                      className="flex-1 px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all text-sm uppercase"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Price (String) *</label>
                  <input
                    type="text"
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 45,000 LKR"
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96] transition-all"
                  />
                </div>
                
                {/* File Uploads */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">Cover Image (.jpg, .png) *</label>
                  <div className="w-full relative px-4 py-6 bg-[#1a2d2a] border-2 border-dashed border-[#4a5d5a] rounded-xl text-center hover:border-[#8a9d96] transition-colors cursor-pointer flex flex-col items-center justify-center">
                    <input
                      title="Upload Image"
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => handleFileChange(e, "image")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-[#7a8984] mb-2" />
                    <span className="text-sm text-[#a8b5b1]">
                      {imageFile ? imageFile.name : "Click to attach image"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a8b5b1]">3D Model (.glb) *</label>
                  <div className="w-full relative px-4 py-6 bg-[#1a2d2a] border-2 border-dashed border-[#4a5d5a] rounded-xl text-center hover:border-[#8a9d96] transition-colors cursor-pointer flex flex-col items-center justify-center">
                    <input
                      title="Upload Model"
                      type="file"
                      accept=".glb"
                      required
                      onChange={(e) => handleFileChange(e, "glb")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-[#7a8984] mb-2" />
                    <span className="text-sm text-[#a8b5b1]">
                      {glbFile ? glbFile.name : "Click to attach .glb file"}
                    </span>
                  </div>
                </div>

              </div>
              
              <div className="pt-6 border-t border-[#4a5d5a] flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-[#8a9d96] hover:bg-[#a8b5b1] text-black font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black"
                      />
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
          </div>
        </div>
      </div>
    </div>
  );
}
