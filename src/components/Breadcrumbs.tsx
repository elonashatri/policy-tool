import React from 'react';
import { ChevronRight } from 'lucide-react';

// Export the BreadcrumbItem type
export type BreadcrumbItem = {
  id: string;
  name: string;
  type: 'dimension' | 'phase' | 'policy';
};

const Breadcrumbs: React.FC<{
  items: BreadcrumbItem[];
  onSelect: (id: string, type: 'dimension' | 'phase' | 'policy') => void;
}> = ({ items, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <div className="flex items-center text-sm mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <button
            className={`${
              index === items.length - 1 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-blue-500'
            } transition-colors`}
            onClick={() => onSelect(item.id, item.type)}
          >
            {item.name}
          </button>
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;