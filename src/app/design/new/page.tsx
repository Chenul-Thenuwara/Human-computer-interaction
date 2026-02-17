"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDesign, Design } from "@/lib/design-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomSetup } from "@/components/design/RoomSetup";
import { Layout2D } from "@/components/design/Layout2D";
import { Visualization3D } from "@/components/design/Visualization3D";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Save, Settings, Layout, Box, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function DesignStudioPage() {
  // Always work with 'new' for now, or existing context
  const { currentDesign, setCurrentDesign, saveDesign } = useDesign();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("setup");

  useEffect(() => {
    // If no design exists, initialize a new one
    if (!currentDesign) {
      const newDesign: Design = {
        id: Date.now().toString(),
        name: "Untitled Design",
        customerName: "",
        room: {
          width: 5,
          length: 4,
          height: 2.7,
          wallColor: "#354840",
          floorColor: "#D4A574",
        },
        furniture: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentDesign(newDesign);
    }
  }, [currentDesign, setCurrentDesign]);

  const handleSave = () => {
    if (!currentDesign) return;

    if (!currentDesign.name || currentDesign.name === "Untitled Design") {
      toast.error("Please enter a design name");
      setActiveTab("setup");
      return;
    }

    if (!currentDesign.customerName) {
      toast.error("Please enter a customer name");
      setActiveTab("setup");
      return;
    }

    saveDesign(currentDesign);
    toast.success("Design saved successfully!");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
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
      <div className="min-h-screen flex flex-col relative bg-background text-foreground">
        {/* Background grid pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Decorative gradient orbs */}
        <div className="fixed top-0 left-0 w-150 h-150 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-125 h-125 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="backdrop-blur-xl bg-card/70 border-b border-white/20 sticky top-0 z-20 shadow-lg shadow-black/10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
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
              <div className="flex items-center gap-2">
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
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col flex-1"
          >
            <div className="backdrop-blur-xl bg-card/50 border-b border-white/20 px-4 sm:px-6 lg:px-8">
              <TabsList className="w-full justify-start md:justify-center border-b-0 bg-transparent p-0 h-12 gap-2">
                <TabsTrigger
                  value="setup"
                  className="gap-2 h-10 rounded-full data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground text-muted-foreground px-8 min-w-40 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Room Setup
                </TabsTrigger>
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
            <TabsContent value="setup" className="h-full m-0 p-0 mt-0 overflow-auto">
              <RoomSetup />
            </TabsContent>
            <TabsContent value="2d" className="h-full m-0 p-0 mt-0 overflow-hidden">
              <Layout2D />
            </TabsContent>
            <TabsContent value="3d" className="h-full m-0 p-0 mt-0">
              <Visualization3D />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
