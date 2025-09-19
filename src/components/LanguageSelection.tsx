import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Language {
  code: string;
  name: string;
  direction: string;
}

interface LanguageSelectionProps {
  onLanguageSelected: (language: Language) => void;
  onContinue: () => void;
}

const LanguageSelection = ({ onLanguageSelected, onContinue }: LanguageSelectionProps) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const languageDisplayData = {
    en: { symbol: "EN", nativeName: "English" },
    ta: { symbol: "த", nativeName: "தமிழ்" },
    hi: { symbol: "ह", nativeName: "हिन्दी" },
    bn: { symbol: "ব", nativeName: "বাংলা" },
    pa: { symbol: "ਪ", nativeName: "ਪੰਜਾਬੀ" }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast({
        title: "Error",
        description: "Failed to load languages. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    onLanguageSelected(language);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onContinue();
    }
  };

  if (loading) {
    return (
      <div className="farm-background flex items-center justify-center">
        <div className="cropdoc-card p-8">
          <div className="text-center">Loading languages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="farm-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground rounded-2xl p-6">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome to CropDoc</h1>
          <div className="bg-white/85 border-l-4 border-primary rounded-r-lg p-4 inline-block">
            <p className="text-lg text-muted-foreground italic">
              "Empowering farmers with technology for better harvests"
            </p>
          </div>
          <p className="text-muted-foreground mt-6">Please select your preferred language to continue</p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 mb-8">
          {languages.map((language) => {
            const displayData = languageDisplayData[language.code as keyof typeof languageDisplayData];
            return (
              <div
                key={language.code}
                className={`language-card w-60 ${selectedLanguage?.code === language.code ? 'border-primary' : ''}`}
                onClick={() => handleLanguageSelect(language)}
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-primary">
                    {displayData?.symbol || language.code.toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-card-foreground text-lg">
                    {displayData?.nativeName || language.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">{language.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedLanguage && (
          <div className="text-center">
            <div className="bg-white/90 rounded-full py-2 px-4 flex items-center justify-center mb-6 w-max mx-auto">
              <span className="text-primary font-medium mr-2">
                {languageDisplayData[selectedLanguage.code as keyof typeof languageDisplayData]?.nativeName || selectedLanguage.name}
              </span>
              <Check className="w-5 h-5 text-primary" />
            </div>
            
            <Button 
              onClick={handleContinue}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl"
            >
              Continue to App
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-center text-muted-foreground text-sm mt-6">
              You can change this preference anytime in settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelection;