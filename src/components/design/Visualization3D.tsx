"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Box } from "lucide-react";

export function Visualization3D() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="max-w-md w-full backdrop-blur-xl bg-card/70 border-white/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Box className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2 text-foreground">3D Visualization Coming Soon</h3>
          <p>This feature is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
