import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  showMenu?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

export const AppHeader = ({ 
  title, 
  showMenu = true, 
  showProfile = true,
  onMenuClick,
  onProfileClick
}: AppHeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {showMenu && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      
      {showProfile && (
        <Button variant="ghost" size="icon" onClick={onProfileClick}>
          <User className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
};