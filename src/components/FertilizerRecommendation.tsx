import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Beaker } from "lucide-react";

interface User {
  id: string;
  name: string;
  state_code: string;
}

interface State {
  code: string;
  name: string;
}

interface FertilizerRecommendationProps {
  user: User;
  onBack: () => void;
}

const FertilizerRecommendation = ({ user, onBack }: FertilizerRecommendationProps) => {
  const [formData, setFormData] = useState({
    crop: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    soilType: "",
    state: user.state_code || ""
  });
  const [states, setStates] = useState<State[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(true);
  const { toast } = useToast();

  const cropOptions = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", 
    "Groundnut", "Sunflower", "Mustard", "Potato", "Tomato", "Onion"
  ];

  const soilTypes = [
    "Sandy", "Clay", "Loamy", "Silt", "Sandy Loam", "Clay Loam"
  ];

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
    if (!formData.crop) {
      toast({
        title: "Validation Error",
        description: "Please select a crop",
        variant: "destructive"
      });
      return false;
    }

    const requiredFields = ['nitrogen', 'phosphorus', 'potassium'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        toast({
          title: "Validation Error",
          description: `Please enter ${field} value`,
          variant: "destructive"
        });
        return false;
      }
    }

    if (!formData.soilType) {
      toast({
        title: "Validation Error",
        description: "Please select soil type",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const getFertilizerRecommendations = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const n = parseFloat(formData.nitrogen);
      const p = parseFloat(formData.phosphorus);
      const k = parseFloat(formData.potassium);

      let fertilizerRecommendations: any[] = [];

      // Basic fertilizer recommendation logic
      const cropRequirements = {
        "Rice": { n: 120, p: 60, k: 40 },
        "Wheat": { n: 120, p: 60, k: 40 },
        "Maize": { n: 150, p: 75, k: 75 },
        "Cotton": { n: 160, p: 80, k: 80 },
        "Sugarcane": { n: 200, p: 100, k: 100 },
        "Soybean": { n: 30, p: 75, k: 45 },
        "Groundnut": { n: 25, p: 50, k: 75 },
        "Sunflower": { n: 60, p: 90, k: 40 },
        "Mustard": { n: 100, p: 50, k: 25 },
        "Potato": { n: 120, p: 80, k: 150 },
        "Tomato": { n: 150, p: 100, k: 150 },
        "Onion": { n: 100, p: 50, k: 50 }
      };

      const required = cropRequirements[formData.crop as keyof typeof cropRequirements] || { n: 100, p: 50, k: 50 };

      // Calculate deficiencies and recommendations
      const nDeficit = Math.max(0, required.n - n);
      const pDeficit = Math.max(0, required.p - p);
      const kDeficit = Math.max(0, required.k - k);

      if (nDeficit > 0) {
        const ureaAmount = Math.ceil(nDeficit / 0.46); // Urea is 46% N
        fertilizerRecommendations.push({
          name: "Urea",
          amount: `${ureaAmount} kg/acre`,
          purpose: `To fulfill nitrogen deficiency of ${nDeficit} kg/acre`,
          application: "Apply in 2-3 split doses during crop growth"
        });
      }

      if (pDeficit > 0) {
        const dapAmount = Math.ceil(pDeficit / 0.46); // DAP is 46% P2O5
        fertilizerRecommendations.push({
          name: "DAP (Diammonium Phosphate)",
          amount: `${dapAmount} kg/acre`,
          purpose: `To fulfill phosphorus deficiency of ${pDeficit} kg/acre`,
          application: "Apply as basal dose before sowing"
        });
      }

      if (kDeficit > 0) {
        const mopAmount = Math.ceil(kDeficit / 0.60); // MOP is 60% K2O
        fertilizerRecommendations.push({
          name: "MOP (Muriate of Potash)",
          amount: `${mopAmount} kg/acre`,
          purpose: `To fulfill potassium deficiency of ${kDeficit} kg/acre`,
          application: "Apply as basal dose or split with nitrogen"
        });
      }

      if (fertilizerRecommendations.length === 0) {
        fertilizerRecommendations.push({
          name: "Balanced NPK",
          amount: "As per soil test recommendations",
          purpose: "Maintain optimal nutrient levels",
          application: "Apply balanced fertilizer for sustained productivity"
        });
      }

      setRecommendations(fertilizerRecommendations);

      // Save recommendation to database
      await supabase
        .from('recommendations')
        .insert({
          user_id: user.id,
          title: 'Fertilizer Recommendation',
          message: `Fertilizer recommendations for ${formData.crop}`,
          severity: 'info',
          metadata: {
            type: 'fertilizer_recommendation',
            crop: formData.crop,
            inputs: formData,
            recommendations: fertilizerRecommendations
          }
        });

      toast({
        title: "Recommendations Generated",
        description: `Fertilizer recommendations for ${formData.crop}`,
      });

    } catch (error) {
      console.error('Error generating fertilizer recommendations:', error);
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
          <h1 className="text-xl font-bold text-foreground">Fertilizer Recommendation</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-primary" />
                Crop & Soil Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="crop">Crop Type</Label>
                <Select value={formData.crop} onValueChange={(value) => handleInputChange('crop', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nitrogen">Current N (kg/acre)</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    placeholder="0-200"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phosphorus">Current P (kg/acre)</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    placeholder="0-100"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="potassium">Current K (kg/acre)</Label>
                  <Input
                    id="potassium"
                    type="number"
                    placeholder="0-200"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange('potassium', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((soil) => (
                      <SelectItem key={soil} value={soil}>
                        {soil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                onClick={getFertilizerRecommendations}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? 'Analyzing...' : 'Get Fertilizer Recommendations'}
              </Button>
            </CardContent>
          </Card>

          {/* Recommendations Display */}
          <Card>
            <CardHeader>
              <CardTitle>Fertilizer Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 bg-accent rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2">{recommendation.name}</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Amount:</span> {recommendation.amount}</p>
                        <p><span className="font-medium">Purpose:</span> {recommendation.purpose}</p>
                        <p><span className="font-medium">Application:</span> {recommendation.application}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Beaker className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter crop and soil information to get fertilizer recommendations
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

export default FertilizerRecommendation;