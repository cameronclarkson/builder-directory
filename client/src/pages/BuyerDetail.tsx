import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  MapPin,
  Building2,
  Phone,
  Globe,
  Edit,
  Trash2,
  Briefcase,
  FileText,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import EditBuyerDialog from "@/components/EditBuyerDialog";

export default function BuyerDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const buyerId = params.id;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: buyer, isLoading } = trpc.contacts.getById.useQuery(
    { id: buyerId! },
    { enabled: !!buyerId }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      utils.contacts.search.invalidate();
      setLocation("/directory");
    },
  });

  const handleDelete = () => {
    if (buyerId) {
      deleteMutation.mutate({ id: buyerId });
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Buyer Directory", href: "/directory" },
            ]}
          />
          <p className="text-muted-foreground">Loading buyer details...</p>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Buyer Directory", href: "/directory" },
            ]}
          />
          <p className="text-muted-foreground">Buyer not found</p>
          <BackButton label="← Back to Buyer Directory" href="/directory" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-4xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Buyer Directory", href: "/directory" },
            { label: buyer.name || "Buyer Details", href: `/directory/${buyerId}` },
          ]}
        />

        <div className="mb-8">
          <BackButton label="← Back to Buyer Directory" href="/directory" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-bold text-foreground">{buyer.name}</h1>
                {buyer.buyer_type && (
                  <Badge variant="secondary" className="text-sm">
                    {buyer.buyer_type}
                  </Badge>
                )}
              </div>
              {buyer.company && (
                <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                  <Building2 className="w-5 h-5" />
                  {buyer.company}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {buyer.email && (
                <a
                  href={`mailto:${buyer.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {buyer.email}
                </a>
              )}
              {buyer.phone && (
                <p className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  {buyer.phone}
                </p>
              )}
              {buyer.website && (
                <a
                  href={buyer.website.startsWith("http") ? buyer.website : `https://${buyer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  {buyer.website}
                </a>
              )}
              {buyer.market && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {buyer.market}
                </p>
              )}
              {!buyer.email && !buyer.phone && !buyer.website && !buyer.market && (
                <p className="text-muted-foreground text-sm">No contact information added yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Buy box */}
          {buyer.buy_box && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buy Box</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{buyer.buy_box}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {buyer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{buyer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {isEditDialogOpen && (
          <EditBuyerDialog
            buyer={buyer}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete buyer?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {buyer.name} from the buyer directory. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
