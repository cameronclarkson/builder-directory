import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ContactCard } from "@/components/ContactCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [focusFilter, setFocusFilter] = useState("all");

  // Fetch contacts based on filters
  const { data: contacts, isLoading: contactsLoading } = trpc.contacts.search.useQuery(
    {
      query: searchQuery,
      status: statusFilter === "all" ? undefined : statusFilter,
      focus: focusFilter === "all" ? undefined : focusFilter,
    },
    {
      enabled: true,
    }
  );

  // Fetch available filters
  const { data: filters, isLoading: filtersLoading } =
    trpc.contacts.getFilters.useQuery();

  const isLoading = contactsLoading || filtersLoading;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setFocusFilter("all");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || focusFilter !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header with geometric accent */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-48 -mt-48 opacity-40" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-50 rounded-full -mb-36 opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Builder Directory
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Search and filter builder contacts
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by name, company, email, or focus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-300 focus:bg-white"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filters?.statuses?.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus
                </label>
                <Select value={focusFilter} onValueChange={setFocusFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Focuses</SelectItem>
                    {filters?.focuses?.map((focus) => (
                      <SelectItem key={focus} value={focus}>
                        {focus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <X size={16} className="mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-64 animate-pulse"
              />
            ))}
          </div>
        ) : contacts && contacts.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold text-gray-900">{contacts.length}</span> contact{contacts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-2">No contacts found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
