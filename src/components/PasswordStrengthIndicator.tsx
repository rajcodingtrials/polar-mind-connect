
import React from 'react';
import { PasswordValidationResult, getPasswordStrengthColor, getPasswordStrengthBg } from '@/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  password: string;
}

const PasswordStrengthIndicator = ({ validation, password }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const strengthColor = getPasswordStrengthColor(validation.strength);
  const strengthBg = getPasswordStrengthBg(validation.strength);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthBg}`}
            style={{ 
              width: validation.strength === 'weak' ? '33%' : 
                     validation.strength === 'medium' ? '66%' : '100%' 
            }}
          />
        </div>
        <span className={`text-sm font-medium ${strengthColor}`}>
          {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
        </span>
      </div>
      
      {validation.errors.length > 0 && (
        <div className="text-sm text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span>•</span>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
      
      {validation.isValid && (
        <div className="text-sm text-green-600 flex items-center space-x-1">
          <span>✓</span>
          <span>Password meets security requirements</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
