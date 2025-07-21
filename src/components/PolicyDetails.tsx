import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { Policy, Dimension, Phase } from '../services/tpafDataService';
import type { UNESCOExpert } from '../services/unescoExpertService';
import ExpertCard from './ExpertCard';

interface PolicyDetailsProps {
  selectedPolicy: Policy | null;
  hoveredPolicy: Policy | null;
  savedPolicies: Set<number>;
  activeTab: 'overview' | 'examples' | 'implementation' | 'experts';
  experts: UNESCOExpert[];
  isLoadingExperts: boolean;
  expertError: string | null;
  dimensionBackgrounds: Record<string, string>;
  onToggleSavedPolicy: (policyId: number) => void;
  onBackToPhase: () => void;
  onTabChange: (tab: 'overview' | 'examples' | 'implementation' | 'experts') => void;
  getDimension: (dimensionId: string) => Dimension | undefined;
  getPhase: (phaseId: string) => Phase | undefined;
}

const PolicyDetails: React.FC<PolicyDetailsProps> = ({
  selectedPolicy,
  hoveredPolicy,
  savedPolicies,
  activeTab,
  experts,
  isLoadingExperts,
  expertError,
  dimensionBackgrounds,
  onToggleSavedPolicy,
  onBackToPhase,
  onTabChange,
  getDimension,
  getPhase
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200"
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {selectedPolicy ? (
        <>

          {/* Header - Fixed height */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-lg font-semibold text-black">Policy Details</h3>
              <button 
                onClick={() => onToggleSavedPolicy(selectedPolicy.id)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors"
              >
                {savedPolicies.has(selectedPolicy.id) ? (
                  <>
                    <BookmarkCheck className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-medium">Saved to Journey</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-medium">Save to Journey</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs Below Header */}
            <div className="flex px-4 border-t border-gray-100">
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => onTabChange('overview')}
              >
                Overview
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'examples'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => onTabChange('examples')}
              >
                Examples
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'implementation'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => onTabChange('implementation')}
              >
                Implementation
              </button>

              {selectedPolicy?.expertReferences && selectedPolicy.expertReferences.length > 0 && (
                <button
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === 'experts'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => onTabChange('experts')}
                >
                  Experts
                </button>
              )}
            </div>
          </div>

          
          {/* Scrollable Content Area */}
          <div className="overflow-y-auto flex-1 p-4">
            {/* Consistent Policy Title Section Across All Tabs */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-full">
                <div className="relative w-full mb-2">
                  <div 
                    className="h-[3px] w-full rounded-full"
                    style={{
                      backgroundImage: `url(${dimensionBackgrounds[selectedPolicy.dimension as keyof typeof dimensionBackgrounds]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 0.9
                    }}
                  />
                </div>
                
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedPolicy.title}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {getPhase(selectedPolicy.phaseId)?.name} Phase
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedPolicy.description}
              </div>
            )}
            
            {activeTab === 'examples' && selectedPolicy.examples && (
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold mb-3 text-gray-900">Implementation Examples</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedPolicy.examples}
                </p>
              </div>
            )}
            
            {activeTab === 'implementation' && selectedPolicy.details && (
              <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold mb-3 text-gray-900">Implementation Guidance</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedPolicy.details}
                </p>
              </div>
            )}

            {activeTab === 'experts' && (
              <div className="space-y-4">
                {isLoadingExperts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : expertError ? (
                  <div className="text-center py-4 text-red-500">
                    {expertError}
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 text-blue-600 hover:underline block"
                    >
                      Try Again
                    </button>
                  </div>
                ) : experts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experts.map(expert => (
                      <ExpertCard key={expert.id} expert={expert} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No expert recommendations available for this policy.</p>
                    <a
                      href="https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Search UNESCO's Expert Database
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : hoveredPolicy ? (
        <div className="p-4">
          <div className="h-[3px] w-full mb-3 rounded-full"
            style={{
              backgroundImage: `url(${dimensionBackgrounds[hoveredPolicy.dimension as keyof typeof dimensionBackgrounds]})`,
              backgroundSize: 'cover',
              opacity: 0.8
            }}
          />
          <h3 className="text-lg font-medium line-clamp-1">{hoveredPolicy.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded" 
              style={{ 
                backgroundColor: `${getDimension(hoveredPolicy.dimension)?.color}20`,
                color: getDimension(hoveredPolicy.dimension)?.color
              }}>
              {getDimension(hoveredPolicy.dimension)?.shortName}
            </span>
            <span className="text-xs text-gray-500">
              {hoveredPolicy.complexity}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Click to see full details
          </div>
        </div>
      ) : (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-black mb-3">Policy Details</h3>
          <div className="text-center py-4 text-gray-400">
            <div className="mx-auto h-8 w-8 mb-2">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <p className="text-sm">Hover over policies to preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyDetails;