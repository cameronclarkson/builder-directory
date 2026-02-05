import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "wouter";

export type DealStage = "Lead" | "Qualified" | "Under Contract" | "Closed" | "Dead";

export interface KanbanDeal {
  id: number;
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
  onStageChange?: (dealId: number, newStage: DealStage) => void;
  onFindBuyers?: (dealId: number) => void;
}

const STAGES: DealStage[] = ["Lead", "Qualified", "Under Contract", "Closed", "Dead"];

const STAGE_COLORS: Record<DealStage, string> = {
  Lead: "bg-gray-100 border-gray-300",
  Qualified: "bg-blue-50 border-blue-300",
  "Under Contract": "bg-yellow-50 border-yellow-300",
  Closed: "bg-green-50 border-green-300",
  Dead: "bg-red-50 border-red-300",
};

export default function KanbanBoard({ deals, onStageChange, onFindBuyers }: KanbanBoardProps) {
  const [draggedDeal, setDraggedDeal] = useState<number | null>(null);

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {} as Record<DealStage, KanbanDeal[]>);

  const handleDragStart = (dealId: number) => {
    setDraggedDeal(dealId);
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
                  onDragStart={() => handleDragStart(deal.id)}
                  className="cursor-move hover:shadow-lg transition-shadow bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/deals/${deal.id}`}>
                        <a className="hover:underline">
                          <CardTitle className="text-base">{deal.title}</CardTitle>
                        </a>
                      </Link>
                      {deal.deal_type && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {deal.deal_type}
                        </Badge>
                      )}
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
