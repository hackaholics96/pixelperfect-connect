import { useState } from "react";
import LanguageSelection from "@/components/LanguageSelection";
import AuthForm from "@/components/AuthForm";
import Dashboard from "@/components/Dashboard";
import CropRecommendation from "@/components/CropRecommendation";
import FertilizerRecommendation from "@/components/FertilizerRecommendation";
import MarketPrices from "@/components/MarketPrices";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('language-selection');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLanguageSelected = (language: any) => {
    setSelectedLanguage(language);
  };

  const handleLanguageContinue = () => {
    setCurrentPage('auth');
  };

  const handleAuthComplete = (user: any) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedLanguage(null);
    setCurrentPage('language-selection');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
  };

  if (currentPage === 'language-selection') {
    return (
      <LanguageSelection 
        onLanguageSelected={handleLanguageSelected}
        onContinue={handleLanguageContinue}
      />
    );
  }

  if (currentPage === 'auth' && selectedLanguage) {
    return (
      <AuthForm 
        selectedLanguage={selectedLanguage}
        onAuthComplete={handleAuthComplete}
      />
    );
  }

  if (currentPage === 'dashboard' && currentUser) {
    return (
      <Dashboard 
        user={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentPage === 'crop-recommendation' && currentUser) {
    return (
      <CropRecommendation 
        user={currentUser}
        onBack={handleBack}
      />
    );
  }

  if (currentPage === 'fertilizer' && currentUser) {
    return (
      <FertilizerRecommendation 
        user={currentUser}
        onBack={handleBack}
      />
    );
  }

  if (currentPage === 'market-price' && currentUser) {
    return (
      <MarketPrices 
        user={currentUser}
        onBack={handleBack}
      />
    );
  }

  // Fallback
  return (
    <LanguageSelection 
      onLanguageSelected={handleLanguageSelected}
      onContinue={handleLanguageContinue}
    />
  );
};

export default Index;
