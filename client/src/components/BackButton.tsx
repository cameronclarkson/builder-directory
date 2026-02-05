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
            className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
      className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      aria-label={label}
    >
      <ChevronLeft size={18} className="mr-1" />
      {label}
    </Button>
  );
}
