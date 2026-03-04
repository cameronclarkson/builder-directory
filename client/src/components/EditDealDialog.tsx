import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const editDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  value: z.string().optional(),
  acreage: z.string().optional(),
  zoning: z.string().optional(),
  deal_type: z.string().optional(),
  stage: z.string().optional(),
});

type EditDealFormValues = z.infer<typeof editDealSchema>;

interface EditDealDialogProps {
  deal: {
    id: string;
    title: string;
    location: string | null;
    description: string | null;
    value: string | null;
    acreage: string | null;
    zoning: string | null;
    deal_type: string | null;
    stage: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDealDialog({
  deal,
  open,
  onOpenChange,
}: EditDealDialogProps) {
  const utils = trpc.useUtils();
  const updateDeal = trpc.deals.update.useMutation({
    onSuccess: () => {
      utils.deals.getById.invalidate({ dealId: deal.id });
      utils.deals.listWithMatches.invalidate();
      onOpenChange(false);
    },
  });

  const form = useForm<EditDealFormValues>({
    resolver: zodResolver(editDealSchema),
    defaultValues: {
      title: deal.title || "",
      location: deal.location || "",
      description: deal.description || "",
      value: deal.value || "",
      acreage: deal.acreage || "",
      zoning: deal.zoning || "",
      deal_type: deal.deal_type || "",
      stage: deal.stage || "Lead",
    },
  });

  const onSubmit = (data: EditDealFormValues) => {
    updateDeal.mutate({
      id: deal.id,
      title: data.title,
      location: data.location || null,
      description: data.description || null,
      value: data.value || null,
      acreage: data.acreage || null,
      zoning: data.zoning || null,
      deal_type: data.deal_type || null,
      stage: data.stage || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value ($)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 500000" type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acreage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acreage</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 5.5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zoning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zoning</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Residential" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Real Estate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Lead, Under Contract" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateDeal.isPending}>
                {updateDeal.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
