import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
  headerTitle: string;
  showMenu?: boolean;
  showProfile?: boolean;
}

export const AppLayout = ({ 
  children, 
  headerTitle, 
  showMenu = true, 
  showProfile = true 
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader 
        title={headerTitle}
        showMenu={showMenu}
        showProfile={showProfile}
      />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
};