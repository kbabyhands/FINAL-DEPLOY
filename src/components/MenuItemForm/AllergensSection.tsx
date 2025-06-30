
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { sanitizeInput } from '@/utils/validation';
import { logger } from '@/utils/logger';

interface AllergensSectionProps {
  allergens: string[];
  onAllergensChange: (allergens: string[]) => void;
  validationError?: string;
}

const AllergensSection = ({ allergens, onAllergensChange, validationError }: AllergensSectionProps) => {
  const [newAllergen, setNewAllergen] = useState('');

  const addAllergen = () => {
    const sanitizedAllergen = sanitizeInput(newAllergen.trim());
    if (sanitizedAllergen && !allergens.includes(sanitizedAllergen)) {
      logger.debug('Adding allergen:', sanitizedAllergen);
      onAllergensChange([...allergens, sanitizedAllergen]);
      setNewAllergen('');
    }
  };

  const removeAllergen = (allergen: string) => {
    logger.debug('Removing allergen:', allergen);
    onAllergensChange(allergens.filter(a => a !== allergen));
  };

  return (
    <div>
      <Label>Allergens</Label>
      <div className="flex gap-2 mt-2">
        <Input
          value={newAllergen}
          onChange={(e) => setNewAllergen(e.target.value)}
          placeholder="Add allergen"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
        />
        <Button type="button" onClick={addAllergen} variant="outline">
          Add
        </Button>
      </div>
      {validationError && (
        <p className="text-sm text-red-500 mt-1">{validationError}</p>
      )}
      {allergens.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {allergens.map((allergen) => (
            <div
              key={allergen}
              className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
            >
              {allergen}
              <button
                type="button"
                onClick={() => removeAllergen(allergen)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllergensSection;
