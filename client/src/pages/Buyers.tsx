import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import BuyerCard from "@/components/BuyerCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Buyers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [selectedBuyerType, setSelectedBuyerType] = useState<string>("all");

  // Fetch all contacts
  const { data: buyers, isLoading: buyersLoading } = trpc.contacts.list.useQuery();

  // Fetch filter options
  const { data: filters } = trpc.contacts.getFilters.useQuery();

  // Search contacts when query, market, or buyer type changes
  const { data: searchResults, isLoading: searchLoading } = trpc.contacts.search.useQuery(
    {
      query: searchQuery,
      market: selectedMarket,
      buyerType: selectedBuyerType,
    },
    {
      enabled: searchQuery.length > 0 || selectedMarket !== "all" || selectedBuyerType !== "all",
    }
  );

  // Determine which data to display
  const displayedBuyers = useMemo(() => {
    if (searchQuery.length > 0 || selectedMarket !== "all" || selectedBuyerType !== "all") {
      return searchResults || [];
    }
    return buyers || [];
  }, [buyers, searchResults, searchQuery, selectedMarket, selectedBuyerType]);

  const isLoading = buyersLoading || searchLoading;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMarket("all");
    setSelectedBuyerType("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Buyer Directory", href: "/directory" },
            ]}
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">Buyer Directory</h1>
          <p className="text-muted-foreground">
            Discover builders, developers, and investors actively acquiring properties
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Buyer Type Filter */}
            <Select value={selectedBuyerType} onValueChange={setSelectedBuyerType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by buyer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filters?.buyerTypes?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Market Filter */}
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {filters?.markets?.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={searchQuery === "" && selectedMarket === "all" && selectedBuyerType === "all"}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayedBuyers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No buyers found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {displayedBuyers.length} buyer{displayedBuyers.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Buyers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBuyers.map((buyer) => (
                <BuyerCard key={buyer.id} buyer={buyer} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
