import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Menu, 
  Home, 
  Bell, 
  Beaker, 
  Sprout, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Settings,
  LogOut,
  X
} from "lucide-react";

interface User {
  id: string;
  name: string;
  phone: string;
  language_code: string;
  state_code: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const Dashboard = ({ user, onLogout, onNavigate }: DashboardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalCrops: 0,
    totalRecommendations: 0,
    pendingAlerts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, [user.id]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch farms count
      const { count: farmsCount } = await supabase
        .from('farms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch crop records count
      const { count: cropsCount } = await supabase
        .from('crop_records')
        .select('*, farms!inner(*)', { count: 'exact', head: true })
        .eq('farms.user_id', user.id);

      // Fetch recommendations count
      const { count: recommendationsCount } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalFarms: farmsCount || 0,
        totalCrops: cropsCount || 0,
        totalRecommendations: recommendationsCount || 0,
        pendingAlerts: 3 // Mock data for now
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' },
    { id: 'crop-recommendation', label: 'Crop Recommendation', icon: Sprout, page: 'crop-recommendation' },
    { id: 'fertilizer', label: 'Fertilizer Recommendation', icon: Beaker, page: 'fertilizer' },
    { id: 'pesticide', label: 'Pesticide Alerts', icon: Shield, page: 'pesticide' },
    { id: 'market-price', label: 'Market Prices', icon: TrendingUp, page: 'market-price' },
    { id: 'alerts', label: 'Weather Alerts', icon: Bell, page: 'alerts' },
    { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' }
  ];

  const handleMenuClick = (page: string) => {
    setSidebarOpen(false);
    onNavigate(page);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="farm-background min-h-screen">
      {/* Mobile Menu Button */}
      <Button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground rounded-full p-2"
        size="sm"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Layout wrapper */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:relative
          top-0 left-0
          w-64 min-h-screen
          bg-card shadow-xl
          z-50
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-5">
            {/* Close button for mobile */}
            <Button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-1"
              variant="ghost"
              size="sm"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <div className="flex items-center mb-8 pt-8 lg:pt-0">
              <div className="bg-primary text-primary-foreground rounded-xl p-2 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-primary">CropDoc</h1>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start text-left p-3 h-auto hover:bg-accent"
                  onClick={() => handleMenuClick(item.page)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* User info and logout */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6 pt-20 lg:pt-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your farming activities
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="cropdoc-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Farms</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalFarms}</p>
                  </div>
                  <Home className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="cropdoc-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Crops</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalCrops}</p>
                  </div>
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="cropdoc-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalRecommendations}</p>
                  </div>
                  <Beaker className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="cropdoc-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                    <p className="text-3xl font-bold text-destructive">{stats.pendingAlerts}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="cropdoc-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleMenuClick('crop-recommendation')}
                  className="h-20 bg-primary hover:bg-primary/90 text-primary-foreground flex-col"
                >
                  <Sprout className="w-6 h-6 mb-2" />
                  Get Crop Recommendation
                </Button>

                <Button
                  onClick={() => handleMenuClick('fertilizer')}
                  className="h-20 bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-col"
                  variant="secondary"
                >
                  <Beaker className="w-6 h-6 mb-2" />
                  Fertilizer Guide
                </Button>

                <Button
                  onClick={() => handleMenuClick('market-price')}
                  className="h-20 bg-accent hover:bg-accent/90 text-accent-foreground flex-col"
                  variant="outline"
                >
                  <TrendingUp className="w-6 h-6 mb-2" />
                  Check Market Prices
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;