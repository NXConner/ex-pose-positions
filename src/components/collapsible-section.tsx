import { useState, ReactNode } from "react";
import { hapticPress } from "@/utils/haptic";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: string;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  icon,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    hapticPress();
    setIsOpen(!isOpen);
  };

  return (
    <section className={`neon-card rounded-md p-4 ${className}`}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-expanded={isOpen}
        aria-controls={`collapsible-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h4 className="text-lg neon-accent font-bold">{title}</h4>
        </div>
        <span
          className={`text-xl transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>
      <div
        id={`collapsible-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[5000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

