import React, { useState } from 'react';
import { Info, Download, CheckCircle } from 'lucide-react';
import type { Policy, Dimension, Phase } from '../services/tpafDataService';

interface SidebarProps {
  selectedDimension: string;
  selectedPhase: string | null;
  selectedPolicy: Policy | null;
  selectedKeyword: string;
  searchQuery: string;
  readPolicies: Set<number>;
  savedPolicies: Set<number>;
  data: {
    dimensions: Dimension[];
    phases: Phase[];
    policies: Policy[];
    keywords: string[];
  };
  onResetAllSelections: () => void;
  onSetSelectedDimension: (dim: string) => void;
  onSetSelectedPhase: (phase: string | null) => void;
  onSetSelectedKeyword: (keyword: string) => void;
  onSetSearchQuery: (query: string) => void;
  onDownloadJourney: () => void;
  getDimension: (dimensionId: string) => Dimension | undefined;
  getPhase: (phaseId: string) => Phase | undefined;
}

const CompactSidebar: React.FC<SidebarProps> = ({
  selectedDimension,
  selectedPhase,
  selectedPolicy,
  selectedKeyword,
  searchQuery,
  readPolicies,
  savedPolicies,
  data,
  onResetAllSelections,
  onSetSelectedDimension,
  onSetSelectedPhase,
  onSetSelectedKeyword,
  onSetSearchQuery,
  onDownloadJourney,
  getDimension,
  getPhase
}) => {
  const [activeTab, setActiveTab] = useState<'journey' | 'filters'>('journey');
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {/* Unified Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('journey')}
            className={`px-3 py-1 text-sm rounded-lg ${activeTab === 'journey' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            My Journey
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-3 py-1 text-sm rounded-lg ${activeTab === 'filters' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Active Filters
          </button>
        </div>
        
        <button 
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <Info className="w-4 h-4" />
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
        
        <button 
          onClick={onDownloadJourney}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Journey & Filters Panel */}
      <div className="mb-4">
        {activeTab === 'journey' ? (
          <div className="space-y-3">
            {/* Progress Bar */}
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium">
                {readPolicies.size}/{data.policies.length} ({Math.round((readPolicies.size/data.policies.length)*100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300"  // Changed from bg-blue-500 to bg-black
                style={{ width: `${(readPolicies.size/data.policies.length)*100}%` }}
              />
            </div> */}
            
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saved:</span>
              <span className="font-medium">
                {savedPolicies.size}/{data.policies.length} ({Math.round((savedPolicies.size/data.policies.length)*100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(savedPolicies.size/data.policies.length)*100}%` }}
              /> */}
            {/* </div> */}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDimension !== 'all' && (
              <div className="flex items-center justify-between bg-blue-50 px-3 py-1 rounded text-sm">
                <span>Dimension: {getDimension(selectedDimension)?.shortName}</span>
                <button onClick={() => onSetSelectedDimension('all')}>×</button>
              </div>
            )}
            
            {selectedPhase && (
              <div className="flex items-center justify-between bg-purple-50 px-3 py-1 rounded text-sm">
                <span>Phase: {getPhase(selectedPhase)?.name}</span>
                <button onClick={() => onSetSelectedPhase(null)}>×</button>
              </div>
            )}
            
            {searchQuery && (
              <div className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded text-sm">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => onSetSearchQuery('')}>×</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Legend */}
      {showLegend && (
        <div className="border-t pt-3 mt-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Dimensions */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Dimensions</div>
              {data.dimensions.map(d => (
                <div key={d.id} className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.shortName}</span>
                </div>
              ))}
            </div>
            
            {/* Status */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Status</div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 border border-gray-400 rounded-full bg-transparent" />
                <span>Unread</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 border border-blue-500 rounded-full bg-transparent" />
                <span>Read</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Saved</span>
              </div>
            </div>
            
            {/* Phases */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Phases</div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span>Analysis</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span>Design</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <span>Implementation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactSidebar;