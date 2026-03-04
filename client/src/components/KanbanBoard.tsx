import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, TrendingUp, Sparkles, Edit } from "lucide-react";
import { Link } from "wouter";

export type DealStage = "Lead" | "Qualified" | "Under Contract" | "Closed" | "Dead";

export interface KanbanDeal {
  id: number | string;
  title: string;
  location?: string;
  value?: string;
  stage: DealStage;
  deal_type?: string;
  acreage?: string;
  recommendedBuyersCount: number;
}

interface KanbanBoardProps {
  deals: KanbanDeal[];
  onStageChange?: (dealId: number | string, newStage: DealStage) => void;
  onFindBuyers?: (dealId: number | string) => void;
  onEditDeal?: (dealId: number | string) => void;
}

const STAGES: DealStage[] = ["Lead", "Qualified", "Under Contract", "Closed", "Dead"];

const STAGE_COLORS: Record<DealStage, string> = {
  Lead: "bg-muted/50 border-border",
  Qualified: "bg-primary/5 border-primary/30",
  "Under Contract": "bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/30 dark:border-amber-400/30",
  Closed: "bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/30",
  Dead: "bg-destructive/10 border-destructive/30",
};

export default function KanbanBoard({ deals, onStageChange, onFindBuyers, onEditDeal }: KanbanBoardProps) {
  const [draggedDeal, setDraggedDeal] = useState<number | string | null>(null);

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {} as Record<DealStage, KanbanDeal[]>);

  const handleDragStart = (e: React.DragEvent, dealId: number | string) => {
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: DealStage) => {
    if (draggedDeal && onStageChange) {
      onStageChange(draggedDeal, stage);
    }
    setDraggedDeal(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {STAGES.map((stage) => {
        const stageDeals = dealsByStage[stage] || [];
        return (
          <div
            key={stage}
            className={`flex-shrink-0 w-80 ${STAGE_COLORS[stage]} rounded-lg border-2 p-4`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage)}
          >
            {/* Column Header */}
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-1">{stage}</h3>
              <p className="text-sm text-muted-foreground">
                {stageDeals.length} {stageDeals.length === 1 ? "deal" : "deals"}
              </p>
            </div>

            {/* Deal Cards */}
            <div className="space-y-3">
              {stageDeals.map((deal) => (
                <Card
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  className="cursor-move hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/deals/${deal.id}`}>
                        <a className="hover:underline flex-1">
                          <CardTitle className="text-base">{deal.title}</CardTitle>
                        </a>
                      </Link>
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEditDeal?.(deal.id);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {deal.deal_type && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {deal.deal_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {deal.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {deal.location}
                      </p>
                    )}
                    {deal.value && (
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {parseFloat(deal.value).toLocaleString()}
                      </p>
                    )}
                    {deal.acreage && (
                      <p className="text-xs text-muted-foreground">{deal.acreage} acres</p>
                    )}

                    {/* Buyer Recommendations */}
                    {deal.recommendedBuyersCount > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-primary pt-2">
                        <TrendingUp className="h-3 w-3" />
                        <span>{deal.recommendedBuyersCount} buyer matches</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 text-xs"
                        onClick={() => onFindBuyers?.(deal.id)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Find Buyers
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
