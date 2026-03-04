import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight
              size={16}
              className="text-muted-foreground"
              aria-hidden="true"
            />
          )}

          {index === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link href={item.href}>
              <a className="text-primary hover:text-primary/90 hover:underline transition-colors">
                {item.label}
              </a>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
