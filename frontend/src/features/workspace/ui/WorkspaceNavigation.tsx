"use client";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { navigationItems, type WorkspaceScreen } from "../model/navigation";
export function WorkspaceNavigation({
  screen,
  onNavigate,
}: {
  screen: WorkspaceScreen;
  onNavigate: (screen: WorkspaceScreen) => void;
}) {
  return (
    <nav aria-label="Principal">
      {navigationItems.map(({ id, label, icon }) => (
        <Button
          variant="ghost"
          type="button"
          key={id}
          className={
            screen === id
              ? "nav active h-auto justify-start bg-secondary text-primary"
              : "nav h-auto justify-start"
          }
          aria-current={screen === id ? "page" : undefined}
          onClick={() => {
            onNavigate(id);
          }}
        >
          <Icon type={icon} />
          {label}
          {id === "new" && <span className="small-plus">+</span>}
        </Button>
      ))}
    </nav>
  );
}
