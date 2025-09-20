import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ScanLine } from "lucide-react";

interface User {
  id: string;
  name: string;
  state_code: string;
}

interface State {
  code: string;
  name: string;
}

interface CropRecommendationProps {
  user: User;
  onBack: () => void;
}

const CropRecommendation = ({ user, onBack }: CropRecommendationProps) => {
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
    state: user.state_code || ""
  });
  const [states, setStates] = useState<State[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStates();
  }, []);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        toast({
          title: "Validation Error",
          description: `Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const getCropRecommendations = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mock crop recommendation logic based on NPK values
      const n = parseFloat(formData.nitrogen);
      const p = parseFloat(formData.phosphorus);
      const k = parseFloat(formData.potassium);
      const temp = parseFloat(formData.temperature);
      const humidity = parseFloat(formData.humidity);
      const ph = parseFloat(formData.ph);
      const rainfall = parseFloat(formData.rainfall);

      let cropRecommendations: string[] = [];

      // Simple recommendation logic
      if (n >= 60 && p >= 40 && k >= 50 && temp >= 20 && temp <= 30) {
        cropRecommendations.push("Rice - High nitrogen and favorable conditions");
        cropRecommendations.push("Wheat - Good NPK balance for wheat cultivation");
      }

      if (n >= 40 && p >= 30 && k >= 40 && temp >= 15 && temp <= 35) {
        cropRecommendations.push("Maize - Suitable nitrogen and temperature");
        cropRecommendations.push("Cotton - Good conditions for cotton growth");
      }

      if (ph >= 6.0 && ph <= 7.5 && rainfall >= 400) {
        cropRecommendations.push("Sugarcane - Optimal pH and rainfall");
      }

      if (humidity >= 60 && temp >= 25 && temp <= 35) {
        cropRecommendations.push("Jute - High humidity favorable for jute");
      }

      if (cropRecommendations.length === 0) {
        cropRecommendations = [
          "Millet - Hardy crop suitable for various conditions",
          "Pulses - Good for soil health and nitrogen fixation"
        ];
      }

      setRecommendations(cropRecommendations);

      // Save recommendation to database
      await supabase
        .from('recommendations')
        .insert({
          user_id: user.id,
          title: 'Crop Recommendation',
          message: `Recommended crops: ${cropRecommendations.join(', ')}`,
          severity: 'info',
          metadata: {
            type: 'crop_recommendation',
            inputs: formData,
            recommendations: cropRecommendations
          }
        });

      toast({
        title: "Recommendations Generated",
        description: "Crop recommendations based on your soil parameters",
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farm-background min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="pagebar mb-6">
          <Button
            onClick={onBack}
            className="back-btn"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Crop Recommendation</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-primary" />
                Soil Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nitrogen">Nitrogen (N) mg/kg</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    placeholder="0-150"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phosphorus">Phosphorus (P) mg/kg</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    placeholder="0-100"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="potassium">Potassium (K) mg/kg</Label>
                  <Input
                    id="potassium"
                    type="number"
                    placeholder="0-300"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange('potassium', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="0-50"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    placeholder="0-100"
                    value={formData.humidity}
                    onChange={(e) => handleInputChange('humidity', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ph">pH Level</Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    placeholder="4.0-9.0"
                    value={formData.ph}
                    onChange={(e) => handleInputChange('ph', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rainfall">Rainfall (mm)</Label>
                <Input
                  id="rainfall"
                  type="number"
                  placeholder="0-3000"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={getCropRecommendations}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? 'Analyzing...' : 'Get Recommendations'}
              </Button>
            </CardContent>
          </Card>

          {/* Recommendations Display */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Crops</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 bg-accent rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-medium text-foreground">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ScanLine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter soil parameters to get crop recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;