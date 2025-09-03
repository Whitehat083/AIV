import React from 'react';

interface AiUsageIndicatorProps {
    uses: number;
    limit: number;
    featureName: string;
}

const AiUsageIndicator: React.FC<AiUsageIndicatorProps> = ({ uses, limit, featureName }) => {
    const remaining = Math.max(0, limit - uses);
    const percentage = (remaining / limit) * 100;

    return (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <div className="text-center text-sm text-blue-600 dark:text-blue-300 mb-1">
                ✨ {featureName} gratuitas restantes: <span className="font-bold">{remaining}/{limit}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

export default AiUsageIndicator;