"use client";

import React, { useState } from 'react';
import { LanguageOption } from './types';
import { getLanguageOptions } from './utils';
import { Globe, Check, Search } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (languageCode: string) => void;
  showTitle?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage = 'en',
  onLanguageChange,
  showTitle = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const languages = getLanguageOptions();
  
  const handleLanguageSelect = (languageCode: string) => {
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
    setIsOpen(false);
  };
  
  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentLanguageOption = languages.find(lang => lang.code === currentLanguage);
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <h2 className="text-2xl mb-6 font-normal">Language Settings</h2>
      )}
      
      <div className="relative">
        <button
          className="w-full flex items-center justify-between bg-black/20 hover:bg-black/30 transition-colors rounded-lg p-3 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-3 text-white/70" />
            <span>
              {currentLanguageOption?.name} ({currentLanguageOption?.nativeName})
            </span>
          </div>
          <svg
            className={`h-5 w-5 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-background border border-white/10 rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  className="w-full pl-9 py-2 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors ${
                    language.code === currentLanguage ? 'bg-white/10' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language.code)}
                  dir={language.isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center">
                    <span className="text-white/70 text-sm mr-2">{language.code}</span>
                    <span>
                      {language.name} 
                      <span className="text-white/70 ml-1">({language.nativeName})</span>
                    </span>
                  </div>
                  {language.code === currentLanguage && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
              
              {filteredLanguages.length === 0 && (
                <div className="px-4 py-3 text-white/50 text-center">
                  No languages found
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 bg-black/20">
              <p className="text-sm text-white/60">
                Help translate AfroWiki into your language
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg mb-3 font-normal">Language Information</h3>
        <div className="bg-black/20 rounded-lg p-4 text-white/70 text-sm">
          <p>
            AfroWiki is available in multiple languages to make knowledge accessible to as many people as possible.
          </p>
          <p className="mt-2">
            Content availability may vary by language. You can contribute to translations to help expand content in your language.
          </p>
          <p className="mt-2">
            Some languages, like Arabic, are displayed right-to-left (RTL).
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg mb-3 font-normal">Translation Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl">{languages.length}</div>
            <div className="text-white/70 text-sm">Supported Languages</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl">78%</div>
            <div className="text-white/70 text-sm">Translation Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
