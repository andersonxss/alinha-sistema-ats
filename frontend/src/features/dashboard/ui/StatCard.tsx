"use client";
import { Icon } from "@/shared/ui/icon";
export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="stat">
      <span className="stat-icon">
        <Icon type={icon} />
      </span>
      <div>
        <strong>{value.toString().padStart(2, "0")}</strong>
        <span>{label}</span>
      </div>
      <span className="stat-arrow">↗</span>
    </div>
  );
}
