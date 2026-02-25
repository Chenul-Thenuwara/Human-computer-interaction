"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, CheckCircle, ChevronRight, Armchair, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DesignRequest } from "@/types/design";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface Designer {
  id: string;
  name: string;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // New Request Form State
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [width, setWidth] = useState(5);
  const [length, setLength] = useState(4);
  const [height, setHeight] = useState(2.7);
  const [wallColor, setWallColor] = useState('#F5F5F5');
  const [floorColor, setFloorColor] = useState('#D4A574');
  const [selectedDesigner, setSelectedDesigner] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const presetRooms = [
    { name: 'Small Living Room', width: 4, length: 3.5, height: 2.7 },
    { name: 'Medium Living Room', width: 5, length: 4, height: 2.7 },
    { name: 'Large Living Room', width: 6, length: 5, height: 3 },
    { name: 'Dining Room', width: 4, length: 4, height: 2.7 },
    { name: 'Bedroom', width: 4, length: 3.5, height: 2.5 },
  ];

  const colorPresets = {
    walls: [
      { name: 'White', color: '#FFFFFF' },
      { name: 'Sage Green', color: '#354840' },
      { name: 'Light Gray', color: '#E5E7EB' },
      { name: 'Beige', color: '#F5F5DC' },
      { name: 'Muted Green', color: '#758C7B' },
      { name: 'Dark Green', color: '#26312D' },
    ],
    floors: [
      { name: 'Light Oak', color: '#D4A574' },
      { name: 'Dark Oak', color: '#8B4513' },
      { name: 'Walnut', color: '#6B4423' },
      { name: 'Maple', color: '#E8D4B0' },
      { name: 'Gray Tile', color: '#9CA3AF' },
      { name: 'White Tile', color: '#F3F4F6' },
    ],
  };

  useEffect(() => {
    // Fetch available designers
    const fetchDesigners = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "designer"));
        const snapshot = await getDocs(q);
        const fetchedDesigners: Designer[] = [];
        snapshot.forEach((doc) => {
          fetchedDesigners.push({
            id: doc.id,
            name: doc.data().displayName || doc.data().email?.split("@")[0] || "Unknown Designer",
          });
        });
        setDesigners(fetchedDesigners);
        if (fetchedDesigners.length > 0) {
          setSelectedDesigner(fetchedDesigners[0].id);
        }
      } catch (error) {
        console.error("Error fetching designers:", error);
      }
    };

    fetchDesigners();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user's design requests
    const q = query(collection(db, "design_requests"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: DesignRequest[] = [];
      snapshot.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, ...doc.data() } as DesignRequest);
      });
      // Sort by creation time descending
      fetchedRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(fetchedRequests);
      setLoadingRequests(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDesigner) return;

    setIsProcessingPayment(true);

    // Mock Payment Delay
    setTimeout(async () => {
      try {
        const newRequest: Omit<DesignRequest, "id"> = {
          userId: user.uid,
          designerId: selectedDesigner,
          customerName: customerName,
          specialNotes: specialNotes,
          room: {
            width: Number(width),
            length: Number(length),
            height: Number(height),
            wallColor: wallColor,
            floorColor: floorColor
          },
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await addDoc(collection(db, "design_requests"), newRequest);
        setShowNewRequest(false);
        // Reset form state optionally
        setCustomerName("");
        setSpecialNotes("");
      } catch (error) {
        console.error("Error creating request:", error);
        alert("Failed to submit request.");
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000); // 2 seconds mock payment
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Animation variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-[#8ea37e]" />;
      case 'in_progress': return <Armchair className="w-5 h-5 text-blue-400" />;
      default: return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-x-hidden flex flex-col">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-150 h-150 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-125 h-125 bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 backdrop-blur-md bg-black/20 border-b border-white/10 shadow-lg shadow-black/10"
      >
        <div className="max-w-350 mx-auto px-6 md:px-12 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-3xl font-medium tracking-wide text-white hover:text-white/80 transition-colors cursor-pointer" style={{ fontFamily: "var(--font-italiana)" }}>
                Prism
              </Link>
              <div className="h-6 w-px bg-white/20 hidden md:block"></div>
              <span className="text-white/60 font-light tracking-wide text-sm hidden md:block">
                Client Dashboard
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="text-white/90 font-light text-sm">
                  {user?.displayName || user?.email?.split("@")[0]}
                </span>
                <span className="text-xs text-[#f3b5a1]">
                  Client
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-[#f3b5a1]/80 hover:text-[#f3b5a1] hover:bg-[#f3b5a1]/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-350 mx-auto px-6 md:px-12 py-12 flex flex-col gap-12">
        <motion.div
           variants={staggerContainer}
           initial="hidden"
           animate="visible"
           className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full"
        >
          {/* Stats */}
          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Total Requests</h2>
            <p className="text-4xl font-light text-white" style={{ fontFamily: "var(--font-italiana)" }}>{requests.length}</p>
          </motion.div>
          
          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-xs font-medium text-amber-400/50 uppercase tracking-wider mb-2">Pending</h2>
            <p className="text-4xl font-light text-amber-400" style={{ fontFamily: "var(--font-italiana)" }}>{pendingCount}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-xs font-medium text-blue-400/50 uppercase tracking-wider mb-2">In Progress</h2>
            <p className="text-4xl font-light text-blue-400" style={{ fontFamily: "var(--font-italiana)" }}>{inProgressCount}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center items-center group cursor-pointer hover:bg-white/10 transition-all border-dashed"
            onClick={() => setShowNewRequest(true)}
          >
            <Plus className="w-8 h-8 text-[#f3b5a1] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-[#f3b5a1]">New Request</span>
          </motion.div>
        </motion.div>

        {/* Requests List */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full">
          <h2 className="text-3xl font-medium tracking-wide text-white mb-6 border-b border-white/10 pb-4" style={{ fontFamily: "var(--font-italiana)" }}>My Design Requests</h2>
          
          {loadingRequests ? (
             <div className="w-full py-12 flex justify-center">
                 <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
             </div>
          ) : requests.length === 0 ? (
            <div className="w-full min-h-75 flex flex-col items-center justify-center backdrop-blur-md bg-white/2 border border-white/10 border-dashed rounded-2xl">
              <span className="text-4xl opacity-50 mb-4">✨</span>
              <p className="text-white/50 mb-6">You haven't requested any designs yet.</p>
              <Button onClick={() => setShowNewRequest(true)} className="bg-white text-black hover:bg-white/90">
                Request a Design
              </Button>
            </div>
          ) : (
             <div className="grid grid-cols-1 gap-4">
               {requests.map((request) => (
                  <div key={request.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                         <h3 className="text-lg font-medium tracking-wide capitalize" style={{ fontFamily: "var(--font-italiana)" }}>
                           {request.status.replace("_", " ")} Design
                         </h3>
                         <p className="text-sm text-white/50 font-light mt-1">
                           Room: {request.room.width}x{request.room.length}x{request.room.height}m
                         </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                         <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Requested On</p>
                         <p className="text-sm text-white/80">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      {request.status === 'completed' && request.designId ? (
                        <Button
                          onClick={() => {
                            // In a real app, this might navigate to a preview view. 
                            // For now, let's assume designers save it, and we can load it in the editor in view mode
                            router.push(`/design/view?id=${request.designId}`);
                          }}
                          className="bg-[#8ea37e] text-white hover:bg-[#9eb38e] transition-all rounded-xl shadow-lg"
                        >
                          View Design <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="border-white/10 text-white/50 rounded-xl">
                          {request.status === 'pending' ? 'Waiting..' : 'Designing..'}
                        </Button>
                      )}
                    </div>
                  </div>
               ))}
             </div>
          )}
        </motion.div>
      </main>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-[#121c17] border border-white/10 rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden my-8"
           >
             {isProcessingPayment && (
               <div className="absolute inset-0 z-50 bg-[#121c17]/90 backdrop-blur-md flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#f3b5a1]/30 border-t-[#f3b5a1] rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-white tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>Processing Payment...</p>
                  <p className="text-sm text-white/50 mt-2">Mocking transaction ($99.00)</p>
               </div>
             )}

             <div className="flex justify-between items-start mb-2">
                 <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-italiana)" }}>Request New Design</h2>
                 <button onClick={() => setShowNewRequest(false)} className="text-white/50 hover:text-white p-2">✕</button>
             </div>
             
             <p className="text-white/50 text-sm mb-6 pb-4 border-b border-white/10">Configure your room details and select a designer. Price: $99.00</p>

             <form onSubmit={handleCreateRequest} className="space-y-8 relative z-0 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
               
               {/* 1. Project Details */}
               <div className="space-y-4">
                 <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-white font-medium">1</span>
                     <h3 className="text-lg font-medium text-white">Project Details</h3>
                 </div>
                 <div className="pl-8 space-y-4">
                     <div className="space-y-2">
                        <Label className="text-white/80">Customer Name *</Label>
                        <Input 
                          type="text" 
                          required 
                          placeholder="e.g. John Doe"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="bg-white/5 border-white/10 text-white rounded-xl h-11"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-white/80">Special Notes / Requirements</Label>
                        <textarea 
                          placeholder="Any specific instructions for the designer? (e.g. Needs to be pet friendly)"
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl min-h-[80px] p-3 outline-none focus:border-[#f3b5a1]/50 focus:ring-1 focus:ring-[#f3b5a1]/50"
                        />
                     </div>
                 </div>
               </div>

               {/* 2. Designer Selection */}
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-white font-medium">2</span>
                     <h3 className="text-lg font-medium text-white">Select Designer</h3>
                 </div>
                 <div className="pl-8">
                     <select 
                       className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 py-2 outline-none focus:border-[#f3b5a1]/50 focus:ring-1 focus:ring-[#f3b5a1]/50 appearance-none"
                       value={selectedDesigner}
                       onChange={(e) => setSelectedDesigner(e.target.value)}
                       required
                     >
                       <option value="" disabled className="bg-black text-white">Choose a designer...</option>
                       {designers.map(d => (
                         <option key={d.id} value={d.id} className="bg-black text-white">{d.name}</option>
                       ))}
                     </select>
                 </div>
               </div>

               {/* 3. Room Dimensions */}
               <div className="space-y-4">
                 <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-white font-medium">3</span>
                     <h3 className="text-lg font-medium text-white">Room Dimensions</h3>
                 </div>
                 
                 <div className="pl-8 space-y-6">
                     {/* Presets */}
                     <div>
                       <Label className="mb-3 block text-white/70">Quick Presets</Label>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                         {presetRooms.map((preset) => (
                           <Button
                             type="button"
                             key={preset.name}
                             variant="outline"
                             onClick={() => {
                               setWidth(preset.width);
                               setLength(preset.length);
                               setHeight(preset.height);
                             }}
                             className="text-xs bg-white/5 border-white/10 text-white hover:bg-white/20 hover:text-white"
                           >
                             {preset.name}
                           </Button>
                         ))}
                       </div>
                     </div>

                     {/* Sliders */}
                     <div className="space-y-5">
                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <Label className="text-white/80">Width</Label>
                           <span className="text-sm font-medium text-[#f3b5a1]">{width.toFixed(1)}m</span>
                         </div>
                         <Slider min={2} max={10} step={0.1} value={[width]} onValueChange={(v) => setWidth(v[0])} className="w-full" />
                       </div>

                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <Label className="text-white/80">Length</Label>
                           <span className="text-sm font-medium text-[#f3b5a1]">{length.toFixed(1)}m</span>
                         </div>
                         <Slider min={2} max={10} step={0.1} value={[length]} onValueChange={(v) => setLength(v[0])} className="w-full" />
                       </div>

                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <Label className="text-white/80">Height</Label>
                           <span className="text-sm font-medium text-[#f3b5a1]">{height.toFixed(1)}m</span>
                         </div>
                         <Slider min={2} max={4} step={0.1} value={[height]} onValueChange={(v) => setHeight(v[0])} className="w-full" />
                       </div>
                     </div>
                 </div>
               </div>

               {/* 4. Color Scheme */}
               <div className="space-y-4">
                 <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-white font-medium">4</span>
                     <h3 className="text-lg font-medium text-white">Color Preferences</h3>
                 </div>
                 
                 <div className="pl-8 space-y-6">
                     {/* Wall Color */}
                     <div className="space-y-3">
                       <Label className="text-white/80">Wall Color</Label>
                       <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                         {colorPresets.walls.map((preset) => (
                           <button
                             type="button"
                             key={preset.name}
                             onClick={() => setWallColor(preset.color)}
                             className={`relative h-10 rounded-lg border transition-all ${
                               wallColor === preset.color
                                 ? 'border-white ring-2 ring-white/30 scale-105'
                                 : 'border-white/20 hover:border-white/40'
                             }`}
                             style={{ backgroundColor: preset.color }}
                             title={preset.name}
                           >
                             {wallColor === preset.color && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-3 h-3 bg-white/90 rounded-full shadow-sm" />
                               </div>
                             )}
                           </button>
                         ))}
                       </div>
                       <div className="flex items-center gap-3">
                         <Label className="text-xs text-white/60">Custom:</Label>
                         <Input type="color" value={wallColor} onChange={(e) => setWallColor(e.target.value)} className="w-12 h-8 p-0 border-0 rounded" />
                         <span className="text-xs text-white/50 font-mono">{wallColor}</span>
                       </div>
                     </div>

                     {/* Floor Color */}
                     <div className="space-y-3">
                       <Label className="text-white/80">Floor Finish / Color</Label>
                       <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                         {colorPresets.floors.map((preset) => (
                           <button
                             type="button"
                             key={preset.name}
                             onClick={() => setFloorColor(preset.color)}
                             className={`relative h-10 rounded-lg border transition-all ${
                               floorColor === preset.color
                                 ? 'border-white ring-2 ring-white/30 scale-105'
                                 : 'border-white/20 hover:border-white/40'
                             }`}
                             style={{ backgroundColor: preset.color }}
                             title={preset.name}
                           >
                             {floorColor === preset.color && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-3 h-3 bg-white/90 rounded-full shadow-sm" />
                               </div>
                             )}
                           </button>
                         ))}
                       </div>
                       <div className="flex items-center gap-3">
                         <Label className="text-xs text-white/60">Custom:</Label>
                         <Input type="color" value={floorColor} onChange={(e) => setFloorColor(e.target.value)} className="w-12 h-8 p-0 border-0 rounded" />
                         <span className="text-xs text-white/50 font-mono">{floorColor}</span>
                       </div>
                     </div>
                 </div>
               </div>

               <div className="pt-6 mt-4 border-t border-white/10 flex gap-4 sticky bottom-0 bg-[#121c17] pb-2 z-10">
                 <Button type="button" onClick={() => setShowNewRequest(false)} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-12">
                    Cancel
                 </Button>
                 <Button type="submit" disabled={isProcessingPayment} className="flex-2 bg-[#f3b5a1] text-[#233529] hover:bg-[#f3b5a1]/90 rounded-xl font-medium shadow-[0_0_15px_rgba(243,181,161,0.3)] w-full h-12 text-base">
                    Pay $99 & Request Design
                 </Button>
               </div>
             </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
