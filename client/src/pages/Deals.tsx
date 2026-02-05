import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, DollarSign, TrendingUp, Eye } from "lucide-react";
import { useLocation } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Deals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch all deals with recommended buyers
  const { data: dealsWithMatches, isLoading } = trpc.deals.listWithMatches.useQuery();

  // Filter deals by search query
  const displayedDeals = useMemo(() => {
    if (!dealsWithMatches) return [];
    
    if (searchQuery.length === 0) return dealsWithMatches;
    
    const query = searchQuery.toLowerCase();
    return dealsWithMatches.filter((item) => {
      const deal = item.deal;
      return (
        deal.title?.toLowerCase().includes(query) ||
        deal.location?.toLowerCase().includes(query) ||
        deal.description?.toLowerCase().includes(query)
      );
    });
  }, [dealsWithMatches, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container py-8">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Deal Pipeline", href: "/deals" },
              ]}
            />
            <h1 className="text-4xl font-bold text-foreground mb-2">Deal Pipeline</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Deal Pipeline", href: "/deals" },
            ]}
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            Browse active deals with AI-powered buyer recommendations
          </p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container py-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search deals by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {displayedDeals.length} of {dealsWithMatches?.length || 0} deals
        </div>
      </div>

      {/* Deals Grid */}
      <div className="container pb-12">
        {displayedDeals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No deals found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {displayedDeals.map((item) => {
              const { deal, recommendedBuyers } = item;
              
              return (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/deals/${deal.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{deal.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                          {deal.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{deal.location}</span>
                            </div>
                          )}
                          {deal.value && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${parseInt(deal.value).toLocaleString()}</span>
                            </div>
                          )}
                          {deal.stage && (
                            <Badge variant="outline">{deal.stage}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {deal.description && (
                      <p className="text-sm text-foreground mb-4">{deal.description}</p>
                    )}
                    
                    {/* Recommended Buyers */}
                    {recommendedBuyers.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-sm">Top Recommended Buyers</h3>
                        </div>
                        
                        <div className="space-y-2">
                          {recommendedBuyers.map((match, idx) => {
                            const { contact, score, matchBreakdown } = match;
                            
                            return (
                              <div
                                key={contact.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-sm">{contact.name}</span>
                                    {contact.company && contact.company !== "Unknown" && (
                                      <span className="text-xs text-muted-foreground">
                                        @ {contact.company}
                                      </span>
                                    )}
                                    {contact.buyer_type && (
                                      <Badge variant="secondary" className="text-xs">
                                        {contact.buyer_type}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {contact.market && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {contact.market}
                                    </p>
                                  )}
                                  
                                  {/* Match Breakdown */}
                                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                    {matchBreakdown.geographic > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        Location: {matchBreakdown.geographic}
                                      </Badge>
                                    )}
                                    {matchBreakdown.acreage > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        Acreage: {matchBreakdown.acreage}
                                      </Badge>
                                    )}
                                    {matchBreakdown.lotCount > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        Lots: {matchBreakdown.lotCount}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-bold text-primary">
                                      {score}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Match Score
                                    </div>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="flex-1 sm:flex-none whitespace-nowrap"
                                    onClick={() => {
                                      const subject = encodeURIComponent(`${deal.title} - Investment Opportunity`);
                                      const body = encodeURIComponent(
                                        `Hi ${contact.name},\n\n` +
                                        `I wanted to share an investment opportunity that matches your acquisition criteria:\n\n` +
                                        `Property: ${deal.title}\n` +
                                        `Location: ${deal.location || 'N/A'}\n` +
                                        `Acreage: ${deal.acreage || 'N/A'}\n` +
                                        `Zoning: ${deal.zoning || 'N/A'}\n` +
                                        `Value: $${deal.value ? parseInt(deal.value).toLocaleString() : 'N/A'}\n` +
                                        `Stage: ${deal.stage || 'N/A'}\n\n` +
                                        `${deal.description || ''}\n\n` +
                                        `This property scored ${score}/100 against your buy box criteria. ` +
                                        `I'd love to discuss this opportunity with you.\n\n` +
                                        `Best regards,\n` +
                                        `Cameron Clarkson\n` +
                                        `Clarkson Capital`
                                      );
                                      const mailtoLink = contact.email 
                                        ? `mailto:${contact.email}?subject=${subject}&body=${body}`
                                        : `mailto:?subject=${subject}&body=${body}`;
                                      window.location.href = mailtoLink;
                                    }}
                                  >
                                    Send to Buyer
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          No buyer recommendations available for this deal.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
