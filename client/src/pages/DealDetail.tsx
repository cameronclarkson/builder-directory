import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, MapPin, DollarSign, Home, Building2, Users, Edit } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import EditDealDialog from "@/components/EditDealDialog";

export default function DealDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const dealId = params.id;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: dealWithMatches, isLoading } = trpc.deals.getById.useQuery(
    { dealId: dealId! },
    { enabled: !!dealId }
  );

  const logInteractionMutation = trpc.interactions.logDealSubmission.useMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-6xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Deal Pipeline", href: "/deals" },
            ]}
          />
          <p className="text-muted-foreground">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (!dealWithMatches) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-6xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Deal Pipeline", href: "/deals" },
            ]}
          />
          <p className="text-muted-foreground">Deal not found</p>
          <BackButton label="← Back to Deals" href="/deals" />
        </div>
      </div>
    );
  }

  const { deal, recommendedBuyers, sourceContact } = dealWithMatches;

  const handleSendToBuyer = (buyerEmail: string, buyerName: string, contactId: string) => {
    const subject = `Investment Opportunity: ${deal.title}`;
    const body = `Hi ${buyerName},

I wanted to share an investment opportunity with you:

Property: ${deal.title}
Location: ${deal.location || "N/A"}
${deal.acreage ? `Acreage: ${deal.acreage} acres` : ""}
${deal.zoning ? `Zoning: ${deal.zoning}` : ""}
${deal.value ? `Value: $${parseFloat(deal.value).toLocaleString()}` : ""}

${deal.description || ""}

Let me know if you'd like more information or want to schedule a site visit.

Best regards,
Cameron Clarkson
Clarkson Capital`;

    // Log the interaction
    logInteractionMutation.mutate({
      dealId: deal.id,
      contactId,
      notes: `Sent via email to ${buyerEmail}`,
    });

    window.location.href = `mailto:${buyerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Deal Pipeline", href: "/deals" },
            { label: deal.title || "Deal Details", href: `/deals/${dealId}` },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <BackButton label="← Back to Deals" href="/deals" />

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                {deal.title}
                <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </h1>
              {deal.location && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {deal.location}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{deal.deal_type || "Real Estate"}</Badge>
              <Badge>{deal.stage || "Prospects"}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{deal.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {deal.acreage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Acreage</p>
                      <p className="font-semibold">{deal.acreage} acres</p>
                    </div>
                  )}
                  {deal.zoning && (
                    <div>
                      <p className="text-sm text-muted-foreground">Zoning</p>
                      <p className="font-semibold">{deal.zoning}</p>
                    </div>
                  )}
                  {deal.value && (
                    <div>
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-semibold flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {parseFloat(deal.value).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {deal.deal_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Deal Type</p>
                      <p className="font-semibold">{deal.deal_type}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Source Contact */}
            {sourceContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Deal Source</CardTitle>
                  <CardDescription>Contact who provided this opportunity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{sourceContact.name}</p>
                      {sourceContact.company && (
                        <p className="text-sm text-muted-foreground">{sourceContact.company}</p>
                      )}
                      {sourceContact.email && (
                        <p className="text-sm text-muted-foreground">{sourceContact.email}</p>
                      )}
                    </div>
                    {sourceContact.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `mailto:${sourceContact.email}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Recommended Buyers */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recommended Buyers
                </CardTitle>
                <CardDescription>
                  {recommendedBuyers.length > 0
                    ? `${recommendedBuyers.length} buyers match this deal`
                    : "No buyer recommendations available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedBuyers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No buyers match the criteria for this deal. Try updating buyer profiles with more detailed buy box information.
                  </p>
                ) : (
                  recommendedBuyers.map((match) => (
                    <div key={match.contact.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <p className="font-semibold">{match.contact.name}</p>
                        {match.contact.company && (
                          <p className="text-sm text-muted-foreground">{match.contact.company}</p>
                        )}
                        <Badge variant="secondary" className="mt-1">
                          {match.contact.buyer_type}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                          <p className="text-2xl font-bold">{match.score}</p>
                        </div>
                        <div className="text-right text-xs space-y-1">
                          <p>Location: {match.matchBreakdown.geographic}</p>
                          <p>Acreage: {match.matchBreakdown.acreage}</p>
                          <p>Zoning: {match.matchBreakdown.zoning}</p>
                        </div>
                      </div>

                      {match.contact.email && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            handleSendToBuyer(
                              match.contact.email!,
                              match.contact.name,
                              match.contact.id.toString()
                            )
                          }
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send to Buyer
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {isEditDialogOpen && (
        <EditDealDialog
          deal={deal}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
