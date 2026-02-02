import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Header with geometric accents */}
      <div className="relative overflow-hidden flex-1 flex items-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-48 -mt-48 opacity-40" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-50 rounded-full -mb-36 opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Buyer Directory
          </h1>
          <p className="text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
            Search and manage your buyer profiles—builders, developers, and investors. Access detailed information about active land buyers and their acquisition criteria.
          </p>
          <Link href="/directory">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
              Open Directory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
