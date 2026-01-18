import React from 'react';

interface TaxBadgeProps {
  badge: 'tax-exempt' | 'low-tax' | 'standard-tax' | 'high-tax';
  isTaxable: boolean;
  exemptionReason?: string;
}

export default function TaxBadge({ badge, isTaxable, exemptionReason }: TaxBadgeProps) {
  const getBadgeStyles = () => {
    switch (badge) {
      case 'tax-exempt':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: '✅'
        };
      case 'low-tax':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: '👀'
        };
      case 'standard-tax':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: '📊'
        };
      case 'high-tax':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: '📈'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: '📋'
        };
    }
  };

  const getBadgeText = () => {
    switch (badge) {
      case 'tax-exempt':
        return 'Tax Exempt';
      case 'low-tax':
        return 'Low Tax Rate';
      case 'standard-tax':
        return 'Standard Tax';
      case 'high-tax':
        return 'High Tax Rate';
      default:
        return 'Unknown';
    }
  };

  const getBadgeDescription = () => {
    switch (badge) {
      case 'tax-exempt':
        return exemptionReason || 'You qualify for tax exemption under Nigerian tax law';
      case 'low-tax':
        return 'You benefit from low tax rates and relief programs';
      case 'standard-tax':
        return 'You fall under standard tax brackets';
      case 'high-tax':
        return 'You are in higher tax brackets with limited relief options';
      default:
        return 'Tax status could not be determined';
    }
  };

  const styles = getBadgeStyles();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text} ${styles.border} border`}
        >
          <span className="mr-1">{styles.icon}</span>
          {getBadgeText()}
        </span>
      </div>
      
      <div className={`text-sm p-3 rounded-lg ${styles.bg} ${styles.text}`}>
        <p className="font-medium mb-1">Tax Status Details:</p>
        <p>{getBadgeDescription()}</p>
        
        {!isTaxable && exemptionReason && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p className="text-xs font-medium">Exemption Reason:</p>
            <p className="text-xs">{exemptionReason}</p>
          </div>
        )}
        
        {badge === 'tax-exempt' && (
          <div className="mt-2 pt-2 border-t border-green-300">
            <p className="text-xs font-medium text-green-700">
              💡 Small businesses (₦100m or less annual revenue) and low-income earners (₦800,000 or less) are protected under the new tax law.
            </p>
          </div>
        )}
        
        {badge === 'high-tax' && (
          <div className="mt-2 pt-2 border-t border-red-300">
            <p className="text-xs font-medium text-red-700">
              ⚠️ High-income earners and large businesses are most affected by the new tax changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}