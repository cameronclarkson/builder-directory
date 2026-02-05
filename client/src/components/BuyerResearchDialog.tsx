import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Search, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface BuyerResearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: number;
  dealTitle: string;
}

export default function BuyerResearchDialog({
  open,
  onOpenChange,
  dealId,
  dealTitle,
}: BuyerResearchDialogProps) {
  const [researchMode, setResearchMode] = useState<"deep" | "wide" | null>(null);
  
  const researchMutation = trpc.deals.researchBuyers.useMutation({
    onSuccess: (data) => {
      console.log("Research complete:", data);
      // TODO: Display results
    },
    onError: (error) => {
      console.error("Research failed:", error);
    },
  });

  const handleResearch = (mode: "deep" | "wide") => {
    setResearchMode(mode);
    researchMutation.mutate({ dealId, mode });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Find Buyers for {dealTitle}
          </DialogTitle>
          <DialogDescription>
            Use AI-powered research to discover potential buyers outside your database
          </DialogDescription>
        </DialogHeader>

        {researchMutation.isPending ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              {researchMode === "deep"
                ? "Conducting deep research to find detailed buyer profiles..."
                : "Conducting wide research to discover potential buyers across multiple sources..."}
            </p>
          </div>
        ) : researchMutation.isSuccess ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900">Research Complete!</p>
              <p className="text-sm text-green-700 mt-1">
                Found {researchMutation.data?.buyersFound || 0} potential buyers
              </p>
            </div>

            {/* TODO: Display research results */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Research Results</h4>
              <p className="text-sm text-muted-foreground">
                Results will be displayed here once implemented.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deep Research */}
              <button
                onClick={() => handleResearch("deep")}
                className="flex flex-col items-start p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Deep Research</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  In-depth analysis to find detailed buyer profiles, acquisition criteria, and
                  contact information
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Detailed buyer profiles</li>
                  <li>• Acquisition criteria analysis</li>
                  <li>• Contact information</li>
                  <li>• Investment history</li>
                </ul>
              </button>

              {/* Wide Research */}
              <button
                onClick={() => handleResearch("wide")}
                className="flex flex-col items-start p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Wide Research</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Broad search across multiple sources to discover a large pool of potential
                  buyers
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Multiple source search</li>
                  <li>• Large buyer pool</li>
                  <li>• Quick discovery</li>
                  <li>• Market coverage</li>
                </ul>
              </button>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
