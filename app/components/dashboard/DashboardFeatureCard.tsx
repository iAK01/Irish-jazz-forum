import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface DashboardFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export default function DashboardFeatureCard({
  title,
  description,
  icon: Icon,
  href,
}: DashboardFeatureCardProps) {
  const content = (
    <div
      className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ijf-accent/40 hover:shadow-lg"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(228,185,91,0.08), rgba(255,255,255,0) 55%)",
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ijf-accent/20 bg-ijf-accent/10 text-ijf-accent"
        >
          <Icon className="h-5 w-5" strokeWidth={2.1} />
        </div>
        {href ? (
          <span className="text-zinc-400 transition-colors group-hover:text-ijf-accent">
            <ArrowRight className="h-4 w-4" strokeWidth={2.1} />
          </span>
        ) : null}
      </div>

      <h3 className="mb-2 text-xl font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
