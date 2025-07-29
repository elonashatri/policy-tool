import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Settings, Info, Download, RefreshCw, Search, Bookmark, BookmarkCheck, CheckCircle } from 'lucide-react';
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

interface TPAFCircularVisualizationProps {
  onNavigateToHome?: () => void;
}

type PolicyPosition = {
  policy: Policy;
  x: number;
  y: number;
};

type PolicySegment = {
  policy: Policy;
  dimension: Dimension;
  phase: Phase;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
};

const dimensionBackgrounds = {
  'infrastructure': blueBg,
  'legislation': yellowBg,
  'sustainability': purpleBg,
  'economic': redBg,
  'education': greenBg
};

const phaseRingConfig = {
  'analyse-needs-and-plan-for-fundamentals': { innerRadius: 90, outerRadius: 120 },
  'design-of-policies-and-process': { innerRadius: 120, outerRadius: 150 },
  'policy-implementation': { innerRadius: 150, outerRadius: 180 },
  'monitoring-and-evaluation': { innerRadius: 180, outerRadius: 210 }
};

const TPAFCircularVisualization: React.FC<TPAFCircularVisualizationProps> = ({
    onNavigateToHome
  }) => {
  const expertCache = useRef(new Map<string, UNESCOExpert>()).current;
  const { data, loading, error, reloadData } = useTPAFData(process.env.PUBLIC_URL + '/data.xlsx');
  
  // Existing state
  const [experts, setExperts] = useState<UNESCOExpert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [hoveredPolicy, setHoveredPolicy] = useState<Policy | null>(null);
  const [selectedConnectionKeyword, setSelectedConnectionKeyword] = useState<string>('');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState<boolean>(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConnectedPolicies, setShowConnectedPolicies] = useState<boolean>(true);
  const [navigationPath, setNavigationPath] = useState<BreadcrumbItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'implementation' | 'experts'>('overview');
  const [hoveredConnection, setHoveredConnection] = useState<{
    source: Policy;
    target: Policy;
    strength: number;
    keywords: string[];
  } | null>(null);
  
  // Journey tracking state
  const [readPolicies, setReadPolicies] = useState<Set<number>>(new Set());
  const [savedPolicies, setSavedPolicies] = useState<Set<number>>(new Set());
  const [expertError, setExpertError] = useState<string | null>(null);

  const viewBoxWidth = 650;
  const viewBoxHeight = 500;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;


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

  const resetAllSelections = useCallback(() => {
    setSelectedDimension('all');
    setSelectedPhase(null);
    setSelectedPolicy(null);
    setSelectedKeyword('');
    setSearchQuery('');
    setNavigationPath([]);
    setShowConnections(false);
    setActiveTab('overview');
  }, []);

  // Debounced hover handlers
  const handleMouseEnter = useCallback((policy: Policy) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (!selectedPolicy || policy.id !== selectedPolicy.id) {
      setHoveredPolicy(policy);
    }
  }, [selectedPolicy]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPolicy(null);
    }, 100);
  }, []);

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

  // Helper functions for breadcrumb navigation
  const addToPath = (item: BreadcrumbItem) => {
    setNavigationPath(prev => {
      if (item.type === 'dimension') return [item];
      if (item.type === 'phase') {
        const dimensionItem = prev.find(i => i.type === 'dimension');
        return dimensionItem ? [dimensionItem, item] : [item];
      }
      return [...prev.filter(i => i.type !== 'policy'), item];
    });
  };

  const handleBreadcrumbClick = (id: string, type: 'dimension' | 'phase' | 'policy') => {
    const index = navigationPath.findIndex(item => item.id === id);
    if (index === -1) return;

    const newPath = navigationPath.slice(0, index + 1);
    setNavigationPath(newPath);

    const dimensionItem = newPath.find(i => i.type === 'dimension');
    const phaseItem = newPath.find(i => i.type === 'phase');
    const policyItem = newPath.find(i => i.type === 'policy');

    setSelectedDimension(dimensionItem?.id || 'all');
    setSelectedPhase(phaseItem?.id || null);
    
    if (policyItem) {
      const policy = data.policies.find(p => p.id.toString() === policyItem.id);
      setSelectedPolicy(policy || null);
    } else {
      setSelectedPolicy(null);
    }
  };

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

  // Mark policy as read when selected
  useEffect(() => {
    if (selectedPolicy) {
      markPolicyRead(selectedPolicy.id);
    }
  }, [selectedPolicy, markPolicyRead]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Sync selections with breadcrumbs
  useEffect(() => {
    if (selectedDimension !== 'all') {
      const dimension = data.dimensions.find(d => d.id === selectedDimension);
      if (dimension) {
        addToPath({
          id: dimension.id,
          name: dimension.shortName,
          type: 'dimension'
        });
      }
    }
  }, [selectedDimension, data.dimensions]);

  useEffect(() => {
    if (selectedPhase) {
      const phase = data.phases.find(p => p.id === selectedPhase);
      if (phase) {
        addToPath({
          id: phase.id,
          name: phase.name,
          type: 'phase'
        });
      }
    }
  }, [selectedPhase, data.phases]);

  useEffect(() => {
    if (selectedPolicy) {
      addToPath({
        id: selectedPolicy.id.toString(),
        name: selectedPolicy.title,
        type: 'policy'
      });
    }
  }, [selectedPolicy]);

  useEffect(() => {
    const interval = setInterval(() => {
      reloadData(); // Calls the data reload function
    }, 300000); // 5 minute refresh
    return () => clearInterval(interval);
  }, []);
  
  // Calculate visible policies based on filters
  const visiblePolicies = useMemo(() => {
    let result = data.policies;
    
    if (selectedDimension !== 'all') {
      result = result.filter(p => p.dimension === selectedDimension);
    }
    
    if (selectedPhase) {
      result = result.filter(p => p.phaseId === selectedPhase);
    }
    
    if (selectedKeyword) {
      result = result.filter(p => p.keywords.includes(selectedKeyword));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [data.policies, selectedDimension, selectedPhase, selectedKeyword, searchQuery]);

  // Get visible connections
  const getVisibleConnections = () => {
    if (!showConnections) return [];
    
    if (selectedPolicy) {
      const connections: Array<{
        source: Policy;
        target: Policy;
        strength: number;
        keywords: string[];
      }> = [];
      
      if (selectedPolicy.connections) {
        selectedPolicy.connections.forEach(connection => {
          if (connection.strength >= 2) {
            const targetPolicy = data.policies.find(p => p.id === connection.id);
            if (targetPolicy) {
              connections.push({
                source: selectedPolicy,
                target: targetPolicy,
                strength: connection.strength,
                keywords: connection.sharedKeywords
              });
            }
          }
        });
      }
      
      return connections;
    }
    
    const connections: Array<{
      source: Policy;
      target: Policy;
      strength: number;
      keywords: string[];
    }> = [];
    const visiblePolicyIds = new Set(visiblePolicies.map(p => p.id));
    
    visiblePolicies.forEach(policy => {
      if (policy.connections) {
        policy.connections.forEach(connection => {
          if (visiblePolicyIds.has(connection.id) && connection.strength >= 2) {
            const targetPolicy = data.policies.find(p => p.id === connection.id);
            if (targetPolicy && policy.id < targetPolicy.id) {
              connections.push({
                source: policy,
                target: targetPolicy,
                strength: connection.strength,
                keywords: connection.sharedKeywords
              });
            }
          }
        });
      }
    });
    
    return connections;
  };


  // Convert polar to cartesian coordinates - now requires explicit center coordinates
  const polarToCartesian = (angle: number, radius: number, centerX: number, centerY: number) => {
    const radian = (angle - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    };
  };

  // Get dimension info
  const getDimension = (dimensionId: string): Dimension | undefined => 
    data.dimensions.find(d => d.id === dimensionId);

  // Get phase info
  const getPhase = (phaseId: string): Phase | undefined => 
    data.phases.find(p => p.id === phaseId);

  // Calculate positions and segments for policies
  const { policySegments, policyPositions } = useMemo(() => {
    const policySegments: PolicySegment[] = [];
    const policyPositions: PolicyPosition[] = [];

    const colorVariations = {
      'infrastructure': ['#a8c6fa', '#6a9ceb', '#3a72c2', '#20508e'],  // Blue
      'legislation': ['#fde6a8', '#fbd575', '#f5b745', '#efae42'],     // Yellow
      'sustainability': ['#d9b5ff', '#c387fa', '#a55aee', '#8724d3'],  // Purple
      'economic': ['#ffa3a3', '#f87373', '#e54e4e', '#cf3535'],        // Red
      'education': ['#8fc9a8', '#5eaa7f', '#3a7d54', '#255a34']         // Green
    };

    if (data.dimensions.length > 0 && data.phases.length > 0) {
      data.dimensions.forEach((dimension) => {
        if (selectedDimension !== 'all' && dimension.id !== selectedDimension) return;
        
        const dimensionStartAngle = dimension.angle - 36;
        const dimensionPolicies = visiblePolicies.filter(p => p.dimension === dimension.id);
        
        const policiesByPhase = data.phases.reduce((acc, phase) => {
          acc[phase.id] = dimensionPolicies.filter(p => p.phaseId === phase.id);
          return acc;
        }, {} as Record<string, Policy[]>);
        
        data.phases.forEach(phase => {
          const phasePolicies = policiesByPhase[phase.id] || [];
          if (phasePolicies.length === 0) return;
          
          const ring = phaseRingConfig[phase.id as keyof typeof phaseRingConfig];
          if (!ring) return;
          
          
          const segmentWidth = 72 / phasePolicies.length;
          const colors = colorVariations[dimension.id as keyof typeof colorVariations];
          
          phasePolicies.forEach((policy, index) => {
            const segmentStartAngle = dimensionStartAngle + (index * segmentWidth);
            const segmentEndAngle = segmentStartAngle + segmentWidth;
            
            const phaseIndex = data.phases.findIndex(p => p.id === phase.id);
            const color = colors[phaseIndex] || colors[0];
            
            const segment: PolicySegment = {
              policy,
              dimension,
              phase,
              startAngle: segmentStartAngle,
              endAngle: segmentEndAngle,
              innerRadius: ring.innerRadius,
              outerRadius: ring.outerRadius,
              color
            };
            
            policySegments.push(segment);
            
            const centerAngle = (segmentStartAngle + segmentEndAngle) / 2;
            const midRadius = (ring.innerRadius + ring.outerRadius) / 2;
            const position = polarToCartesian(centerAngle, midRadius, centerX, centerY);  // Added centerX and centerY

            
            policyPositions.push({
              policy,
              x: position.x,
              y: position.y
            });
          });
        });
      });
    }
    
    return { policySegments, policyPositions };
  }, [data, visiblePolicies, selectedDimension]);

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
              resetAllSelections();
            }}
            className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    );
  }

  const colorVariations = {
    'infrastructure': ['#a8c6fa', '#6a9ceb', '#3a72c2', '#20508e'],  // Blue
    'legislation': ['#fde6a8', '#fbd575', '#f5b745', '#efae42'],     // Yellow
    'sustainability': ['#d9b5ff', '#c387fa', '#a55aee', '#8724d3'],  // Purple
    'economic': ['#ffa3a3', '#f87373', '#e54e4e', '#cf3535'],        // Red
    'education': ['#8fc9a8', '#5eaa7f', '#3a7d54', '#255a34']         // Green
  };
  // Calculate curved path for connections
  const calculateCurvedPath = (
    source: {x: number, y: number},
    target: {x: number, y: number}
  ): string => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    const curveHeight = Math.min(distance / 3, 100);
    
    const controlX = midX + perpX * curveHeight;
    const controlY = midY + perpY * curveHeight;
    
    return `M ${source.x} ${source.y} Q ${controlX} ${controlY}, ${target.x} ${target.y}`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header - Same as TPAF Viz */}
      <div className="w-full mb-8">
        <div 
          className="flex flex-col shadow-md overflow-hidden relative"
          style={{
            width: '100vw', // Full viewport width
            height: 'min(280px, 24vw)',
            minHeight: '200px',
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginLeft: 'calc(-50vw + 50%)', // Centers full-width div within container
            marginRight: 'calc(-50vw + 50%)',
          }}
        >

          {/* G20 Logo top right - moved more to the right */}
          <div className="absolute top-4 left-60 sm:top-6 sm:right-40">
            <img 
              src={g20Logo} 
              alt="G20 Logo" 
              className="h-16 sm:h-24 object-contain" 
            />
          </div>

          {/* Title text - right aligned */}
          <div className="absolute right-60 top-1/3 transform  -translate-y-1/2 text-right w-full px-4">
            <h1 className="text-white font-regular text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              G20 Technology Policy<br />Assistance Facility
            </h1>
          </div>

          {/* Controls - moved higher up with white text */}
          <div className="absolute left-1/2 bottom-2 sm:bottom-2 transform -translate-x-1/2 
            min-w-[300px] max-w-[100vw] w-auto px-4 py-2">
          <div className="flex flex-row flex-wrap justify-center gap-3 bg-black bg-opacity-70 p-3 rounded-xl backdrop-blur-sm">
            
            {/* Home Button */}
            {onNavigateToHome && (
              <button 
                onClick={onNavigateToHome}
                className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-10"
              >
                <span>← Home</span>
              </button>
            )}

            {/* Dimension Selector */}
            <select 
              className="bg-transparent border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 hover:bg-white hover:bg-opacity-10"
              value={selectedDimension}
              onChange={(e) => {
                setSelectedDimension(e.target.value);
                setSelectedPhase(null);
                setSelectedPolicy(null);
              }}
            >
              <option value="all" className="text-gray-800">All Dimensions</option>
              {data.dimensions.map(dim => (
                <option key={dim.id} value={dim.id} className="text-gray-800">{dim.shortName}</option>
              ))}
            </select>

            {/* Phase Selector */}
            <select 
              className="bg-transparent border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-48 hover:bg-white hover:bg-opacity-10"
              value={selectedPhase || ''}
              onChange={(e) => {
                setSelectedPhase(e.target.value || null);
                setSelectedPolicy(null);
              }}
            >
              <option value="" className="text-gray-800">All Phases</option>
              {data.phases
                .filter(phase => {
                  if (selectedDimension === 'all') return true;
                  return phase.policies.some(policy => policy.dimension === selectedDimension);
                })
                .map(phase => (
                  <option key={phase.id} value={phase.id} className="text-gray-800">
                    {phase.name.length > 20 ? `${phase.name.substring(0, 20)}...` : phase.name}
                  </option>
                ))}
            </select>

            {/* Connections Toggle */}
            <button 
              className={`border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 ${
                showConnections ? 'bg-white bg-opacity-20' : 'bg-transparent hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setShowConnections(!showConnections)}
            >
              <span>{showConnections ? 'Hide' : 'Show'} Connections</span>
            </button>

            {/* Reload Button */}
            <button 
              onClick={() => {
                reloadData();
                resetAllSelections();
                setReadPolicies(new Set());
                setSavedPolicies(new Set());
                localStorage.removeItem('readPolicies');
                localStorage.removeItem('savedPolicies');
              }}
              className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-10"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Reset All</span>
            </button>

            {/* Find Experts Button */}
            <a
              href="https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 text-center block hover:bg-white hover:bg-opacity-10"
            >
              Find Experts
            </a>

            {/* Search Box */}
            <div className="w-full sm:w-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-white rounded-lg pl-8 sm:pl-10 pr-2 sm:pr-4 py-2 text-white text-xs sm:text-sm w-full placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* Journey Components - Moved below header */}
      <div className="w-full flex justify-center mb-4">
        <div style={{ width: 'min(1448px, 95vw)' }}>
          <CompactSidebar
            selectedDimension={selectedDimension}
            selectedPhase={selectedPhase}
            selectedPolicy={selectedPolicy}
            selectedKeyword={selectedKeyword}
            searchQuery={searchQuery}
            readPolicies={readPolicies}
            savedPolicies={savedPolicies}
            data={data}
            onResetAllSelections={resetAllSelections}
            onSetSelectedDimension={setSelectedDimension}
            onSetSelectedPhase={setSelectedPhase}
            onSetSelectedKeyword={setSelectedKeyword}
            onSetSearchQuery={setSearchQuery}
            onDownloadJourney={downloadJourney}
            getDimension={getDimension}
            getPhase={getPhase}
          />
        </div>
      </div>


      {/* Main Content Container - Sidebar moved to top right */}
      <div className="w-full flex justify-center mb-8">
        <div className="grid grid-cols-10 gap-6" style={{ width: 'min(1448px, 95vw)' }}>
          {/* Circular Visualization - Now takes 3/4 of space */}
          <div className="col-span-6">
            <div className="bg-white rounded-3xl p-4 shadow-md min-h-[700px] border border-gray-100 relative">
              <svg ref={svgRef} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full" style={{ overflow: 'visible' }}>
                {/* Background dimension slices */}
                {data.dimensions.map(dimension => (
                  <path
                    key={`bg-${dimension.id}`}
                    d={`
                      M ${centerX},${centerY}
                      L ${polarToCartesian(dimension.angle - 36, 210, centerX, centerY).x},${polarToCartesian(dimension.angle - 36, 210, centerX, centerY).y}
                      A 210,210 0 0,1 ${polarToCartesian(dimension.angle + 36, 210, centerX, centerY).x},${polarToCartesian(dimension.angle + 36, 210, centerX, centerY).y}
                      Z
                    `}
                    fill={dimension.color}
                    opacity={0.03}
                  />
                ))}
                
                {/* Phase rings (guides) */}
                {Object.entries(phaseRingConfig).map(([phaseId, ring]) => (
                  <circle
                    key={`guide-ring-${phaseId}`}
                    cx={centerX}
                    cy={centerY}
                    r={ring.outerRadius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                ))}
                
                {/* Policy segments - rendered first */}
                {policySegments.map((segment, index) => {
                  const isRead = readPolicies.has(segment.policy.id);
                  const isSaved = savedPolicies.has(segment.policy.id);
                  
                  return (
                    <g key={`segment-group-${segment.policy.id}-${index}`}>
                      {/* Segment path - always visible but with different opacity */}
                      <path
                        d={`
                          M ${polarToCartesian(segment.startAngle, segment.innerRadius, centerX, centerY).x},${polarToCartesian(segment.startAngle, segment.innerRadius, centerX, centerY).y}
                          L ${polarToCartesian(segment.startAngle, segment.outerRadius, centerX, centerY).x},${polarToCartesian(segment.startAngle, segment.outerRadius, centerX, centerY).y}
                          A ${segment.outerRadius},${segment.outerRadius} 0 ${segment.endAngle - segment.startAngle <= 180 ? 0 : 1},1 
                            ${polarToCartesian(segment.endAngle, segment.outerRadius, centerX, centerY).x},${polarToCartesian(segment.endAngle, segment.outerRadius, centerX, centerY).y}
                          L ${polarToCartesian(segment.endAngle, segment.innerRadius, centerX, centerY).x},${polarToCartesian(segment.endAngle, segment.innerRadius, centerX, centerY).y}
                          A ${segment.innerRadius},${segment.innerRadius} 0 ${segment.endAngle - segment.startAngle <= 180 ? 0 : 1},0 
                            ${polarToCartesian(segment.startAngle, segment.innerRadius, centerX, centerY).x},${polarToCartesian(segment.startAngle, segment.innerRadius, centerX, centerY).y}
                          Z
                        `}
                        fill={isRead ? segment.color : `${segment.color}30`} // 30% opacity if not read
                        stroke={segment.color}
                        strokeWidth={2}
                        className="cursor-pointer hover:opacity-90 transition-all"
                        onClick={() => {
                          setSelectedPolicy(segment.policy);
                          markPolicyRead(segment.policy.id);
                        }}
                      />
                    </g>
                  );
                })}

                {/* Policy dots - always visible on top of segments */}
                {policyPositions.map((position, index) => {
                  const isSelected = selectedPolicy?.id === position.policy.id;
                  const isHovered = hoveredPolicy?.id === position.policy.id;
                  const isSaved = savedPolicies.has(position.policy.id);
                  const hasConnectionToSelected = selectedPolicy 
                    ? position.policy.connections?.some(c => c.id === selectedPolicy.id)
                    : false;
                  const dimension = getDimension(position.policy.dimension);
                  
                  return (
                    <g key={`dot-${position.policy.id}-${index}`}>
                      {/* White circle - always visible */}
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r={isSelected ? 5 : isHovered ? 6 : hasConnectionToSelected ? 5 : 5} // Slightly larger dots
                        fill="#ffffff"
                        stroke={dimension?.color || '#000000'}
                        strokeWidth={isSelected ? 2.5 : hasConnectionToSelected ? 2 : 1.5}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => handleMouseEnter(position.policy)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => setSelectedPolicy(position.policy)}
                      />
                      
                      {/* X mark - only for saved policies */}
                      {isSaved && (
                        <g transform={`translate(${position.x - 6}, ${position.y - 6})`}>
                          <path
                            d="M4 4L8 8 M4 8L8 4"  // Smaller X shape (12x12 bounding box)
                            stroke={dimension?.color || '#000000'}
                            strokeWidth="1.5"       // Thinner stroke
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                  
                {/* Center Progress Indicator */}
                <g 
                  className="cursor-pointer" 
                  onClick={() => {
                    if (selectedPolicy) setSelectedPolicy(null);
                    else if (selectedDimension !== 'all') setSelectedDimension('all');
                  }}
                >
                  {/* White base circle */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="70"
                    fill="white"
                    stroke={selectedPolicy 
                      ? colorVariations[selectedPolicy.dimension as keyof typeof colorVariations][0] 
                      : colorVariations[selectedDimension === 'all' 
                          ? 'infrastructure' 
                          : selectedDimension as keyof typeof colorVariations][0]}
                    strokeWidth="6"
                  />

                  {/* Progress percentage text */}
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[30px] font-bold text-gray-800"  
                    fill="#737373"  
                  >
                    {'TPAF'}
                  </text>

                  {/* Progress track (dark gray) */}
                  {/* <circle
                    cx={centerX}
                    cy={centerY}
                    r="60"
                    fill="transparent"
                    stroke="#334155" 
                    strokeWidth="8"
                    strokeOpacity="0.2"  
                  /> */}

                  {/* Active progress indicator */}
                  {/* <circle
                    cx={centerX}
                    cy={centerY}
                    r="60"
                    fill="transparent"
                    stroke="#a3a3a3"
                    strokeWidth="8"
                    strokeDasharray={`${(readPolicies.size / data.policies.length) * 377} 377`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${centerX} ${centerY})`}
                  /> */}
                </g>

                {/* Add this to your SVG defs for better text visibility */}
                <defs>
                  <filter id="textOutline" x="-0.8" y="-0.8" width="2.6" height="2.6">
                    <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicker" />
                    <feFlood floodColor="#1e293b" result="flood" />
                    <feComposite in="flood" in2="thicker" operator="in" result="outline" />
                    <feComposite in="SourceGraphic" in2="outline" operator="over" />
                  </filter>
                </defs>

                {/* Dimension Labels */}
                {data.dimensions.map((dimension) => {
                  if (selectedDimension !== 'all' && dimension.id !== selectedDimension) return null;
                  
                  const segmentStartAngle = dimension.angle - 36;
                  const segmentEndAngle = dimension.angle + 36;
                  const outerRadius = 250;
                  const innerRadius = 210;
                  const midRadius = (innerRadius + outerRadius) / 2;
                  const bgImage = dimensionBackgrounds[dimension.id as keyof typeof dimensionBackgrounds];
                  
                  return (
                    <g key={`dimension-ring-${dimension.id}`}>
                      <defs>
                        <pattern
                          id={`dimension-pattern-${dimension.id}`}
                          patternUnits="userSpaceOnUse"
                          width="100"
                          height="100"
                        >
                          <image 
                            href={bgImage} 
                            x="0" 
                            y="0" 
                            width="100" 
                            height="100"
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </pattern>
                      </defs>
                      
                      <path
                        d={`
                          M ${polarToCartesian(segmentStartAngle, innerRadius, centerX, centerY).x},${polarToCartesian(segmentStartAngle, innerRadius, centerX, centerY).y}
                          L ${polarToCartesian(segmentStartAngle, outerRadius, centerX, centerY).x},${polarToCartesian(segmentStartAngle, outerRadius, centerX, centerY).y}
                          A ${outerRadius},${outerRadius} 0 0,1 ${polarToCartesian(segmentEndAngle, outerRadius, centerX, centerY).x},${polarToCartesian(segmentEndAngle, outerRadius, centerX, centerY).y}
                          L ${polarToCartesian(segmentEndAngle, innerRadius, centerX, centerY).x},${polarToCartesian(segmentEndAngle, innerRadius, centerX, centerY).y}
                          A ${innerRadius},${innerRadius} 0 0,0 ${polarToCartesian(segmentStartAngle, innerRadius, centerX, centerY).x},${polarToCartesian(segmentStartAngle, innerRadius, centerX, centerY).y}
                          Z
                        `}
                        fill={`url(#dimension-pattern-${dimension.id})`}
                        opacity={1}
                        stroke="white"
                        strokeWidth={0.5}
                      />
                      
                      <path
                        id={`text-path-${dimension.id}`}
                        d={`
                          M ${polarToCartesian(segmentStartAngle + 5, midRadius, centerX, centerY).x},${polarToCartesian(segmentStartAngle + 5, midRadius, centerX, centerY).y}
                          A ${midRadius},${midRadius} 0 ${segmentEndAngle - segmentStartAngle > 180 ? 1 : 0},1 
                          ${polarToCartesian(segmentEndAngle - 5, midRadius, centerX, centerY).x},${polarToCartesian(segmentEndAngle - 5, midRadius, centerX, centerY).y}
                        `}
                        fill="none"
                        stroke="none"
                      />
                      <text
                        fill="white"
                        fontSize="17"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <textPath
                          href={`#text-path-${dimension.id}`}
                          startOffset="50%"
                          method="align"
                        >
                          {dimension.shortName}
                        </textPath>
                      </text>
                    </g>
                  );
                })}



                {/* Connections between policies */}
                {showConnections && getVisibleConnections().map((connection, index) => {
                  const sourcePos = policyPositions.find(p => p.policy.id === connection.source.id);
                  const targetPos = policyPositions.find(p => p.policy.id === connection.target.id);
                  
                  if (!sourcePos || !targetPos) return null;
                  
                  const isSelectedConnection = selectedPolicy 
                    ? (connection.source.id === selectedPolicy.id || connection.target.id === selectedPolicy.id)
                    : false;
                  
                  const isHovered = hoveredConnection?.source.id === connection.source.id && 
                                  hoveredConnection?.target.id === connection.target.id;
                  
                  return (
                    <path
                      key={`connection-${connection.source.id}-${connection.target.id}-${index}`}
                      d={calculateCurvedPath(sourcePos, targetPos)}
                      stroke={getDimension(connection.source.dimension)?.color || '#3b82f6'}
                      strokeWidth={isHovered ? 3 : isSelectedConnection ? 2 : 1}
                      opacity={isHovered ? 0.9 : isSelectedConnection ? 0.7 : 0.3}
                      fill="none"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredConnection(connection)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Compact Sidebar - Now 1/4 of space */}
          {/* Policy Details - Moved to sidebar */}
          <div className="col-span-4">
            <PolicyDetails
              selectedPolicy={selectedPolicy}
              hoveredPolicy={hoveredPolicy}
              savedPolicies={savedPolicies}
              activeTab={activeTab}
              experts={experts}
              isLoadingExperts={isLoadingExperts}
              expertError={expertError}
              dimensionBackgrounds={dimensionBackgrounds}
              onToggleSavedPolicy={toggleSavedPolicy}
              onBackToPhase={() => {
                const phaseId = selectedPolicy?.phaseId;
                setSelectedPolicy(null);
                setSelectedPhase(phaseId || null);
              }}
              onTabChange={setActiveTab}
              getDimension={getDimension}
              getPhase={getPhase}
            />
          </div>
        </div>
      </div>

      {/* Connected Policies Section - Collapsible */}
      {selectedPolicy && selectedPolicy.connections && selectedPolicy.connections.length > 0 && (
        <div className="w-full flex justify-center mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md" style={{ width: 'min(1448px, 95vw)' }}>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowConnectedPolicies(!showConnectedPolicies)}
                className="flex items-center gap-2 text-lg font-semibold text-black hover:text-blue-600 transition-colors"
              >
                <span className={`transform transition-transform ${showConnectedPolicies ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                Connected Policies ({selectedPolicy.connections.length})
              </button>
              
              {showConnectedPolicies && (
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    setSelectedConnectionKeyword('');
                    setHoveredConnection(null);
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>

            {showConnectedPolicies && (
              <>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Filter by shared keyword:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedConnectionKeyword === ''
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedConnectionKeyword('')}
                    >
                      All
                    </button>
                    {Array.from(new Set(
                      selectedPolicy.connections.flatMap(c => c.sharedKeywords)
                    )).map(keyword => (
                      <button
                        key={keyword}
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedConnectionKeyword === keyword
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedConnectionKeyword(keyword)}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedPolicy.connections
                    .filter(conn => 
                      !selectedConnectionKeyword || 
                      conn.sharedKeywords.includes(selectedConnectionKeyword)
                    )
                    .sort((a, b) => b.strength - a.strength)
                    .map(conn => {
                      const connectedPolicy = data.policies.find(p => p.id === conn.id);
                      if (!connectedPolicy) return null;
                      
                      const isHovered = hoveredConnection?.source.id === selectedPolicy.id && 
                                      hoveredConnection?.target.id === connectedPolicy.id;
                      
                      return (
                        <div 
                          key={conn.id} 
                          className={`p-3 border rounded cursor-pointer transition-all text-sm ${
                            isHovered ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedPolicy(connectedPolicy)}
                          onMouseEnter={() => {
                            setHoveredConnection({
                              source: selectedPolicy,
                              target: connectedPolicy,
                              strength: conn.strength,
                              keywords: conn.sharedKeywords
                            });
                          }}
                          onMouseLeave={() => setHoveredConnection(null)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium line-clamp-1 flex-1 pr-2">
                              {connectedPolicy.title}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs shrink-0 ${
                              conn.strength === 5 ? 'bg-green-100 text-green-800' :
                              conn.strength === 4 ? 'bg-blue-100 text-blue-800' :
                              conn.strength === 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {conn.strength}/5
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {conn.sharedKeywords.slice(0, 3).map(keyword => (
                              <span 
                                key={keyword}
                                className={`px-2 py-1 text-xs rounded ${
                                  keyword === selectedConnectionKeyword
                                    ? 'bg-blue-600 text-white'
                                    : isHovered
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConnectionKeyword(
                                    keyword === selectedConnectionKeyword ? '' : keyword
                                  );
                                }}
                              >
                                {keyword}
                              </span>
                            ))}
                            {conn.sharedKeywords.length > 3 && (
                              <span className="text-xs text-gray-500 px-1">
                                +{conn.sharedKeywords.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TPAFCircularVisualization;