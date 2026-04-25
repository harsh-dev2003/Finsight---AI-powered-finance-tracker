import React from 'react';

const CategoryBadge = ({ category }) => {
  const getColors = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'food': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'transport': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shopping': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'bills': return 'bg-danger/10 text-danger border-danger/20';
      case 'entertainment': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'income': return 'bg-success/10 text-success border-success/20';
      case 'investment': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'travel': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'health': return 'bg-red-400/10 text-red-400 border-red-400/20';
      default: return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getColors(category)}`}>
      {category || 'Other'}
    </span>
  );
};

export default CategoryBadge;
