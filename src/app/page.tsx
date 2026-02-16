import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sofa } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <div className="p-4 bg-primary/10 rounded-full">
          <Sofa className="w-16 h-16 text-primary" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Furniture Visualization App
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to the new home of the Furniture Visualization App. 
            Start designing your dream room today.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/design/new">
            <Button size="lg" className="text-lg px-8">
              Create New Design
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
