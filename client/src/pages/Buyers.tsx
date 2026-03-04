import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import BuyerCard from "@/components/BuyerCard";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronDown } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Buyers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedBuyerTypes, setSelectedBuyerTypes] = useState<string[]>([]);

  // Fetch all contacts
  const { data: buyers, isLoading: buyersLoading } = trpc.contacts.list.useQuery();

  // Fetch filter options
  const { data: filters } = trpc.contacts.getFilters.useQuery();

  // Search contacts when query, market, or buyer type changes
  const { data: searchResults, isLoading: searchLoading } = trpc.contacts.search.useQuery(
    {
      query: searchQuery,
      market: selectedMarkets,
      buyerType: selectedBuyerTypes,
    },
    {
      enabled: searchQuery.length > 0 || selectedMarkets.length > 0 || selectedBuyerTypes.length > 0,
    }
  );

  // Determine which data to display
  const displayedBuyers = useMemo(() => {
    if (searchQuery.length > 0 || selectedMarkets.length > 0 || selectedBuyerTypes.length > 0) {
      return searchResults || [];
    }
    return buyers || [];
  }, [buyers, searchResults, searchQuery, selectedMarkets, selectedBuyerTypes]);

  const isLoading = buyersLoading || searchLoading;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMarkets([]);
    setSelectedBuyerTypes([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
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
      <div className="bg-card border-b border-border sticky top-0 z-10">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className="truncate">
                    {selectedBuyerTypes.length === 0
                      ? "Filter by buyer type"
                      : selectedBuyerTypes.length === 1
                      ? selectedBuyerTypes[0]
                      : `${selectedBuyerTypes.length} types selected`}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuCheckboxItem
                  checked={selectedBuyerTypes.length === 0}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedBuyerTypes([]);
                  }}
                >
                  All Types
                </DropdownMenuCheckboxItem>
                {filters?.buyerTypes?.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={selectedBuyerTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBuyerTypes([...selectedBuyerTypes, type]);
                      } else {
                        setSelectedBuyerTypes(selectedBuyerTypes.filter((t) => t !== type));
                      }
                    }}
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Market Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className="truncate">
                    {selectedMarkets.length === 0
                      ? "Filter by market"
                      : selectedMarkets.length === 1
                      ? selectedMarkets[0]
                      : `${selectedMarkets.length} markets selected`}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuCheckboxItem
                  checked={selectedMarkets.length === 0}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedMarkets([]);
                  }}
                >
                  All Markets
                </DropdownMenuCheckboxItem>
                {filters?.markets?.map((market) => (
                  <DropdownMenuCheckboxItem
                    key={market}
                    checked={selectedMarkets.includes(market)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMarkets([...selectedMarkets, market]);
                      } else {
                        setSelectedMarkets(selectedMarkets.filter((m) => m !== market));
                      }
                    }}
                  >
                    {market}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={searchQuery === "" && selectedMarkets.length === 0 && selectedBuyerTypes.length === 0}
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
