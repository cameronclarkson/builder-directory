import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { DealStage, KanbanDeal } from "./KanbanBoard";

interface MobileKanbanProps {
  deals: KanbanDeal[];
  onStageChange?: (dealId: number, newStage: DealStage) => void;
  onFindBuyers?: (dealId: number) => void;
}

const STAGES: DealStage[] = ["Lead", "Qualified", "Under Contract", "Closed", "Dead"];

const STAGE_COLORS: Record<DealStage, string> = {
  Lead: "bg-gray-100",
  Qualified: "bg-blue-50",
  "Under Contract": "bg-yellow-50",
  Closed: "bg-green-50",
  Dead: "bg-red-50",
};

export default function MobileKanban({ deals, onStageChange, onFindBuyers }: MobileKanbanProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const currentStage = STAGES[currentStageIndex];

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {} as Record<DealStage, KanbanDeal[]>);

  const stageDeals = dealsByStage[currentStage] || [];

  const goToPrevStage = () => {
    setCurrentStageIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextStage = () => {
    setCurrentStageIndex((prev) => Math.min(STAGES.length - 1, prev + 1));
  };

  const handleSwipe = (dealId: number, direction: "left" | "right") => {
    if (!onStageChange) return;

    const newIndex = direction === "left" ? currentStageIndex + 1 : currentStageIndex - 1;
    if (newIndex >= 0 && newIndex < STAGES.length) {
      onStageChange(dealId, STAGES[newIndex]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stage Navigation */}
      <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevStage}
          disabled={currentStageIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <h2 className="font-bold text-lg">{currentStage}</h2>
          <p className="text-xs text-muted-foreground">
            {stageDeals.length} {stageDeals.length === 1 ? "deal" : "deals"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextStage}
          disabled={currentStageIndex === STAGES.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stage Indicator Dots */}
      <div className="flex justify-center gap-2 py-3 bg-white border-b">
        {STAGES.map((stage, index) => (
          <button
            key={stage}
            onClick={() => setCurrentStageIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentStageIndex ? "w-8 bg-primary" : "w-2 bg-gray-300"
            }`}
            aria-label={`Go to ${stage}`}
          />
        ))}
      </div>

      {/* Deal Cards */}
      <div className={`flex-1 overflow-y-auto p-4 ${STAGE_COLORS[currentStage]}`}>
        {stageDeals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No deals in {currentStage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stageDeals.map((deal) => (
              <Card key={deal.id} className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/deals/${deal.id}`}>
                      <a className="hover:underline flex-1">
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

                  {/* Swipe Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    {currentStageIndex > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleSwipe(deal.id, "right")}
                      >
                        ← {STAGES[currentStageIndex - 1]}
                      </Button>
                    )}
                    {currentStageIndex < STAGES.length - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleSwipe(deal.id, "left")}
                      >
                        {STAGES[currentStageIndex + 1]} →
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
