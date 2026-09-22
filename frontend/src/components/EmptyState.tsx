import { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon size={48} />
      <h3>{title}</h3>
      {description && <p style={{ fontSize: "0.9rem", maxWidth: 320, margin: "0 auto 1.25rem" }}>{description}</p>}
      {action}
    </div>
  );
}
