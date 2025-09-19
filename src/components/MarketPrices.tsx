import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface User {
  id: string;
  name: string;
  state_code: string;
}

interface State {
  code: string;
  name: string;
}

interface MarketPrice {
  commodity: string;
  variety: string;
  market: string;
  price: number;
  unit: string;
  date: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketPricesProps {
  user: User;
  onBack: () => void;
}

const MarketPrices = ({ user, onBack }: MarketPricesProps) => {
  const [selectedState, setSelectedState] = useState(user.state_code || "");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(true);
  const { toast } = useToast();

  const commodities = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", 
    "Groundnut", "Sunflower", "Mustard", "Potato", "Tomato", "Onion",
    "Bajra", "Jowar", "Tur Dal", "Gram", "Turmeric", "Chilli"
  ];

  // Mock market data - in a real app, this would come from an API
  const mockMarketData: MarketPrice[] = [
    { commodity: "Rice", variety: "Common", market: "Nizamabad", price: 2850, unit: "₹/Quintal", date: "2024-01-15", change: 2.5, trend: 'up' },
    { commodity: "Rice", variety: "Basmati", market: "Delhi", price: 4200, unit: "₹/Quintal", date: "2024-01-15", change: -1.2, trend: 'down' },
    { commodity: "Wheat", variety: "Common", market: "Mandi", price: 2250, unit: "₹/Quintal", date: "2024-01-15", change: 1.8, trend: 'up' },
    { commodity: "Maize", variety: "Yellow", market: "Hyderabad", price: 1950, unit: "₹/Quintal", date: "2024-01-15", change: 0, trend: 'stable' },
    { commodity: "Cotton", variety: "Medium Staple", market: "Guntur", price: 5800, unit: "₹/Quintal", date: "2024-01-15", change: 3.2, trend: 'up' },
    { commodity: "Soybean", variety: "Yellow", market: "Indore", price: 4500, unit: "₹/Quintal", date: "2024-01-15", change: -0.8, trend: 'down' },
    { commodity: "Potato", variety: "Local", market: "Agra", price: 1200, unit: "₹/Quintal", date: "2024-01-15", change: 2.1, trend: 'up' },
    { commodity: "Onion", variety: "Big", market: "Nasik", price: 1800, unit: "₹/Quintal", date: "2024-01-15", change: -2.5, trend: 'down' },
    { commodity: "Tomato", variety: "Local", market: "Bangalore", price: 3200, unit: "₹/Quintal", date: "2024-01-15", change: 4.2, trend: 'up' },
    { commodity: "Turmeric", variety: "Finger", market: "Erode", price: 12500, unit: "₹/Quintal", date: "2024-01-15", change: 1.5, trend: 'up' }
  ];

  useEffect(() => {
    fetchStates();
    loadMarketPrices();
  }, []);

  useEffect(() => {
    if (selectedState || selectedCommodity) {
      loadMarketPrices();
    }
  }, [selectedState, selectedCommodity]);

  const fetchStates = async () => {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .order('name');

      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadMarketPrices = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let filteredPrices = mockMarketData;

      if (selectedCommodity) {
        filteredPrices = filteredPrices.filter(price => 
          price.commodity.toLowerCase() === selectedCommodity.toLowerCase()
        );
      }

      // If no specific commodity selected, show all prices
      setMarketPrices(filteredPrices);
      setLoading(false);
    }, 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="farm-background min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="pagebar mb-6">
          <Button
            onClick={onBack}
            className="back-btn"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Market Prices</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Commodity</label>
                <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Commodities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Commodities</SelectItem>
                    {commodities.map((commodity) => (
                      <SelectItem key={commodity} value={commodity}>
                        {commodity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Current Market Prices</CardTitle>
            <p className="text-sm text-muted-foreground">Updated on {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading market prices...</div>
              </div>
            ) : marketPrices.length > 0 ? (
              <div className="space-y-4">
                {marketPrices.map((price, index) => (
                  <div key={index} className="p-4 bg-accent rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{price.commodity}</h4>
                          <span className="text-sm text-muted-foreground">({price.variety})</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Market: {price.market}</p>
                        <p className="text-sm text-muted-foreground">Date: {price.date}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {price.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{price.unit}</div>
                        <div className={`flex items-center gap-1 text-sm ${getTrendColor(price.trend)}`}>
                          {getTrendIcon(price.trend)}
                          <span>
                            {price.change > 0 ? '+' : ''}{price.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedCommodity || selectedState 
                    ? "No market prices found for selected filters" 
                    : "Select filters to view market prices"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketPrices;