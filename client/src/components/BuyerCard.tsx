import { BuyerProfile } from "@/types/buyer";
import { Mail, MapPin, Building2 } from "lucide-react";

interface BuyerCardProps {
  buyer: BuyerProfile;
}

export default function BuyerCard({ buyer }: BuyerCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-foreground">{buyer.name}</h3>
          {buyer.buyer_type && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
              {buyer.buyer_type}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {buyer.company || "Unknown Company"}
        </p>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {buyer.email && (
          <a
            href={`mailto:${buyer.email}`}
            className="text-sm text-primary hover:underline flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {buyer.email}
          </a>
        )}
        {buyer.market && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {buyer.market}
          </p>
        )}
      </div>

      {/* Buy Box */}
      {buyer.buy_box && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
            Buy Box
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {buyer.buy_box}
          </p>
        </div>
      )}

      {/* Notes */}
      {buyer.notes && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
            Notes
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {buyer.notes}
          </p>
        </div>
      )}
    </div>
  );
}
