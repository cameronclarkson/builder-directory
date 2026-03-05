import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, DollarSign, TrendingUp, Eye, LayoutGrid, List, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import KanbanBoard from "@/components/KanbanBoard";
import MobileKanban from "@/components/MobileKanban";
import BuyerResearchDialog from "@/components/BuyerResearchDialog";
import EditDealDialog from "@/components/EditDealDialog";

export default function Deals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [researchDialogOpen, setResearchDialogOpen] = useState(false);
  const [selectedDealForResearch, setSelectedDealForResearch] = useState<{ id: number | string; title: string } | null>(null);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Fetch all deals with recommended buyers
  const { data: dealsWithMatches, isLoading } = trpc.deals.listWithMatches.useQuery();

  const updateStageMutation = trpc.deals.updateStage.useMutation({
    onSuccess: () => {
      utils.deals.listWithMatches.invalidate();
    },
  });

  const deleteDealMutation = trpc.deals.delete.useMutation({
    onSuccess: () => {
      utils.deals.listWithMatches.invalidate();
    },
  });

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
          
          {/* View Toggle - Desktop Only */}
          <div className="hidden md:flex gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {displayedDeals.length} of {dealsWithMatches?.length || 0} deals
        </div>
      </div>

      {/* Deals View */}
      <div className="container pb-12">
        {displayedDeals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No deals found matching your search.</p>
          </div>
        ) : viewMode === "kanban" ? (
          <>
            {/* Desktop Kanban */}
            <div className="hidden md:block">
              <KanbanBoard
                deals={displayedDeals.map((item) => ({
                  id: item.deal.id,
                  title: item.deal.title,
                  location: item.deal.location || undefined,
                  value: item.deal.value || undefined,
                  stage: (item.deal.stage || "Prospects") as any,
                  deal_type: item.deal.deal_type || undefined,
                  acreage: item.deal.acreage || undefined,
                  recommendedBuyersCount: item.recommendedBuyers.length,
                }))}
                onStageChange={(dealId, newStage) => {
                  console.log(`Move deal ${dealId} to ${newStage}`);
                  updateStageMutation.mutate({ dealId, stage: newStage });
                }}
                onFindBuyers={(dealId) => {
                  const deal = displayedDeals.find((d) => d.deal.id === String(dealId));
                  if (deal) {
                    setSelectedDealForResearch({ id: dealId as any, title: deal.deal.title });
                    setResearchDialogOpen(true);
                  }
                }}
                onEditDeal={(dealId) => {
                  const deal = displayedDeals.find((d) => d.deal.id === String(dealId));
                  if (deal) {
                    setEditingDeal(deal.deal);
                  }
                }}
                onDeleteDeal={(dealId) => {
                  if (window.confirm("Are you sure you want to delete this deal?")) {
                    deleteDealMutation.mutate({ dealId });
                  }
                }}
              />
            </div>
            
            {/* Mobile Kanban */}
            <div className="md:hidden h-[calc(100vh-300px)]">
              <MobileKanban
                deals={displayedDeals.map((item) => ({
                  id: item.deal.id,
                  title: item.deal.title,
                  location: item.deal.location || undefined,
                  value: item.deal.value || undefined,
                  stage: (item.deal.stage || "Prospects") as any,
                  deal_type: item.deal.deal_type || undefined,
                  acreage: item.deal.acreage || undefined,
                  recommendedBuyersCount: item.recommendedBuyers.length,
                }))}
                onStageChange={(dealId, newStage) => {
                  console.log(`Move deal ${dealId} to ${newStage}`);
                  updateStageMutation.mutate({ dealId, stage: newStage });
                }}
                onFindBuyers={(dealId) => {
                  const deal = displayedDeals.find((d) => d.deal.id === String(dealId));
                  if (deal) {
                    setSelectedDealForResearch({ id: dealId as any, title: deal.deal.title });
                    setResearchDialogOpen(true);
                  }
                }}
                onEditDeal={(dealId) => {
                  const deal = displayedDeals.find((d) => d.deal.id === String(dealId));
                  if (deal) {
                    setEditingDeal(deal.deal);
                  }
                }}
                onDeleteDeal={(dealId) => {
                  if (window.confirm("Are you sure you want to delete this deal?")) {
                    deleteDealMutation.mutate({ dealId });
                  }
                }}
              />
            </div>
          </>
        ) : (
          <div className="grid gap-6">
            {displayedDeals.map((item) => {
              const { deal, recommendedBuyers } = item;
              
              return (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/deals/${deal.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2 flex items-center justify-between">
                          {deal.title}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDeal(deal);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to delete this deal?")) {
                                  deleteDealMutation.mutate({ dealId: deal.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
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
                                        `I wanted to share an investment opportunity with you:\n\n` +
                                        `Property: ${deal.title}\n` +
                                        `Location: ${deal.location || 'N/A'}\n` +
                                        `Acreage: ${deal.acreage || 'N/A'}\n` +
                                        `Zoning: ${deal.zoning || 'N/A'}\n` +
                                        `Value: $${deal.value ? parseInt(deal.value).toLocaleString() : 'N/A'}\n\n` +
                                        `${deal.description || ''}\n\n` +
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

      {/* Buyer Research Dialog */}
      {selectedDealForResearch && (
        <BuyerResearchDialog
          open={researchDialogOpen}
          onOpenChange={setResearchDialogOpen}
          dealId={selectedDealForResearch.id}
          dealTitle={selectedDealForResearch.title}
        />
      )}

      {/* Edit Deal Dialog */}
      {editingDeal && (
        <EditDealDialog
          deal={editingDeal}
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
        />
      )}
    </div>
  );
}
