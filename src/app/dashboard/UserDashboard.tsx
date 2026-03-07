"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { useDesign, DesignProvider, Design } from "@/lib/design-context";
import { Layout2D } from "@/components/design/Layout2D";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, CheckCircle, ChevronRight, ChevronLeft, Armchair, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DesignRequest } from "@/types/design";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

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
  const [requestRoomIndices, setRequestRoomIndices] = useState<Record<string, number>>({});

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
          rooms: [{
            id: 'default',
            name: 'Main Room',
            room: {
              width: Number(width),
              length: Number(length),
              height: Number(height),
              wallColor: wallColor,
              floorColor: floorColor
            },
            furniture: []
          }],
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
            <p className="text-sm text-white/60 mt-2">Completed: {completedCount}</p>
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
              <p className="text-white/50 mb-6">You haven&apos;t requested any designs yet.</p>
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
                       {(() => {
                         const roomsList = request.rooms && request.rooms.length > 0 
                            ? request.rooms 
                            : (request.room ? [{ id: 'default', name: 'Main Room', room: request.room, furniture: [] } as any] : []);
                         
                         if (roomsList.length === 0) return null;
                         
                         const roomIndex = requestRoomIndices[request.id] || 0;
                         const currentRoomData = roomsList[roomIndex];
                         const reqRoom = currentRoomData?.room;
                         if (!reqRoom) return null;

                         return (
                           <div className="mt-2">
                             {roomsList.length > 1 && (
                               <div className="flex items-center gap-2 mb-1">
                                 <button 
                                   onClick={() => setRequestRoomIndices(prev => ({ ...prev, [request.id]: Math.max(0, roomIndex - 1) }))}
                                   disabled={roomIndex === 0}
                                   className="p-0.5 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                 >
                                   <ChevronLeft className="w-3 h-3 text-white/70" />
                                 </button>
                                 <span className="text-xs font-medium text-white/70">{currentRoomData.name || `Room ${roomIndex + 1}`}</span>
                                 <button 
                                   onClick={() => setRequestRoomIndices(prev => ({ ...prev, [request.id]: Math.min(roomsList.length - 1, roomIndex + 1) }))}
                                   disabled={roomIndex === roomsList.length - 1}
                                   className="p-0.5 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                 >
                                   <ChevronRight className="w-3 h-3 text-white/70" />
                                 </button>
                               </div>
                             )}
                             <p className="text-sm text-white/50 font-light">
                               Dimensions: {reqRoom.width}x{reqRoom.length}x{reqRoom.height}m
                             </p>
                           </div>
                         );
                       })()}
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
        <NewRequestModal 
          onClose={() => setShowNewRequest(false)} 
          designers={designers} 
          user={user} 
        />
      )}
    </div>
  );
}

// Extract modal into separate component to easily wrap with DesignProvider
function NewRequestModal({ onClose, designers, user }: { onClose: () => void, designers: Designer[], user: any }) {
  const [customerName, setCustomerName] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [selectedDesigner, setSelectedDesigner] = useState<string>(designers[0]?.id || "");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // We capture the Design context data via a child component that reads it on submit
  return (
    <DesignProvider>
      <NewRequestModalContent 
        onClose={onClose}
        designers={designers}
        user={user}
        customerName={customerName}
        setCustomerName={setCustomerName}
        specialNotes={specialNotes}
        setSpecialNotes={setSpecialNotes}
        selectedDesigner={selectedDesigner}
        setSelectedDesigner={setSelectedDesigner}
        isProcessingPayment={isProcessingPayment}
        setIsProcessingPayment={setIsProcessingPayment}
      />
    </DesignProvider>
  );
}

function NewRequestModalContent({ 
  onClose, designers, user,
  customerName, setCustomerName,
  specialNotes, setSpecialNotes,
  selectedDesigner, setSelectedDesigner,
  isProcessingPayment, setIsProcessingPayment
}: any) {
  const { currentDesign, setCurrentDesign, activeRoomId, setActiveRoomId, addRoom, deleteRoom } = useDesign();
  const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("New Room");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign({
        id: "new-request-temp",
        name: "New Request Outline",
        customerName: "",
        rooms: [{
          id: 'default',
          name: 'Main Room',
          room: { width: 5, length: 4, height: 2.7, wallColor: '#FFFFFF', floorColor: '#D4A574', position: { x: 0, z: 0 } },
          furniture: []
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }, [currentDesign, setCurrentDesign]);

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
          rooms: currentDesign?.rooms || [],
          room: currentDesign?.rooms?.[0]?.room || {
             width: 5, length: 4, height: 2.7, wallColor: '#FFFFFF', floorColor: '#D4A574'
          },
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await addDoc(collection(db, "design_requests"), newRequest);
        onClose();
      } catch (error) {
        console.error("Error creating request:", error);
        alert("Failed to submit request.");
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000); // 2 seconds mock payment
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 py-8 overflow-y-auto w-full h-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#121c17] border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
      >
        {isProcessingPayment && (
          <div className="absolute inset-0 z-50 bg-[#121c17]/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#f3b5a1]/30 border-t-[#f3b5a1] rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-white tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>Processing Payment...</p>
            <p className="text-sm text-white/50 mt-2">Mocking transaction ($99.00)</p>
          </div>
        )}

        <div className="p-6 md:p-8 flex-shrink-0 border-b border-white/10">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-italiana)" }}>Request New Design</h2>
            <button type="button" onClick={onClose} className="text-white/50 hover:text-white p-2">✕</button>
          </div>
          <p className="text-white/50 text-sm">Configure your room details and select a designer. Price: $99.00</p>
        </div>

        <form onSubmit={handleCreateRequest} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-10 custom-scrollbar">
            
            {/* 1. Project Details & Designer (Grid Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <div className="space-y-4">
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
                      {designers.map((d: any) => (
                        <option key={d.id} value={d.id} className="bg-black text-white">{d.name}</option>
                      ))}
                    </select>
                </div>
              </div>
            </div>

            {/* 3. Floor Plan Builder */}
            <div className="space-y-4 h-[600px] flex flex-col">
              <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-white font-medium">3</span>
                  <div className="flex-1 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Build Your Floor Plan</h3>
                    
                    {/* Room Tabs */}
                    {currentDesign && currentDesign.rooms && (
                      <div className="flex items-center gap-2 z-10">
                        <div className="flex items-center p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full max-w-[40vw] overflow-x-auto hide-scrollbar">
                          {currentDesign.rooms.map((room) => (
                            <button
                              type="button"
                              key={room.id}
                              onClick={() => setActiveRoomId(room.id)}
                              className={`px-3 py-1 text-xs font-medium transition-all whitespace-nowrap rounded-full ${
                                activeRoomId === room.id
                                  ? "bg-[#f3b5a1] text-[#233529] shadow-md"
                                  : "text-white/60 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              {room.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="default"
                            onClick={() => {
                              setNewRoomName("New Room");
                              setIsNewRoomDialogOpen(true);
                            }}
                            className="h-7 w-7 rounded-full shadow-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-105 transition-transform"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          {currentDesign.rooms.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                if (activeRoomId) {
                                  setIsDeleteDialogOpen(true);
                                }
                              }}
                              className="h-7 w-7 rounded-full opacity-80 hover:opacity-100 bg-red-500/20 text-red-400 hover:scale-105 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
              </div>
              <div className="pl-8 flex-1 w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-black/20 relative">
                 <Layout2D mode="builder" />
              </div>
            </div>

          </div>

          <div className="p-6 md:p-8 flex-shrink-0 border-t border-white/10 flex gap-4 bg-[#121c17] z-10 w-full relative">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 max-w-[200px] border-white/20 text-white hover:bg-white/10 rounded-xl h-12">
               Cancel
            </Button>
            <Button type="submit" disabled={isProcessingPayment} className="flex-1 bg-[#f3b5a1] text-[#233529] hover:bg-[#f3b5a1]/90 rounded-xl font-medium shadow-[0_0_15px_rgba(243,181,161,0.3)] h-12 text-base">
               Pay $99 & Request Design
            </Button>
          </div>
        </form>

        {/* New Room Dialog */}
        {isNewRoomDialogOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card w-full max-w-sm rounded-xl border border-white/20 shadow-2xl p-6"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Room
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a name for the new room.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="room-name" className="text-sm font-medium text-foreground">
                    Room Name
                  </label>
                  <input
                    id="room-name"
                    type="text"
                    autoFocus
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newRoomName.trim()) {
                        e.preventDefault();
                        addRoom(newRoomName.trim());
                        setIsNewRoomDialogOpen(false);
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-white/20 bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewRoomDialogOpen(false)}
                    className="border-white/20 hover:bg-white/10 text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (newRoomName.trim()) {
                        addRoom(newRoomName.trim());
                        setIsNewRoomDialogOpen(false);
                      }
                    }}
                  >
                    Add Room
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Room Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card w-full max-w-sm rounded-xl border border-white/20 shadow-2xl p-6"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  Delete Room
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete this room? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="border-white/20 hover:bg-white/10 text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (activeRoomId) {
                      deleteRoom(activeRoomId);
                    }
                    setIsDeleteDialogOpen(false);
                  }}
                >
                  Delete Room
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
