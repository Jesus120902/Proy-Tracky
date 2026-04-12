import React from 'react';

const KPICard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {trend === 'up' ? '+' : '-'}{trendValue}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-secondary-900 mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default KPICard;
