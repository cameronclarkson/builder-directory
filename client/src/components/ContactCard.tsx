import { Contact } from "@/types/contact";
import { Mail, Phone, Globe, MapPin, Calendar, Target } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{contact.name}</h3>
        {contact.company && (
          <p className="text-sm font-medium text-gray-600">{contact.company}</p>
        )}
      </div>

      {/* Status and Focus Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {contact.status && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {contact.status}
          </span>
        )}
        {contact.focus && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            {contact.focus}
          </span>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2 text-gray-700">
            <Mail size={16} className="text-gray-400 flex-shrink-0" />
            <a
              href={`mailto:${contact.email}`}
              className="text-blue-600 hover:underline truncate"
            >
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <Phone size={16} className="text-gray-400 flex-shrink-0" />
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.website && (
          <div className="flex items-center gap-2 text-gray-700">
            <Globe size={16} className="text-gray-400 flex-shrink-0" />
            <a
              href={contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
            >
              {contact.website}
            </a>
          </div>
        )}
        {contact.business && (
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span>{contact.business}</span>
          </div>
        )}
      </div>

      {/* Additional Details */}
      {(contact.next_action || contact.follow_up_date || contact.buy_box) && (
        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          {contact.next_action && (
            <div className="flex items-start gap-2">
              <Target size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-600">Next Action</p>
                <p className="text-gray-700">{contact.next_action}</p>
              </div>
            </div>
          )}
          {contact.follow_up_date && (
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={16} className="text-gray-400 flex-shrink-0" />
              <span>Follow up: {contact.follow_up_date}</span>
            </div>
          )}
          {contact.buy_box && (
            <div className="mt-2">
              <p className="font-medium text-gray-600 mb-1">Buy Box</p>
              <p className="text-gray-700 text-xs bg-gray-50 p-2 rounded">
                {contact.buy_box}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Target Markets */}
      {contact.target_markets && contact.target_markets.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="font-medium text-gray-600 mb-2 text-sm">
            Target Markets
          </p>
          <div className="flex flex-wrap gap-1">
            {contact.target_markets.map((market: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {market}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
