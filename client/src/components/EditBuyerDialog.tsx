import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const editBuyerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  market: z.string().optional(),
  buyer_type: z.string().optional(),
  buy_box: z.string().optional(),
  notes: z.string().optional(),
});

type EditBuyerFormValues = z.infer<typeof editBuyerSchema>;

export interface BuyerForEdit {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone?: string | null;
  website?: string | null;
  market: string | null;
  buy_box: string | null;
  notes: string | null;
  buyer_type: string | null;
}

interface EditBuyerDialogProps {
  buyer: BuyerForEdit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditBuyerDialog({
  buyer,
  open,
  onOpenChange,
}: EditBuyerDialogProps) {
  const utils = trpc.useUtils();
  const { data: filters } = trpc.contacts.getFilters.useQuery();
  const updateBuyer = trpc.contacts.update.useMutation({
    onSuccess: () => {
      utils.contacts.getById.invalidate({ id: buyer.id });
      utils.contacts.list.invalidate();
      utils.contacts.search.invalidate();
      onOpenChange(false);
    },
  });

  const form = useForm<EditBuyerFormValues>({
    resolver: zodResolver(editBuyerSchema),
    defaultValues: {
      name: buyer.name || "",
      email: buyer.email || "",
      company: buyer.company || "",
      phone: buyer.phone || "",
      website: buyer.website || "",
      market: buyer.market || "",
      buyer_type: buyer.buyer_type || "",
      buy_box: buyer.buy_box || "",
      notes: buyer.notes || "",
    },
  });

  useEffect(() => {
    if (open && buyer) {
      form.reset({
        name: buyer.name || "",
        email: buyer.email || "",
        company: buyer.company || "",
        phone: buyer.phone || "",
        website: buyer.website || "",
        market: buyer.market || "",
        buyer_type: buyer.buyer_type || "",
        buy_box: buyer.buy_box || "",
        notes: buyer.notes || "",
      });
    }
  }, [open, buyer, form]);

  const onSubmit = (data: EditBuyerFormValues) => {
    updateBuyer.mutate({
      id: buyer.id,
      name: data.name,
      email: data.email || null,
      company: data.company || null,
      phone: data.phone || null,
      website: data.website || null,
      market: data.market || null,
      buyer_type: data.buyer_type || null,
      buy_box: data.buy_box || null,
      notes: data.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Buyer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Georgia, Texas" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Type</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                      value={field.value && field.value.length > 0 ? field.value : "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {(filters?.buyerTypes ?? []).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buy_box"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Box</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Acquisition criteria, price range, lot size..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Internal notes..." />
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
              <Button type="submit" disabled={updateBuyer.isPending}>
                {updateBuyer.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
