"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDesign, Design } from "@/lib/design-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout2D } from "@/components/design/Layout2D";
import { Visualization3D } from "@/components/design/Visualization3D";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Save, Settings, Layout, Box, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DesignRequest } from "@/types/design";

export default function DesignStudioPage() {
  const router = useRouter();
  // Always work with 'new' for now, or existing context
  const { currentDesign, currentRoom, activeRoomId, setActiveRoomId, addRoom, deleteRoom, setCurrentDesign, saveDesign } = useDesign();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("2d");

  useEffect(() => {
    const initializeDesign = async () => {
      if (currentDesign) return;

      const params = new URLSearchParams(window.location.search);
      const requestId = params.get("requestId");

      let roomConfig = {
        width: 5,
        length: 4,
        height: 2.7,
        wallColor: "#354840",
        floorColor: "#D4A574",
      };

      let customerName = "";
      let specialNotes = "";

      if (requestId) {
        try {
          const docRef = doc(db, "design_requests", requestId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const requestData = docSnap.data() as DesignRequest;
            // Handle legacy request format or new mult-room format
            const requestRoom = requestData.rooms && requestData.rooms.length > 0 
                ? requestData.rooms[0].room 
                : requestData.room;
                
            if (requestRoom) {
              roomConfig = {
                width: requestRoom.width || roomConfig.width,
                length: requestRoom.length || roomConfig.length,
                height: requestRoom.height || roomConfig.height,
                wallColor: requestRoom.wallColor || roomConfig.wallColor,
                floorColor: requestRoom.floorColor || roomConfig.floorColor,
              };
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
        rooms: [{
          id: 'default',
          name: 'Main Room',
          room: roomConfig,
          furniture: [],
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // We could store the requestId in the design object itself or somewhere in context
      // to link the completed design back to the request.
        if (requestId) {
          newDesign.requestId = requestId;
        }
      setCurrentDesign(newDesign);
    };

    initializeDesign();
  }, [currentDesign, setCurrentDesign]);

  const handleSave = async () => {
    if (!currentDesign) return;

    if (!currentDesign.name || currentDesign.name === "Untitled Design") {
      toast.error("Please enter a design name");
      setActiveTab("2d");
      return;
    }

    if (!currentDesign.customerName) {
      toast.error("Please enter a customer name");
      setActiveTab("2d");
      return;
    }

    // Save the design using context
    saveDesign(currentDesign);

    // Link back to request if we have one
    const reqId = currentDesign.requestId;
    if (reqId) {
       try {
         await updateDoc(doc(db, "design_requests", reqId), {
            status: "completed",
            designId: currentDesign.id,
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
                      const name = prompt("Enter new room name:", "New Room");
                      if (name) addRoom(name);
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
                        if (activeRoomId && confirm("Delete this room?")) {
                          deleteRoom(activeRoomId);
                        }
                      }}
                      className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 hover:scale-105 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

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
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
