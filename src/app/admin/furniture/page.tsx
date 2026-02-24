"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  LogOut,
  User,
  Settings,
  Sofa,
  Home,
  Upload,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FurnitureDoc {
  id: string;
  name: string;
  type: string;
  width: number;
  depth: number;
  height: number;
  color: string;
  price: string;
  imageUrl: string;
  modelUrl: string;
}

const emptyForm = {
  name: "",
  type: "chair",
  width: "",
  depth: "",
  height: "",
  color: "#000000",
  price: "",
};

export default function FurniturePage() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [furniture, setFurniture] = useState<FurnitureDoc[]>([]);
  const [loadingFurniture, setLoadingFurniture] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [editItem, setEditItem] = useState<FurnitureDoc | null>(null);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editGlbFile, setEditGlbFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FurnitureDoc | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navLinks = useMemo(
    () => [
      {
        href: "/admin/users",
        label: "Users",
        icon: User,
        active: false,
      },
      {
        href: "/admin/furniture",
        label: "Furniture",
        icon: Sofa,
        active: true,
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        active: false,
      },
    ],
    [],
  );

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setLoadingFurniture(true);
        const snapshot = await getDocs(collection(db, "furniture"));
        const items: FurnitureDoc[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FurnitureDoc, "id">),
        }));
        setFurniture(items);
      } catch (error) {
        console.error("Error fetching furniture:", error);
        setErrorMessage("Could not load furniture items.");
      } finally {
        setLoadingFurniture(false);
      }
    };

    if (!loading && user && isAdmin) {
      fetchFurniture();
    }
  }, [user, loading, isAdmin]);

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

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    isEdit = false,
  ) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "glb",
    isEdit = false,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isEdit) {
        if (type === "image") setEditImageFile(file);
        if (type === "glb") setEditGlbFile(file);
      } else {
        if (type === "image") setImageFile(file);
        if (type === "glb") setGlbFile(file);
      }
    }
  };

  const uploadAsset = async (file: File, prefix: string) => {
    const storageRef = ref(storage, `${prefix}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!imageFile || !glbFile) {
      setErrorMessage("Please upload both an image and a GLB model file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadAsset(imageFile, "furniture/images");
      const modelUrl = await uploadAsset(glbFile, "furniture/models");

      const payload = {
        name: formData.name,
        type: formData.type,
        width: parseFloat(formData.width) || 0,
        depth: parseFloat(formData.depth) || 0,
        height: parseFloat(formData.height) || 0,
        color: formData.color,
        price: formData.price,
        imageUrl,
        modelUrl,
      };

      const docRef = await addDoc(collection(db, "furniture"), payload);
      setFurniture((prev) => [...prev, { id: docRef.id, ...payload }]);
      setSuccessMessage("Furniture item added successfully.");
      setFormData(emptyForm);
      setImageFile(null);
      setGlbFile(null);
      setShowAddForm(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add furniture item.";
      console.error("Error adding furniture:", error);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: FurnitureDoc) => {
    setEditItem(item);
    setEditFormData({
      name: item.name,
      type: item.type,
      width: item.width.toString(),
      depth: item.depth.toString(),
      height: item.height.toString(),
      color: item.color,
      price: item.price,
    });
    setEditImageFile(null);
    setEditGlbFile(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    setEditSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let imageUrl = editItem.imageUrl;
      let modelUrl = editItem.modelUrl;

      if (editImageFile) {
        imageUrl = await uploadAsset(editImageFile, "furniture/images");
      }
      if (editGlbFile) {
        modelUrl = await uploadAsset(editGlbFile, "furniture/models");
      }

      const payload = {
        name: editFormData.name,
        type: editFormData.type,
        width: parseFloat(editFormData.width) || 0,
        depth: parseFloat(editFormData.depth) || 0,
        height: parseFloat(editFormData.height) || 0,
        color: editFormData.color,
        price: editFormData.price,
        imageUrl,
        modelUrl,
      };

      await updateDoc(doc(db, "furniture", editItem.id), payload);
      setFurniture((prev) =>
        prev.map((f) => (f.id === editItem.id ? { ...f, ...payload } : f)),
      );
      setSuccessMessage("Furniture item updated.");
      setEditItem(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update furniture item.";
      console.error("Error updating furniture:", error);
      setErrorMessage(message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    setErrorMessage("");
    try {
      await deleteDoc(doc(db, "furniture", pendingDelete.id));
      setFurniture((prev) => prev.filter((f) => f.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (error) {
      console.error("Error deleting furniture:", error);
      setErrorMessage("Failed to delete furniture item.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-col w-64 flex-shrink-0 h-screen backdrop-blur-xl bg-black/20 border-r border-white/10 overflow-y-auto"
        >
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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
            <Link
              href="/"
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-[#a8b5b1] hover:text-white hover:bg-white/10 transition-all"
              aria-label="Go to home"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>

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

          <div className="px-4 py-5 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f3b5a1]/20 border border-[#f3b5a1]/30 flex items-center justify-center text-[#f3b5a1] text-sm font-medium overflow-hidden">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user.displayName || user.email)?.[0]?.toUpperCase()
                )}
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

        <div className="flex-1 h-screen overflow-y-auto py-8 px-4 md:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-7xl mx-auto space-y-8"
          >
            <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="w-14 h-14 mb-3 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                  <Sofa className="w-7 h-7 text-[#f3b5a1]" />
                </div>
                <h1 className="text-4xl font-medium tracking-tight text-white" style={{ fontFamily: "var(--font-italiana)" }}>
                  Furniture
                </h1>
                <p className="text-white/60 font-light">Manage, edit, and curate the furniture library.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddForm((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all text-sm font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  {showAddForm ? "Close Form" : "Add Furniture"}
                </button>
              </div>
            </motion.div>

            {successMessage && (
              <motion.div variants={fadeUp} className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-[#8ea37e]">
                {successMessage}
              </motion.div>
            )}
            {errorMessage && (
              <motion.div variants={fadeUp} className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
                {errorMessage}
              </motion.div>
            )}

            {showAddForm && (
              <motion.div
                variants={fadeUp}
                className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden p-8 shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <form onSubmit={handleAddSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">Furniture Name *</label>
                      <input
                        type="text"
                        required
                        name="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="e.g. Minimalist Oak Chair"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">Type *</label>
                      <select
                        name="type"
                        required
                        value={formData.type}
                        onChange={(e) => handleInputChange(e)}
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
                        <option value="picture-frame" className="bg-[#10251f] text-white">Picture Frame</option>
                        <option value="fireplace" className="bg-[#10251f] text-white">Fireplace</option>
                        <option value="other" className="bg-[#10251f] text-white">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">Width (m) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        name="width"
                        value={formData.width}
                        onChange={(e) => handleInputChange(e)}
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
                        onChange={(e) => handleInputChange(e)}
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
                        onChange={(e) => handleInputChange(e)}
                        placeholder="e.g. 1.1"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">Hex Color Code</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={(e) => handleInputChange(e)}
                          className="w-12 h-12 bg-transparent rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={(e) => handleInputChange(e)}
                          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light text-sm uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="e.g. 120,000 LKR"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">Preview Image *</label>
                      <label className="flex items-center justify-between gap-3 w-full bg-black/20 border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/70 cursor-pointer hover:border-white/40 transition-all">
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {imageFile ? imageFile.name : "Upload image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "image")}
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/70">GLB Model *</label>
                      <label className="flex items-center justify-between gap-3 w-full bg-black/20 border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/70 cursor-pointer hover:border-white/40 transition-all">
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {glbFile ? glbFile.name : "Upload .glb"}
                        </span>
                        <input
                          type="file"
                          accept=".glb"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "glb")}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-3 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-3 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {isSubmitting ? "Saving..." : "Save Furniture"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white/80">Library</h2>
                <span className="text-sm text-white/50">{furniture.length} items</span>
              </div>

              {loadingFurniture ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                    className="w-10 h-10 rounded-full border-2 border-t-[#f3b5a1] border-white/10"
                  />
                </div>
              ) : furniture.length === 0 ? (
                <div className="border border-white/10 bg-white/5 rounded-2xl p-10 text-center text-white/60">
                  No furniture items found. Add one to get started.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {furniture.map((item) => (
                    <div
                      key={item.id}
                      className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col"
                    >
                      <div className="relative h-40 bg-black/20">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white/40">No image</div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg text-white font-medium truncate">{item.name}</h3>
                          <span className="px-3 py-1 text-xs rounded-full border border-white/10 text-white/70 bg-white/5 capitalize">
                            {item.type.replace("-", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">Price: {item.price || "N/A"}</p>
                        <p className="text-sm text-white/60">Size: {item.width}m × {item.depth}m × {item.height}m</p>
                        <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-2 text-xs rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setPendingDelete(item)}
                            className="px-3 py-2 text-xs rounded-lg border border-white/10 text-red-300 hover:bg-red-500/10 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#10251f]/95 rounded-2xl p-8 border border-white/10 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-[#f3b5a1]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Edit Furniture</h2>
                  <p className="text-white/60 text-sm">{editItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="text-white/60 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Furniture Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Type *</label>
                  <select
                    name="type"
                    required
                    value={editFormData.type}
                    onChange={(e) => handleInputChange(e, true)}
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
                    <option value="picture-frame" className="bg-[#10251f] text-white">Picture Frame</option>
                    <option value="fireplace" className="bg-[#10251f] text-white">Fireplace</option>
                    <option value="other" className="bg-[#10251f] text-white">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Width (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="width"
                    value={editFormData.width}
                    onChange={(e) => handleInputChange(e, true)}
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
                    value={editFormData.depth}
                    onChange={(e) => handleInputChange(e, true)}
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
                    value={editFormData.height}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Hex Color Code</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="color"
                      value={editFormData.color}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-12 h-12 bg-transparent rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      name="color"
                      value={editFormData.color}
                      onChange={(e) => handleInputChange(e, true)}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Price</label>
                  <input
                    type="text"
                    name="price"
                    value={editFormData.price}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">Preview Image</label>
                  <label className="flex items-center justify-between gap-3 w-full bg-black/20 border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/70 cursor-pointer hover:border-white/40 transition-all">
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {editImageFile ? editImageFile.name : "Upload image (optional)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "image", true)}
                    />
                  </label>
                  <p className="text-xs text-white/40">Current: {editItem.imageUrl || "None"}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-white/70">GLB Model</label>
                  <label className="flex items-center justify-between gap-3 w-full bg-black/20 border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/70 cursor-pointer hover:border-white/40 transition-all">
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {editGlbFile ? editGlbFile.name : "Upload .glb (optional)"}
                    </span>
                    <input
                      type="file"
                      accept=".glb"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "glb", true)}
                    />
                  </label>
                  <p className="text-xs text-white/40">Current: {editItem.modelUrl || "None"}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-3 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-3 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#10251f]/95 rounded-2xl p-8 border border-white/10 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Delete furniture</h2>
                <p className="text-sm text-white/60">{pendingDelete.name}</p>
              </div>
            </div>
            <p className="text-white/70 mb-6">This will permanently remove the item from the library. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-3 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition-all text-sm"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white transition-all text-sm font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
