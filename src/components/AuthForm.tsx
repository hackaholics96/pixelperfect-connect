import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

interface Language {
  code: string;
  name: string;
  direction: string;
}

interface State {
  code: string;
  name: string;
  country_code: string;
}

interface AuthFormProps {
  selectedLanguage: Language;
  onAuthComplete: (user: any) => void;
}

const AuthForm = ({ selectedLanguage, onAuthComplete }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: ""
  });
  const [states, setStates] = useState<State[]>([]);
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
      toast({
        title: "Error",
        description: "Failed to load states. Please refresh the page.",
        variant: "destructive"
      });
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
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.state) {
      toast({
        title: "Validation Error",
        description: "Please select your state",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create user record in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          phone_verified: false,
          language_code: selectedLanguage.code,
          state_code: formData.state,
          phone_country_code: '+91' // Default to India
        })
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') { // Unique constraint violation
          toast({
            title: "User Already Exists",
            description: "A user with this phone number already exists. Please use a different number.",
            variant: "destructive"
          });
          return;
        }
        throw userError;
      }

      // Log auth event
      await supabase
        .from('auth_events')
        .insert({
          user_id: userData.id,
          phone: formData.phone.trim(),
          event_type: 'user_registration',
          details: {
            language: selectedLanguage.code,
            state: formData.state
          }
        });

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      });

      onAuthComplete(userData);

    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingStates) {
    return (
      <div className="farm-background flex items-center justify-center">
        <div className="cropdoc-card p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="farm-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Indicator */}
        <div className="bg-white/90 rounded-full py-2 px-4 flex items-center justify-center mb-6 w-max mx-auto shadow-lg">
          <span className="text-primary font-medium mr-2">{selectedLanguage.name}</span>
          <Check className="w-5 h-5 text-primary" />
        </div>

        {/* Form Container */}
        <div className="cropdoc-card overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-6 text-center">
            <h1 className="text-2xl font-bold">Authentication</h1>
            <p className="mt-2 opacity-90">Please provide your details to continue</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="block text-foreground font-medium mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* State Field */}
              <div>
                <Label htmlFor="state" className="block text-foreground font-medium mb-2">
                  State
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className="w-full px-4 py-3 border border-input rounded-lg">
                    <SelectValue placeholder="Select your state" />
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

              {/* Phone Field */}
              <div>
                <Label htmlFor="phone" className="block text-foreground font-medium mb-2">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;