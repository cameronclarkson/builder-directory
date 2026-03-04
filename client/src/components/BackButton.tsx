import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
  href?: string;
}

export default function BackButton({ label = "Back", href }: BackButtonProps) {
  const handleClick = () => {
    if (!href) {
      window.history.back();
    }
  };

  if (href) {
    return (
      <Link href={href}>
        <a>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={label}
          >
            <ChevronLeft size={18} className="mr-1" />
            {label}
          </Button>
        </a>
      </Link>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="mb-4 text-muted-foreground hover:text-foreground hover:bg-muted"
      aria-label={label}
    >
      <ChevronLeft size={18} className="mr-1" />
      {label}
    </Button>
  );
}
