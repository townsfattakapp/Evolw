import { cn } from "../../lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-20 md:py-32 lg:py-40", className)}
      {...props}
    >
      {children}
    </section>
  );
}
