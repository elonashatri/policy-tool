import React from 'react';
import { Settings, Info, CheckCircle, Download } from 'lucide-react';
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
  return (
    <div className="space-y-4">
      {/* Journey Progress - Moved to top */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-black flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            My Journey
          </h3>
          <button 
            onClick={onDownloadJourney}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export Journey
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Policies Read</span>
            <span className="font-medium">
              {readPolicies.size}/{data.policies.length} ({Math.round((readPolicies.size/data.policies.length)*100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(readPolicies.size/data.policies.length)*100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Policies Saved</span>
            <span className="font-medium">
              {savedPolicies.size}/{data.policies.length} ({Math.round((savedPolicies.size/data.policies.length)*100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(savedPolicies.size/data.policies.length)*100}%` }}
            />
          </div>
          
          {savedPolicies.size > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2">Saved by Dimension:</div>
              {data.dimensions.map(dim => {
                const count = data.policies.filter(p => 
                  p.dimension === dim.id && savedPolicies.has(p.id)
                ).length;
                const total = data.policies.filter(p => p.dimension === dim.id).length;
                return count > 0 ? (
                  <div key={dim.id} className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: dim.color }}
                      />
                      <span>{dim.shortName}</span>
                    </div>
                    <span className="font-medium">
                      {count}/{total} ({Math.round((count/total)*100)}%)
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Policy Attributes */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-black flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Active Filters
          </h3>
          {(selectedDimension !== 'all' || selectedPhase || selectedKeyword || searchQuery) && (
            <button 
              onClick={onResetAllSelections}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {/* Dimension Filter */}
          {selectedDimension !== 'all' && (
            <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getDimension(selectedDimension)?.color }}
                />
                <span className="text-sm">Dimension: {getDimension(selectedDimension)?.shortName}</span>
              </div>
              <button 
                onClick={() => onSetSelectedDimension('all')}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Phase Filter */}
          {selectedPhase && (
            <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded">
              <span className="text-sm">Phase: {getPhase(selectedPhase)?.name}</span>
              <button 
                onClick={() => onSetSelectedPhase(null)}
                className="text-purple-600 hover:text-purple-800 text-xs"
              >
                ×
              </button>
            </div>
          )}

          {/* Complexity */}
          {selectedPolicy && (
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">Complexity:</span>
              <span 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedPolicy.complexity === 'high' ? 'bg-red-100 text-red-800' :
                  selectedPolicy.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}
              >
                {selectedPolicy.complexity}
              </span>
            </div>
          )}

          {/* Keywords */}
          {selectedPolicy && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Keywords:</div>
              <div className="flex flex-wrap gap-1">
                {selectedPolicy.keywords.map((keyword: string) => (
                  <button
                    key={keyword}
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedKeyword === keyword
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => onSetSelectedKeyword(
                      selectedKeyword === keyword ? '' : keyword
                    )}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Filter */}
          {searchQuery && (
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">Search: "{searchQuery}"</span>
              <button 
                onClick={() => onSetSearchQuery('')}
                className="text-gray-600 hover:text-gray-800 text-xs"
              >
                ×
              </button>
            </div>
          )}
          
          {selectedDimension === 'all' && !selectedPhase && !selectedKeyword && !searchQuery && (
            <div className="text-xs text-gray-500 text-center py-2">
              No active filters
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <h3 className="text-base font-semibold text-black mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Legend
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Dimensions</div>
            <div className="grid grid-cols-1 gap-1">
              {data.dimensions.map((dimension) => (
                <div key={dimension.id} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dimension.color }}
                  />
                  <span className="text-gray-700">{dimension.shortName}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Phases (Rings)</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-1 bg-gray-300 rounded"></div>
                <span className="text-gray-700">Inner → Outer</span>
              </div>
              <div className="text-xs text-gray-500 ml-5">
                Analysis → Design → Implementation → Monitoring
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Progress</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 border-2 border-gray-400 rounded-full bg-transparent"></div>
                <span className="text-gray-700">Unread</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-transparent"></div>
                <span className="text-gray-700">Read</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">✓</span>
                </div>
                <span className="text-gray-700">Saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactSidebar;