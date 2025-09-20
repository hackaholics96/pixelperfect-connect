import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { getTranslation, formatMessage } from "@/utils/translations";

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

  // Translation helper
  const t = (key: string) => getTranslation(selectedLanguage.code, key);

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
        title: t('common.error'),
        description: t('auth.errors.statesLoadFailed'),
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
        title: t('common.error'),
        description: t('auth.validationErrors.nameRequired'),
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.validationErrors.phoneRequired'),
        variant: "destructive"
      });
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast({
        title: t('common.error'), 
        description: t('auth.validationErrors.phoneInvalid'),
        variant: "destructive"
      });
      return false;
    }

    if (!formData.state) {
      toast({
        title: t('common.error'),
        description: t('auth.validationErrors.stateRequired'),
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
      // Use phone as email for Supabase auth (since we only collect phone)
      const email = `${formData.phone.replace(/[^\d]/g, '')}@cropdoc.app`;
      const password = `temp_${formData.phone.replace(/[^\d]/g, '')}_${Date.now()}`;

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            language: selectedLanguage.code,
            state_code: formData.state
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast({
            title: t('common.error'),
            description: t('auth.errors.userExists'),
            variant: "destructive"
          });
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Wait a moment for the trigger to create the user record
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the created user data
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userFetchError) {
        console.error('Error fetching user data:', userFetchError);
        // Still continue with auth data if we can't fetch user record
      }

      toast({
        title: t('auth.success.registrationComplete'),
        description: t('auth.success.registrationComplete'),
      });

      onAuthComplete(userData || {
        id: authData.user.id,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        language_code: selectedLanguage.code,
        state_code: formData.state
      });

    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('auth.errors.registrationFailed'),
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
          <div className="text-center">{t('common.loading')}</div>
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
            <h1 className="text-2xl font-bold">{t('auth.title')}</h1>
            <p className="mt-2 opacity-90">{t('auth.subtitle')}</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="block text-foreground font-medium mb-2">
                  {t('auth.fullName')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* State Field */}
              <div>
                <Label htmlFor="state" className="block text-foreground font-medium mb-2">
                  {t('auth.state')}
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className="w-full px-4 py-3 border border-input rounded-lg">
                    <SelectValue placeholder={t('auth.statePlaceholder')} />
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
                  {t('auth.phoneNumber')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('auth.phoneNumberPlaceholder')}
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
                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              {t('auth.termsText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;