import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with geometric accents */}
      <div className="relative overflow-hidden flex-1 flex items-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 opacity-40" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent/20 rounded-full -mb-36 opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4">
            Buyer Directory
          </h1>
          <p className="text-xl text-muted-foreground font-light mb-12 max-w-2xl mx-auto">
            Search and manage your buyer profiles—builders, developers, and investors. Access detailed information about active land buyers and their acquisition criteria.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/directory">
              <Button size="lg">
                Buyer Directory
              </Button>
            </Link>
            <Link href="/deals">
              <Button size="lg" variant="outline">
                Deal Pipeline
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
