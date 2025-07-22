import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Settings, Info, Download, RefreshCw, Search, Bookmark, BookmarkCheck, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { useTPAFData } from '../hooks/useTPAFData';
import type { Policy, Dimension, Phase } from '../services/tpafDataService';
import Breadcrumbs from './Breadcrumbs';
import type { BreadcrumbItem } from './Breadcrumbs';
import PolicyDetails from './PolicyDetails';
import CompactSidebar from './SideBar';
import { useJourneyExporter } from './JourneyExporter';
import coverImage from '../assets/only-cover.png';
import g20Logo from '../assets/g20-logo.png';
import { fetchExpertDetails as fetchExpertDetailsAPI, fetchExpertsByFilters } from '../services/unescoExpertService';
import type { UNESCOExpert } from '../services/unescoExpertService';
import ExpertCard from './ExpertCard';
import blueBg from '../assets/dimension-bgs/blue-bg.png';
import greenBg from '../assets/dimension-bgs/green-bg.png';
import purpleBg from '../assets/dimension-bgs/purple-bg.png';
import redBg from '../assets/dimension-bgs/red-bg.png';
import yellowBg from '../assets/dimension-bgs/yellow-bg.png';

type NavigationLevel = 'overview' | 'dimension' | 'phase' | 'policy';

type PolicyPosition = {
  policy: Policy;
  x: number;
  y: number;
};

type HexagonalCell = {
  id: string;
  policy?: Policy;
  phase?: Phase;
  dimension?: Dimension;
  x: number;
  y: number;
  type: 'center' | 'phase' | 'dimension' | 'policy';
  color: string;
  isVisible: boolean;
  title: string;
  subtitle?: string;
  clickAction: () => void;
};

const dimensionBackgrounds = {
  'infrastructure': blueBg,
  'legislation': yellowBg,
  'sustainability': purpleBg,
  'economic': redBg,
  'education': greenBg
};

const TPAFHexagonalVisualization: React.FC = () => {
  const expertCache = useRef(new Map<string, UNESCOExpert>()).current;
  const { data, loading, error, reloadData } = useTPAFData(process.env.PUBLIC_URL + '/data.xlsx');
  
  // Navigation state
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>('overview');
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>('');
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  
  // UI state
  const [experts, setExperts] = useState<UNESCOExpert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string>('');
  const [showConnections, setShowConnections] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'implementation' | 'experts'>('overview');
  const [animating, setAnimating] = useState(false);
  
  // Journey tracking state
  const [readPolicies, setReadPolicies] = useState<Set<number>>(new Set());
  const [savedPolicies, setSavedPolicies] = useState<Set<number>>(new Set());
  const [expertError, setExpertError] = useState<string | null>(null);

  const viewBoxWidth = 1100;
  const viewBoxHeight = 490;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;
  const hexRadius = 90; // Larger hexagons for better UX
  const hexSpacing = hexRadius * 1.6;

  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize journey exporter
  const { exportJourneyPDF, exportJourneyJSON } = useJourneyExporter({
    savedPolicies,
    readPolicies,
    data,
    svgRef
  });

  const fetchExpertDetails = useCallback(async (id: string): Promise<UNESCOExpert | null> => {
    if (expertCache.has(id)) {
      return expertCache.get(id) || null;
    }
    
    try {
      const expert = await fetchExpertDetailsAPI(id);
      if (expert) {
        expertCache.set(id, expert);
      }
      return expert;
    } catch (error) {
      console.error('Error fetching expert details:', error);
      return null;
    }
  }, [expertCache]);

  // Navigation functions
  const navigateToOverview = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setNavigationLevel('overview');
      setSelectedDimensionId('');
      setSelectedPhaseId('');
      setSelectedPolicy(null);
      setAnimating(false);
    }, 150);
  }, []);

  const navigateToDimension = useCallback((dimensionId: string) => {
    setAnimating(true);
    setTimeout(() => {
      setNavigationLevel('dimension');
      setSelectedDimensionId(dimensionId);
      setSelectedPhaseId('');
      setSelectedPolicy(null);
      setAnimating(false);
    }, 150);
  }, []);

  const navigateToPhase = useCallback((phaseId: string) => {
    setAnimating(true);
    setTimeout(() => {
      setNavigationLevel('phase');
      setSelectedPhaseId(phaseId);
      setSelectedPolicy(null);
      setAnimating(false);
    }, 150);
  }, []);

  const navigateToPolicy = useCallback((policy: Policy) => {
    setAnimating(true);
    setTimeout(() => {
      setNavigationLevel('policy');
      setSelectedPolicy(policy);
      markPolicyRead(policy.id);
      setAnimating(false);
    }, 150);
  }, []);

  const goBack = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      if (navigationLevel === 'policy') {
        setNavigationLevel('phase');
        setSelectedPolicy(null);
      } else if (navigationLevel === 'phase') {
        setNavigationLevel('dimension');
        setSelectedPhaseId('');
      } else if (navigationLevel === 'dimension') {
        setNavigationLevel('overview');
        setSelectedDimensionId('');
      }
      setAnimating(false);
    }, 150);
  }, [navigationLevel]);

  // Journey tracking functions
  const toggleSavedPolicy = useCallback((policyId: number) => {
    setSavedPolicies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(policyId)) {
        newSet.delete(policyId);
      } else {
        newSet.add(policyId);
      }
      localStorage.setItem('savedPolicies', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  const markPolicyRead = useCallback((policyId: number) => {
    setReadPolicies(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(policyId)) {
        newSet.add(policyId);
        localStorage.setItem('readPolicies', JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
  }, []);

  // Enhanced download function with PDF support
  const downloadJourney = useCallback(async () => {
    try {
      await exportJourneyPDF();
    } catch (error) {
      console.error('PDF export failed, falling back to JSON:', error);
      exportJourneyJSON();
    }
  }, [exportJourneyPDF, exportJourneyJSON]);

  // Load saved/read policies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedPolicies');
    if (saved) setSavedPolicies(new Set(JSON.parse(saved).map(Number)));
    
    const read = localStorage.getItem('readPolicies');
    if (read) setReadPolicies(new Set(JSON.parse(read).map(Number)));
  }, []);

  // Load experts when policy is selected
  useEffect(() => {
    if (selectedPolicy?.keywords) {
      const fetchExperts = async () => {
        setIsLoadingExperts(true);
        setExpertError(null);
        try {
          const fetchedExperts = await fetchExpertsByFilters({
            expertise: selectedPolicy.keywords
          });
          
          if (fetchedExperts.length === 0) {
            setExpertError('No experts found for these keywords');
          }
          
          const expertsWithDetails = await Promise.all(
            fetchedExperts.map(async expert => 
              await fetchExpertDetails(expert.id) || expert
            )
          );
          
          setExperts(expertsWithDetails.filter(Boolean));
        } catch (error) {
          console.error('Error loading experts:', error);
          setExpertError('Failed to load expert data. Please try again later.');
        } finally {
          setIsLoadingExperts(false);
        }
      };
      
      fetchExperts();
    }
  }, [selectedPolicy, fetchExpertDetails]);

  // Get dimension info
  const getDimension = (dimensionId: string): Dimension | undefined => 
    data.dimensions.find(d => d.id === dimensionId);

  // Get phase info
  const getPhase = (phaseId: string): Phase | undefined => 
    data.phases.find(p => p.id === phaseId);

  // Hexagon generation functions
  const generateHexagonPath = (centerX: number, centerY: number, size: number): string => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * Math.PI / 180;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  // Convert horizontal coordinates to pixel coordinates
  const horizontalToPixel = (index: number, total: number, yOffset: number = 0): { x: number, y: number } => {
    const spacing = hexSpacing * 1.5;
    const startX = centerX - ((total - 1) * spacing) / 2;
    return {
      x: startX + (index * spacing),
      y: centerY + yOffset
    };
  };

  // Text wrapping for hexagons
  const wrapText = (text: string, maxLength: number): string[] => {
    if (text.length <= maxLength) return [text];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word.length > maxLength ? word.substring(0, maxLength - 3) + '...' : word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3);
  };

  // Calculate hexagonal cells based on navigation level
  const hexagonalCells = useMemo(() => {
    const cells: HexagonalCell[] = [];

    if (navigationLevel === 'overview') {
      // 5 Dimensions in a horizontal line
      data.dimensions.slice(0, 5).forEach((dimension, index) => {
        const pos = horizontalToPixel(index, 5);
        
        cells.push({
          id: dimension.id,
          dimension,
          x: pos.x,
          y: pos.y,
          type: 'dimension',
          color: dimension.color,
          isVisible: true,
          title: dimension.shortName,
          subtitle: `${data.policies.filter(p => p.dimension === dimension.id).length} policies`,
          clickAction: () => navigateToDimension(dimension.id)
        });
      });
    }

    else if (navigationLevel === 'dimension') {
      const selectedDimension = getDimension(selectedDimensionId);
      if (!selectedDimension) return cells;

      // Center - Selected dimension
      cells.push({
        id: selectedDimensionId,
        dimension: selectedDimension,
        x: centerX,
        y: centerY,
        type: 'dimension',
        color: selectedDimension.color,
        isVisible: true,
        title: selectedDimension.shortName,
        subtitle: selectedDimension.name,
        clickAction: () => {}
      });

      // Phases in a horizontal line below the center
      const relevantPhases = data.phases.filter(phase => 
        phase.policies.some(policy => policy.dimension === selectedDimensionId)
      );

      relevantPhases.slice(0, 4).forEach((phase, index) => {
        const pos = horizontalToPixel(index, relevantPhases.length, hexSpacing * 0.8);
        const policyCount = data.policies.filter(p => p.phaseId === phase.id && p.dimension === selectedDimensionId).length;
        
        cells.push({
          id: phase.id,
          phase,
          x: pos.x,
          y: pos.y,
          type: 'phase',
          color: '#4f46e5',
          isVisible: true,
          title: phase.name,
          subtitle: `${policyCount} policies`,
          clickAction: () => navigateToPhase(phase.id)
        });
      });
    }

    else if (navigationLevel === 'phase') {
      const selectedPhase = getPhase(selectedPhaseId);
      const selectedDimension = getDimension(selectedDimensionId);
      if (!selectedPhase || !selectedDimension) return cells;

      // Center - Selected phase
      cells.push({
        id: selectedPhaseId,
        phase: selectedPhase,
        x: centerX,
        y: centerY,
        type: 'phase',
        color: '#4f46e5',
        isVisible: true,
        title: selectedPhase.name,
        subtitle: selectedDimension.shortName,
        clickAction: () => {}
      });

      // Policies in horizontal lines above and below center
      const phasePolicies = data.policies.filter(p => 
        p.phaseId === selectedPhaseId && p.dimension === selectedDimensionId
      ).filter(policy => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return policy.title.toLowerCase().includes(query) ||
               policy.description.toLowerCase().includes(query) ||
               policy.keywords.some(k => k.toLowerCase().includes(query));
      });

      // Split policies into two rows
      const half = Math.ceil(phasePolicies.length / 2);
      const topRow = phasePolicies.slice(0, half);
      const bottomRow = phasePolicies.slice(half, half * 2);

      topRow.forEach((policy, index) => {
        const pos = horizontalToPixel(index, topRow.length, -hexSpacing * 0.8);
        
        cells.push({
          id: policy.id.toString(),
          policy,
          x: pos.x,
          y: pos.y,
          type: 'policy',
          color: selectedDimension.color,
          isVisible: true,
          title: `#${policy.id}`,
          subtitle: policy.title.length > 30 ? `${policy.title.substring(0, 27)}...` : policy.title,
          clickAction: () => navigateToPolicy(policy)
        });
      });

      bottomRow.forEach((policy, index) => {
        const pos = horizontalToPixel(index, bottomRow.length, hexSpacing * 0.8);
        
        cells.push({
          id: policy.id.toString(),
          policy,
          x: pos.x,
          y: pos.y,
          type: 'policy',
          color: selectedDimension.color,
          isVisible: true,
          title: `#${policy.id}`,
          subtitle: policy.title.length > 30 ? `${policy.title.substring(0, 27)}...` : policy.title,
          clickAction: () => navigateToPolicy(policy)
        });
      });
    }

    return cells;
  }, [
    navigationLevel, 
    selectedDimensionId, 
    selectedPhaseId, 
    data, 
    searchQuery, 
    readPolicies, 
    savedPolicies,
    centerX,
    centerY,
    hexSpacing,
    getDimension,
    getPhase,
    navigateToDimension,
    navigateToPhase,
    navigateToPolicy
  ]);

  // Breadcrumb data
  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbItem[] = [];
    
    if (navigationLevel !== 'overview') {
      items.push({ id: 'overview', name: 'Overview', type: 'dimension' });
    }
    
    if (selectedDimensionId && navigationLevel !== 'dimension') {
      const dimension = getDimension(selectedDimensionId);
      if (dimension) {
        items.push({ id: selectedDimensionId, name: dimension.shortName, type: 'dimension' });
      }
    }
    
    if (selectedPhaseId && navigationLevel !== 'phase') {
      const phase = getPhase(selectedPhaseId);
      if (phase) {
        items.push({ id: selectedPhaseId, name: phase.name, type: 'phase' });
      }
    }
    
    if (selectedPolicy) {
      items.push({ id: selectedPolicy.id.toString(), name: selectedPolicy.title, type: 'policy' });
    }
    
    return items;
  }, [navigationLevel, selectedDimensionId, selectedPhaseId, selectedPolicy, getDimension, getPhase]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading TPAF data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4 text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Data Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              reloadData();
              navigateToOverview();
            }}
            className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center gap-2 text-sm mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      {/* Header */}
      <div className="w-full mx-auto mb-6 flex justify-center relative">
        <div 
          className="flex flex-col rounded-xl shadow-lg overflow-hidden relative"
          style={{
            width: 'min(1448px, 95vw)',
            height: 'min(300px, 25vw)',
            minHeight: '180px',
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* G20 Logo */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img 
              src={g20Logo} 
              alt="G20 Logo" 
              className="h-10 sm:h-14 object-contain"
            />
          </div>

          {/* Title */}
          <div className="absolute left-4 sm:left-12 top-1/2 transform -translate-y-1/2">
            <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
              G20 Technology Policy<br />Assistance Facility
            </h1>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
            <div className="flex flex-wrap justify-end gap-2 bg-black bg-opacity-50 p-2 rounded-lg backdrop-blur-sm">
              
              {/* Back Button */}
              {navigationLevel !== 'overview' && (
                <button 
                  onClick={goBack}
                  className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm flex items-center gap-2 hover:bg-white hover:bg-opacity-10"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Back
                </button>
              )}
              
              {/* Home Button */}
              {navigationLevel !== 'overview' && (
                <button 
                  onClick={navigateToOverview}
                  className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm flex items-center gap-2 hover:bg-white hover:bg-opacity-10"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              )}
              
              {/* Search - only show at phase level */}
              {navigationLevel === 'phase' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white" />
                  <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border border-white rounded-lg pl-8 pr-3 py-2 text-white text-xs placeholder-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-32 sm:w-40"
                  />
                </div>
              )}
              
              {/* Download Journey */}
              <button 
                onClick={downloadJourney}
                className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm flex items-center gap-2 hover:bg-white hover:bg-opacity-10"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbItems.length > 0 && (
        <div className="w-full flex justify-center mb-4">
          <div style={{ width: 'min(1448px, 95vw)' }}>
            <Breadcrumbs 
              items={breadcrumbItems}
              onSelect={(id: string, type: 'dimension' | 'phase' | 'policy') => {
                if (type === 'dimension' && id === 'overview') {
                  navigateToOverview();
                } else if (type === 'dimension') {
                  navigateToDimension(id);
                } else if (type === 'phase') {
                  navigateToPhase(id);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Main Visualization */}
      <div className="w-full flex justify-center mb-8">
        <div className={`grid gap-6 ${navigationLevel === 'policy' ? 'grid-cols-10' : 'grid-cols-1'}`} style={{ width: 'min(1448px, 95vw)' }}>
          
          {/* Hexagonal Visualization */}
          <div className={navigationLevel === 'policy' ? 'col-span-6' : 'col-span-1'}>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 min-h-[600px] relative overflow-hidden">
              
              {/* Level indicator */}
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {navigationLevel === 'overview' ? 'Dimensions' : 
                   navigationLevel === 'dimension' ? 'Phases' :
                   navigationLevel === 'phase' ? 'Policies' : 'Policy Details'}
                </div>
              </div>

              <svg 
                ref={svgRef} 
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
                className={`w-full h-full transition-all duration-300 ${animating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
                style={{ overflow: 'visible' }}
              >
                
                {/* Hexagonal cells */}
                {hexagonalCells.map((cell) => {
                  const isHovered = hoveredCell === cell.id;
                  const isCenter = (navigationLevel === 'dimension' && cell.id === selectedDimensionId) ||
                                   (navigationLevel === 'phase' && cell.id === selectedPhaseId);
                  const isSaved = cell.policy && savedPolicies.has(cell.policy.id);
                  const isRead = cell.policy && readPolicies.has(cell.policy.id);
                  
                  const hexSize = isCenter ? hexRadius * 1.2 : hexRadius;
                  const strokeWidth = isCenter ? 4 : isHovered ? 3 : 2;
                  const opacity = isRead && cell.policy ? 1 : cell.policy ? 0.8 : 1;
                  
                  return (
                    <g key={cell.id}>
                      {/* Glow effect for hover */}
                      {isHovered && (
                        <path
                          d={generateHexagonPath(cell.x, cell.y, hexSize + 8)}
                          fill={cell.color}
                          opacity="0.3"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Main hexagon */}
                      <path
                        d={generateHexagonPath(cell.x, cell.y, hexSize)}
                        fill={cell.type === 'policy' && !isRead ? `${cell.color}60` : cell.color}
                        stroke={isHovered ? '#ffffff' : cell.color}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        className={`cursor-pointer transition-all duration-200 hover:brightness-110`}
                        onClick={cell.clickAction}
                        onMouseEnter={() => setHoveredCell(cell.id)}
                        onMouseLeave={() => setHoveredCell('')}
                      />

                      {/* Text content */}
                      <g className="pointer-events-none">
                        <text
                          x={cell.x}
                          y={cell.y - (cell.subtitle ? 8 : 0)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-bold fill-white"
                          fontSize={isCenter ? "18" : "14"}
                        >
                          {cell.title}
                        </text>
                        {cell.subtitle && (
                          <text
                            x={cell.x}
                            y={cell.y + 12}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-white/80"
                            fontSize="10"
                          >
                            {cell.subtitle.length > 25 ? `${cell.subtitle.substring(0, 22)}...` : cell.subtitle}
                          </text>
                        )}
                      </g>

                      {/* Policy indicators */}
                      {cell.policy && (
                        <g>
                          {/* Read indicator */}
                          {isRead && (
                            <circle
                              cx={cell.x}
                              cy={cell.y + hexSize - 15}
                              r="4"
                              fill="white"
                              className="animate-pulse"
                            />
                          )}
                          
                          {/* Saved indicator */}
                          {isSaved && (
                            <g transform={`translate(${cell.x + hexSize - 15}, ${cell.y - hexSize + 15})`}>
                              <circle r="8" fill="#22c55e" stroke="white" strokeWidth="2"/>
                              <path
                                d="M-4 0L0 4L4 -4"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                              />
                            </g>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Instructions overlay */}
                {navigationLevel === 'overview' && (
                  <g transform="translate(700, 1)">
                    <rect x="0" y="0" width="420" height="100" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="12" opacity="0.95"/>
                    <text x="20" y="30" className="font-bold fill-gray-800" fontSize="16">Choose Your Policy Dimension</text>
                    <text x="20" y="55" className="fill-gray-600" fontSize="12">Click on any dimension below to explore its phases and policies</text>
                    <text x="20" y="80" className="fill-blue-600" fontSize="11">• Each dimension contains organized policy frameworks</text>
                  </g>
                )}

                {navigationLevel === 'dimension' && (
                  <g transform="translate(50, 50)">
                    <rect x="0" y="0" width="280" height="100" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="12" opacity="0.95"/>
                    <text x="20" y="30" className="font-bold fill-gray-800" fontSize="16">Phase Selection</text>
                    <text x="20" y="55" className="fill-gray-600" fontSize="12">Click on a phase to view its policies</text>
                    <text x="20" y="80" className="fill-blue-600" fontSize="11">• Each phase contains related policies</text>
                  </g>
                )}

                {navigationLevel === 'phase' && (
                  <g transform="translate(50, 50)">
                    <rect x="0" y="0" width="300" height="120" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="12" opacity="0.95"/>
                    <text x="20" y="30" className="font-bold fill-gray-800" fontSize="16">Policy Selection</text>
                    <text x="20" y="55" className="fill-gray-600" fontSize="12">Click on any policy to view details</text>
                    <text x="20" y="75" className="fill-gray-600" fontSize="12">Search policies using the top bar</text>
                    <circle cx="250" cy="85" r="4" fill="#22c55e"/>
                    <text x="260" y="89" className="fill-gray-600" fontSize="10">Saved</text>
                    <circle cx="250" cy="105" r="3" fill="white" stroke="#666" strokeWidth="1"/>
                    <text x="260" y="109" className="fill-gray-600" fontSize="10">Read</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Policy Details Sidebar - only show when policy is selected */}
          {navigationLevel === 'policy' && selectedPolicy && (
            <div className="col-span-4">
              <PolicyDetails
                selectedPolicy={selectedPolicy}
                hoveredPolicy={null}
                savedPolicies={savedPolicies}
                activeTab={activeTab}
                experts={experts}
                isLoadingExperts={isLoadingExperts}
                expertError={expertError}
                dimensionBackgrounds={dimensionBackgrounds}
                onToggleSavedPolicy={toggleSavedPolicy}
                onBackToPhase={() => goBack()}
                onTabChange={setActiveTab}
                getDimension={getDimension}
                getPhase={getPhase}
              />
            </div>
          )}
        </div>
      </div>

      {/* Context Information Panel */}
      <div className="w-full flex justify-center mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30" style={{ width: 'min(1448px, 95vw)' }}>
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Current Context */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Current Context
              </h3>
              <div className="space-y-2 text-sm">
                {navigationLevel === 'overview' && (
                  <p className="text-gray-600">Viewing all 5 policy dimensions. Click any dimension to explore its phases.</p>
                )}
                {navigationLevel === 'dimension' && selectedDimensionId && (
                  <div>
                    <p className="font-medium text-gray-800">{getDimension(selectedDimensionId)?.name}</p>
                    <p className="text-gray-600">Explore the phases within this dimension to find relevant policies.</p>
                  </div>
                )}
                {navigationLevel === 'phase' && selectedPhaseId && (
                  <div>
                    <p className="font-medium text-gray-800">{getPhase(selectedPhaseId)?.name}</p>
                    <p className="text-gray-600">Browse through the policies in this implementation phase.</p>
                  </div>
                )}
                {navigationLevel === 'policy' && selectedPolicy && (
                  <div>
                    <p className="font-medium text-gray-800">{selectedPolicy.title}</p>
                    <p className="text-gray-600">{selectedPolicy.description.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Progress
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{readPolicies.size}</div>
                  <div className="text-gray-600">Policies Read</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{savedPolicies.size}</div>
                  <div className="text-gray-600">Policies Saved</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={navigateToOverview}
                  className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-sm transition-colors"
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  Return to Overview
                </button>
                <button 
                  onClick={downloadJourney}
                  className="w-full bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg px-3 py-2 text-blue-800 text-sm transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Journey
                </button>
                <a
                  href="https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg px-3 py-2 text-green-800 text-sm transition-colors block text-center"
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Find Experts
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Policies Section - only show when policy is selected and has connections */}

      {/* Connected Policies Section - only show when policy is selected and has connections */}
      {navigationLevel === 'policy' && selectedPolicy && selectedPolicy.connections && selectedPolicy.connections.length > 0 && (
        <div className="w-full flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30" style={{ width: 'min(1448px, 95vw)' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Related Policies ({selectedPolicy.connections.length})
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPolicy.connections
                .sort((a: any, b: any) => b.strength - a.strength)
                .slice(0, 6)
                .map((conn: any) => {
                  const connectedPolicy = data.policies.find((p: any) => p.id === conn.id);
                  if (!connectedPolicy) return null;
                  
                  return (
                    <div 
                      key={conn.id}
                      className="bg-white/70 rounded-lg p-4 border border-white/40 hover:bg-white/90 cursor-pointer transition-all"
                      onClick={() => navigateToPolicy(connectedPolicy)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800 text-sm">{connectedPolicy.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          conn.strength === 5 ? 'bg-green-100 text-green-800' :
                          conn.strength === 4 ? 'bg-blue-100 text-blue-800' :
                          conn.strength === 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {conn.strength}/5
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mb-2">{connectedPolicy.description.substring(0, 80)}...</p>
                      <div className="flex flex-wrap gap-1">
                        {conn.sharedKeywords.slice(0, 2).map((keyword: any) => (
                          <span key={keyword} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                        {conn.sharedKeywords.length > 2 && (
                          <span className="text-xs text-gray-500 px-1">+{conn.sharedKeywords.length - 2}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPAFHexagonalVisualization;