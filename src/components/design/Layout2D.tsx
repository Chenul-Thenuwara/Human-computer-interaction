"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "lucide-react";

export function Layout2D() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="max-w-md w-full backdrop-blur-xl bg-card/70 border-white/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Layout className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2 text-foreground">2D Layout Coming Soon</h3>
          <p>This feature is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
