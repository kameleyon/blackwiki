"use client";

import React, { useState } from 'react';
import { DonationTier } from './types';
import { getDonationTiers } from './utils';
import { Heart, Check, CreditCard, DollarSign, Calendar } from 'lucide-react';

interface DonationSystemProps {
  showTitle?: boolean;
}

const DonationSystem: React.FC<DonationSystemProps> = ({ 
  showTitle = true 
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  
  const donationTiers = getDonationTiers();
  
  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    
    // Reset custom amount if a predefined tier is selected
    if (tierId !== 'tier-5') {
      setCustomAmount('');
    }
    
    // Set recurring based on the tier's default
    const tier = donationTiers.find(t => t.id === tierId);
    if (tier) {
      setIsRecurring(tier.isRecurring ?? true);
    }
  };
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setCustomAmount(value);
    }
  };
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-normal">Support AfroWiki</h2>
          <p className="text-white/70 mt-2">
            Your donations help us maintain and expand our knowledge base
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {donationTiers.slice(0, 4).map((tier) => (
          <DonationTierCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTier === tier.id}
            onSelect={() => handleTierSelect(tier.id)}
          />
        ))}
      </div>
      
      <div className="bg-black/20 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-4">
          <input
            type="radio"
            id="custom-donation"
            name="donation-tier"
            className="mr-3"
            checked={selectedTier === 'tier-5'}
            onChange={() => handleTierSelect('tier-5')}
          />
          <label htmlFor="custom-donation" className="text-lg">
            Custom Amount
          </label>
        </div>
        
        <div className="flex items-center">
          <div className="relative flex-1 mr-4">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Enter amount"
              className="pl-10 w-full"
              disabled={selectedTier !== 'tier-5'}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring-donation"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              className="mr-2"
              disabled={selectedTier !== 'tier-5'}
            />
            <label htmlFor="recurring-donation" className="text-white/80">
              Monthly
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          onClick={() => {}}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Credit Card
        </button>
        
        <button
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          onClick={() => {}}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.54h4.605a.641.641 0 0 1 .633.74L7.708 20.798a.641.641 0 0 1-.632.54zm7.348-1.628h-4.549a.632.632 0 0 1-.62-.762l.148-.71a.641.641 0 0 1 .632-.518h4.547c.548 0 1.116-.295 1.319-.76l2.26-5.19h-4.086c-.547 0-1.116.296-1.319.76l-1.777 4.09a.632.632 0 0 1-.62.762l-.148.71a.641.641 0 0 1-.632.518H5.98a.632.632 0 0 1-.62-.762l.148-.71a.641.641 0 0 1 .632-.518h4.1c.548 0 1.116-.296 1.319-.76l1.776-4.09a.632.632 0 0 1 .62-.762l.148-.71a.641.641 0 0 1 .633-.518h4.549c.547 0 .79.295.587.76l-2.26 5.19c-.204.465-.771.76-1.32.76h.001z" />
          </svg>
          PayPal
        </button>
      </div>
      
      <div className="mt-6 text-center text-white/60 text-sm">
        <p>All donations are tax-deductible to the extent allowed by law.</p>
        <p className="mt-1">AfroWiki Foundation is a registered 501(c)(3) non-profit organization.</p>
      </div>
    </div>
  );
};

interface DonationTierCardProps {
  tier: DonationTier;
  isSelected: boolean;
  onSelect: () => void;
}

const DonationTierCard: React.FC<DonationTierCardProps> = ({ 
  tier, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      className={`rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'bg-white/20 border-white/30' 
          : 'bg-black/20 border-white/10 hover:bg-black/30'
      } border`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg">{tier.name}</h3>
        {isSelected && <Check className="h-5 w-5 text-white" />}
      </div>
      
      <div className="flex items-baseline mb-3">
        <span className="text-2xl font-semibold">${tier.amount}</span>
        {tier.isRecurring && (
          <span className="text-white/60 ml-1">/month</span>
        )}
      </div>
      
      <p className="text-white/70 text-sm mb-3">{tier.description}</p>
      
      <div className="mt-auto">
        <h4 className="text-sm text-white/80 mb-1 flex items-center">
          <Heart className="h-4 w-4 mr-1 text-white/60" />
          Benefits:
        </h4>
        <ul className="text-sm text-white/70">
          {tier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start mb-1">
              <Check className="h-3 w-3 mr-1 mt-1 text-white/60" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DonationSystem;
