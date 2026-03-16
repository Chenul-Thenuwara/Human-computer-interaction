"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDesign, Design, RoomData } from "@/lib/design-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout2D } from "@/components/design/Layout2D";
import { Visualization3D } from "@/components/design/Visualization3D";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Save, Layout, Box, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DesignRequest } from "@/types/design";

export default function DesignStudioPage() {
  const router = useRouter();
  // Always work with 'new' for now, or existing context
  const { currentDesign, activeRoomId, setActiveRoomId, addRoom, deleteRoom, setCurrentDesign, saveDesign } = useDesign();
  const { user, logout, isDesigner } = useAuth();
  const [activeTab, setActiveTab] = useState("2d");
  const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("New Room");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [tempDesignName, setTempDesignName] = useState("");
  const [tempCustomerName, setTempCustomerName] = useState("");

  useEffect(() => {
    const initializeDesign = async () => {
      if (currentDesign) return;

      const params = new URLSearchParams(window.location.search);
      const requestId = params.get("requestId");

      let finalRooms: RoomData[] = [{
        id: 'default',
        name: 'Main Room',
        room: {
          width: 5,
          length: 4,
          height: 2.7,
          wallColor: "#354840",
          floorColor: "#D4A574",
        },
        furniture: [],
      }];
      let customerName = "";
      let specialNotes = "";

      if (requestId) {
        try {
          const docRef = doc(db, "design_requests", requestId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const requestData = docSnap.data() as DesignRequest;
            
            // Prefer the multi-room format containing our drawn floor plan
            if (requestData.rooms && requestData.rooms.length > 0) {
               finalRooms = requestData.rooms;
            } else if (requestData.room) {
               // Fallback to legacy single-room if for some reason it's an old request
               finalRooms = [{
                  id: 'default',
                  name: 'Main Room',
                  room: {
                    width: requestData.room.width || 5,
                    length: requestData.room.length || 4,
                    height: requestData.room.height || 2.7,
                    wallColor: requestData.room.wallColor || "#354840",
                    floorColor: requestData.room.floorColor || "#D4A574",
                  },
                  furniture: []
               }];
            }
            
            customerName = requestData.customerName || "";
            specialNotes = requestData.specialNotes || "";

            // If it's the first time opening it, update status to in_progress
            if (requestData.status === "pending") {
               await updateDoc(docRef, { status: "in_progress" });
            }
          }
        } catch (error) {
          console.error("Error fetching request:", error);
          toast.error("Failed to load design request");
        }
      }

      const newDesign: Design = {
        id: Date.now().toString(),
        name: requestId ? "Client Request" : "Untitled Design",
        customerName: customerName,
        specialNotes: specialNotes,
        isLocked: !!requestId, // Lock dimensions if it came from a request
        rooms: finalRooms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store the requestId in the design object itself 
      // to link the completed design back to the request.
      if (requestId) {
        newDesign.requestId = requestId;
      }
      setCurrentDesign(newDesign);
    };

    initializeDesign();
  }, [currentDesign, setCurrentDesign]);

  const handleSave = () => {
    if (!currentDesign) return;
    setTempDesignName(currentDesign.name === "Untitled Design" ? "" : currentDesign.name);
    setTempCustomerName(currentDesign.customerName || "");
    setIsSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!currentDesign) return;

    if (!tempDesignName.trim()) {
      toast.error("Please enter a design name");
      return;
    }

    if (isDesigner && !tempCustomerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    const updatedDesign = {
      ...currentDesign,
      name: tempDesignName.trim(),
      customerName: isDesigner ? tempCustomerName.trim() : (user?.displayName || user?.email?.split('@')[0] || ""),
    };
    
    // Update local context first
    setCurrentDesign(updatedDesign);

    try {
      // Save the design using context
      await saveDesign(updatedDesign);

      // Link back to request if we have one
      const reqId = updatedDesign.requestId;
      if (reqId) {
         try {
           await updateDoc(doc(db, "design_requests", reqId), {
              status: "completed",
              designId: updatedDesign.id,
              updatedAt: new Date().toISOString()
           });
           toast.success("Design saved and request marked as completed!");
         } catch (error) {
           console.error("Error updating request:", error);
           toast.error("Design saved, but failed to link request.");
         }
      } else {
         toast.success("Design saved successfully!");
      }
      
      setIsSaveDialogOpen(false);
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  if (!currentDesign) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col relative text-white overflow-x-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-card/70 border-b border-white/20 sticky top-0 z-20 shadow-lg shadow-black/10"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </button>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    {currentDesign.name}
                  </h1>
                  {currentDesign.customerName && (
                    <p className="text-sm text-muted-foreground">
                      For: {currentDesign.customerName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex flex-col items-end gap-0.5 mr-2">
                    <span className="text-sm font-medium text-white">{user.displayName || user.email?.split('@')[0]}</span>
                    <span className="text-xs text-white/50">{user.email}</span>
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Design
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 overflow-hidden relative flex flex-col"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col flex-1"
          >
            <div className="backdrop-blur-xl bg-card/50 border-b border-white/20 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between py-2 md:py-0 gap-3 md:gap-0">
              {activeTab === "2d" ? (
                <div className="flex items-center gap-2 w-full md:w-auto z-10 mr-4 mt-2 md:mt-0">
                  <div className="flex items-center p-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full max-w-[60vw] overflow-x-auto hide-scrollbar">
                    {currentDesign.rooms?.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className={`px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap rounded-full ${
                          activeRoomId === room.id
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                        }`}
                      >
                        {room.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="default"
                      title="Add Room"
                      onClick={() => {
                        setNewRoomName("New Room");
                        setIsNewRoomDialogOpen(true);
                      }}
                      className="h-8 w-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    {currentDesign.rooms && currentDesign.rooms.length > 1 && (
                      <Button
                        size="icon"
                        variant="destructive"
                        title="Delete Room"
                        onClick={() => {
                          if (activeRoomId) {
                            setIsDeleteDialogOpen(true);
                          }
                        }}
                        className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 hover:scale-105 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full md:w-auto z-10 mr-4 mt-2 md:mt-0"></div>
              )}

              <TabsList className="w-full justify-start md:justify-center border-b-0 bg-transparent p-0 h-12 gap-2">
                <TabsTrigger
                  value="2d"
                  className="gap-2 h-10 rounded-full data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground text-muted-foreground px-8 min-w-40 transition-all"
                >
                  <Layout className="w-4 h-4" />
                  2D Layout
                </TabsTrigger>
                <TabsTrigger
                  value="3d"
                  className="gap-2 h-10 rounded-full data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground text-muted-foreground px-8 min-w-40 transition-all"
                >
                  <Box className="w-4 h-4" />
                  3D Visualization
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 bg-transparent flex flex-col relative">
              <TabsContent value="2d" className="h-full m-0 p-0 mt-0 overflow-hidden">
                <Layout2D />
              </TabsContent>
              <TabsContent value="3d" className="h-full m-0 p-0 mt-0">
                <Visualization3D />
              </TabsContent>
            </div>
          </Tabs>

          {/* New Room Dialog */}
          {isNewRoomDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                    Enter a name for the new room in your floor plan.
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
                          addRoom(newRoomName.trim());
                          setIsNewRoomDialogOpen(false);
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-white/20 bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewRoomDialogOpen(false)}
                      className="border-white/20 hover:bg-white/10 text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
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

          {/* Save Design Dialog */}
          {isSaveDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-card w-full max-w-sm rounded-xl border border-white/20 shadow-2xl p-6"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Design
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter details for this design before saving.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="design-name" className="text-sm font-medium text-foreground">
                      Design Name
                    </label>
                    <input
                      id="design-name"
                      type="text"
                      autoFocus
                      value={tempDesignName}
                      onChange={(e) => setTempDesignName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('customer-name')?.focus();
                        }
                      }}
                      placeholder="e.g. Modern Living Room"
                      className="flex h-10 w-full rounded-md border border-white/20 bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    />
                  </div>

                  {isDesigner && (
                    <div className="space-y-2">
                      <label htmlFor="customer-name" className="text-sm font-medium text-foreground">
                        Customer Name
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={tempCustomerName}
                        onChange={(e) => setTempCustomerName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmSave();
                        }}
                        placeholder="e.g. John Doe"
                        disabled={currentDesign.isLocked}
                        className="flex h-10 w-full rounded-md border border-white/20 bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsSaveDialogOpen(false)}
                      className="border-white/20 hover:bg-white/10 text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmSave}
                    >
                      Save Design
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Delete Room Confirmation Dialog */}
          {isDeleteDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="border-white/20 hover:bg-white/10 text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
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
    </ProtectedRoute>
  );
}
