import React, { useState, useEffect, useMemo } from 'react';
import { Settings, FileText, Users, BarChart3, BookOpen, Info, Filter, Download } from 'lucide-react';
import coverImage from './cover-image.png';

// Define types
type DimensionId = 'infrastructure' | 'legislation' | 'sustainability' | 'economic' | 'education';

interface Dimension {
  id: DimensionId;
  name: string;
  shortName: string;
  color: string;
  icon: React.ElementType;
  angle: number;
  policies: number;
}

interface Policy {
  id: number;
  title: string;
  description: string;
  dimension: DimensionId;
  keywords: string[];
  phase: string;
  progress: number;
  complexity: string;
  priority: string;
  radius: number;
  angle: number;
  connections?: {
    id: number;
    sharedKeywords: string[];
    strength: number;
  }[];
}

interface Connection {
  source: Policy;
  target: Policy;
  strength: number;
  keywords: string[];
}

interface PolicyTemplate {
  title: string;
  keywords: string[];
  complexity: string;
}

const TPAFCircularVisualization = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [hoveredPolicy, setHoveredPolicy] = useState<Policy | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [showConnections, setShowConnections] = useState<boolean>(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev < 100 ? prev + 2 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // TPAF Dimensions with colors matching OECD style
  const dimensions: Dimension[] = [
    {
      id: 'infrastructure',
      name: 'Enabling Infrastructure',
      shortName: 'Infrastructure',
      color: '#005193', // Blue
      icon: Settings,
      angle: 0, // Top
      policies: 8
    },
    {
      id: 'legislation',
      name: 'Legislation & Policy',
      shortName: 'Legislation',
      color: '#FBAD17', // Gold
      icon: FileText,
      angle: 72, // 72 degrees for 5 sections
      policies: 6
    },
    {
      id: 'sustainability',
      name: 'Sustainability & Society',
      shortName: 'Sustainability',
      color: '#9C27B0', // Purple
      icon: Users,
      angle: 144,
      policies: 5
    },
    {
      id: 'economic',
      name: 'Economic Measures & Innovation',
      shortName: 'Economic',
      color: '#E11A2C', // Red
      icon: BarChart3,
      angle: 216,
      policies: 7
    },
    {
      id: 'education',
      name: 'Research, Education & Capacity',
      shortName: 'Education',
      color: '#4CAF50', // Green
      icon: BookOpen,
      angle: 288,
      policies: 6
    }
  ];

  // Shared keywords across dimensions for interconnections
  const keywords = [
    'ethics', 'transparency', 'standards', 'collaboration', 'innovation', 
    'assessment', 'monitoring', 'governance', 'security', 'fairness',
    'accountability', 'risk-management', 'stakeholder-engagement', 'data-protection'
  ];

  // Generate policy points for each dimension with meaningful attributes
  const policyData = useMemo(() => {
    const policies: Policy[] = [];
    let policyId = 1;

    // Sample policy templates with realistic data
    const policyTemplates: Record<DimensionId, PolicyTemplate[]> = {
      infrastructure: [
        { title: 'AI Readiness Assessment', keywords: ['assessment', 'standards', 'monitoring'], complexity: 'medium' },
        { title: 'Data Infrastructure Development', keywords: ['data-protection', 'security', 'standards'], complexity: 'high' },
        { title: 'Cloud Computing Strategy', keywords: ['innovation', 'security', 'governance'], complexity: 'high' },
        { title: 'Digital Connectivity Framework', keywords: ['standards', 'assessment'], complexity: 'low' },
        { title: 'Cybersecurity Protocols', keywords: ['security', 'risk-management', 'standards'], complexity: 'high' },
        { title: 'Technical Standards Development', keywords: ['standards', 'collaboration', 'governance'], complexity: 'medium' },
        { title: 'Computing Resource Allocation', keywords: ['governance', 'assessment'], complexity: 'medium' },
        { title: 'Infrastructure Monitoring', keywords: ['monitoring', 'assessment', 'governance'], complexity: 'low' }
      ],
      legislation: [
        { title: 'AI Ethics Framework', keywords: ['ethics', 'transparency', 'accountability'], complexity: 'high' },
        { title: 'Regulatory Sandbox', keywords: ['innovation', 'governance', 'standards'], complexity: 'medium' },
        { title: 'Data Governance Laws', keywords: ['data-protection', 'governance', 'transparency'], complexity: 'high' },
        { title: 'AI Liability Framework', keywords: ['accountability', 'risk-management', 'governance'], complexity: 'high' },
        { title: 'Transparency Requirements', keywords: ['transparency', 'standards', 'accountability'], complexity: 'medium' },
        { title: 'Algorithmic Auditing', keywords: ['assessment', 'transparency', 'standards'], complexity: 'medium' }
      ],
      sustainability: [
        { title: 'Environmental AI Impact', keywords: ['assessment', 'monitoring', 'standards'], complexity: 'medium' },
        { title: 'Social Inclusion Framework', keywords: ['fairness', 'stakeholder-engagement', 'ethics'], complexity: 'high' },
        { title: 'Cultural Diversity Guidelines', keywords: ['fairness', 'ethics', 'collaboration'], complexity: 'medium' },
        { title: 'Public Engagement Strategy', keywords: ['stakeholder-engagement', 'transparency', 'collaboration'], complexity: 'low' },
        { title: 'AI for Social Good', keywords: ['ethics', 'fairness', 'innovation'], complexity: 'medium' }
      ],
      economic: [
        { title: 'AI Investment Framework', keywords: ['innovation', 'assessment', 'governance'], complexity: 'high' },
        { title: 'Tax Incentives Policy', keywords: ['innovation', 'governance'], complexity: 'medium' },
        { title: 'Market Competition Rules', keywords: ['fairness', 'governance', 'standards'], complexity: 'high' },
        { title: 'Public Procurement Guidelines', keywords: ['standards', 'transparency', 'governance'], complexity: 'medium' },
        { title: 'Innovation Funding Programs', keywords: ['innovation', 'collaboration', 'assessment'], complexity: 'medium' },
        { title: 'SME Support Framework', keywords: ['collaboration', 'innovation', 'stakeholder-engagement'], complexity: 'low' },
        { title: 'Economic Impact Assessment', keywords: ['assessment', 'monitoring', 'governance'], complexity: 'medium' }
      ],
      education: [
        { title: 'AI Skills Development', keywords: ['collaboration', 'stakeholder-engagement', 'innovation'], complexity: 'medium' },
        { title: 'Research Partnerships', keywords: ['collaboration', 'innovation', 'standards'], complexity: 'low' },
        { title: 'AI Ethics Education', keywords: ['ethics', 'transparency', 'stakeholder-engagement'], complexity: 'medium' },
        { title: 'Workforce Transition', keywords: ['fairness', 'stakeholder-engagement', 'assessment'], complexity: 'high' },
        { title: 'University AI Programs', keywords: ['innovation', 'collaboration', 'standards'], complexity: 'medium' },
        { title: 'Public Awareness Campaigns', keywords: ['transparency', 'stakeholder-engagement', 'ethics'], complexity: 'low' }
      ]
    };

    dimensions.forEach((dimension) => {
      const templates = policyTemplates[dimension.id];
      const startAngle = dimension.angle - 36;
      const endAngle = dimension.angle + 36;
      
      templates.forEach((template, i) => {
        const angle = startAngle + (endAngle - startAngle) * (i / Math.max(templates.length - 1, 1));
        
        // Line length based on complexity and connections
        const complexityWeight = template.complexity === 'high' ? 1 : template.complexity === 'medium' ? 0.8 : 0.6;
        const connectionWeight = template.keywords.length / 5; // Normalize by max keywords
        const radius = 0.5 + (complexityWeight * 0.3) + (connectionWeight * 0.2);
        
        const priorities = ['high', 'medium', 'low'];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        policies.push({
          id: policyId++,
          dimension: dimension.id,
          angle: angle,
          radius: Math.min(radius, 1), // Cap at 1
          title: template.title,
          keywords: template.keywords,
          complexity: template.complexity,
          priority: priority,
          description: `${template.title} - A key policy for ${dimension.shortName.toLowerCase()} governance`,
          phase: ['Assessment', 'Development', 'Implementation'][Math.floor(Math.random() * 3)],
          progress: Math.floor(Math.random() * 100),
          connections: [] // Will be calculated
        });
      });
    });

    // Calculate connections based on shared keywords
    policies.forEach(policy => {
      policy.connections = policies
        .filter((other: Policy) => 
          other.id !== policy.id && 
          policy.keywords.some((keyword: string) => other.keywords.includes(keyword))
        )
        .map((other: Policy) => ({
          id: other.id,
          sharedKeywords: policy.keywords.filter((k: string) => other.keywords.includes(k)),
          strength: policy.keywords.filter((k: string) => other.keywords.includes(k)).length
        }));
    });

    return policies;
  }, []);

  // Filter policies based on selected dimension and keyword
  const filteredPolicies = selectedDimension === 'all' 
    ? policyData 
    : policyData.filter(p => p.dimension === selectedDimension);

  const keywordFilteredPolicies = selectedKeyword 
    ? filteredPolicies.filter(p => p.keywords.includes(selectedKeyword))
    : filteredPolicies;

  // Get visible connections
  const getVisibleConnections = (): Connection[] => {
    if (!showConnections) return [];
    
    const connections: Connection[] = [];
    const visiblePolicyIds = new Set(keywordFilteredPolicies.map(p => p.id));
    
    keywordFilteredPolicies.forEach(policy => {
      policy.connections?.forEach(connection => {
        if (visiblePolicyIds.has(connection.id) && connection.strength >= 2) {
          // Only show strong connections (2+ shared keywords)
          const targetPolicy = policyData.find(p => p.id === connection.id);
          if (targetPolicy && policy.id < targetPolicy.id) { // Avoid duplicates
            connections.push({
              source: policy,
              target: targetPolicy,
              strength: connection.strength,
              keywords: connection.sharedKeywords
            });
          }
        }
      });
    });
    
    return connections;
  };

  // Convert polar to cartesian coordinates
  const polarToCartesian = (
    angle: number, 
    radius: number, 
    centerX = 400, 
    centerY = 300
  ) => {
    const radian = (angle - 90) * Math.PI / 180; // -90 to start from top
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    };
  };

  // Get dimension info
  const getDimension = (dimensionId: DimensionId) => 
    dimensions.find(d => d.id === dimensionId);

  // Create gradient definitions
  const createGradients = () => {
    return dimensions.map((dim, index) => {
      const nextDim = dimensions[(index + 1) % dimensions.length];
      return (
        <linearGradient
          key={`gradient-${dim.id}`}
          id={`gradient-${dim.id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={dim.color} />
          <stop offset="100%" stopColor={nextDim.color} />
        </linearGradient>
      );
    });
  };

  return (
    <div className="w-full min-h-screen bg-white p-6">
      {/* Header - Updated for 1448×460 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-[550px]">
          {/* Image Section - Takes 70% of height */}
          <div className="relative h-[70%] w-full">
            <img 
              src={coverImage} 
              alt="TPAF Cover" 
              className="w-full h-full object-cover"
            />
            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              {/* <h1 className="text-3xl font-bold text-white mb-2">
                Technology Policy Assistance Facility
              </h1> */}
              {/* <p className="text-gray-200 text-lg">
                Interactive AI Governance Framework Explorer
              </p> */}
            </div>
          </div>

          {/* Controls Section - Takes 30% of height */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between w-full text-gray-800">
              <div className="flex-1">
                {/* Optional additional content can go here */}
              </div>
              
              {/* Controls Group */}
              <div className="flex gap-4">
                <select 
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800"
                  value={selectedDimension}
                  onChange={(e) => setSelectedDimension(e.target.value)}
                >
                  <option value="all">All Dimensions</option>
                  {dimensions.map(dim => (
                    <option key={dim.id} value={dim.id}>{dim.shortName}</option>
                  ))}
                </select>
                
                <select 
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                >
                  <option value="">All Keywords</option>
                  {keywords.map(keyword => (
                    <option key={keyword} value={keyword}>{keyword}</option>
                  ))}
                </select>
                
                <button 
                  className={`border border-slate-600 rounded-lg px-4 py-2 text-white transition-colors ${
                    showConnections ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => setShowConnections(!showConnections)}
                >
                  {showConnections ? 'Hide' : 'Show'} Connections
                </button>
                
                <button className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white hover:bg-slate-600 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Main Visualization Area */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Circular Visualization */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-8 shadow-md min-h-[500px] h-[70vh]">
            <svg 
              viewBox="0 0 800 600" 
              className="w-full h-full" // Changed to fill container
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {createGradients()}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background Circle Sections */}
              {dimensions.map((dimension) => {
                const startAngle = dimension.angle - 36;
                const endAngle = dimension.angle + 36;
                const innerRadius = 100;
                const outerRadius = 280;
                
                const startInner = polarToCartesian(startAngle, innerRadius);
                const endInner = polarToCartesian(endAngle, innerRadius);
                const startOuter = polarToCartesian(startAngle, outerRadius);
                const endOuter = polarToCartesian(endAngle, outerRadius);
                
                const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                
                const pathData = [
                  "M", startInner.x, startInner.y,
                  "L", startOuter.x, startOuter.y,
                  "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
                  "L", endInner.x, endInner.y,
                  "A", innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
                  "Z"
                ].join(" ");

                return (
                  <path
                    key={dimension.id}
                    d={pathData}
                    fill={dimension.color}
                    opacity={selectedDimension === 'all' || selectedDimension === dimension.id ? 0.15 : 0.05}
                    className="transition-opacity duration-300"
                  />
                );
              })}

              {/* Interconnection Lines between Policies */}
              {showConnections && getVisibleConnections().map((connection, index) => {
                const sourcePos = polarToCartesian(
                  connection.source.angle, 
                  100 + (280 - 100) * connection.source.radius
                );
                const targetPos = polarToCartesian(
                  connection.target.angle, 
                  100 + (280 - 100) * connection.target.radius
                );
                
                const opacity = connection.strength >= 3 ? 0.6 : 0.3;
                const strokeWidth = connection.strength >= 3 ? 2 : 1;
                
                return (
                  <g key={`connection-${index}`}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke="#60A5FA"
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      strokeDasharray={connection.strength >= 3 ? "none" : "5,5"}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {/* Policy Lines and Dots */}
              {keywordFilteredPolicies.map((policy, index) => {
                const dimension = getDimension(policy.dimension);
                if (!dimension) return null;
                
                const maxRadius = 280;
                const minRadius = 100;
                const lineRadius = minRadius + (maxRadius - minRadius) * policy.radius;
                
                const startPoint = polarToCartesian(policy.angle, minRadius);
                const endPoint = polarToCartesian(policy.angle, lineRadius);
                
                const isHovered = hoveredPolicy?.id === policy.id;
                const isSelected = selectedPolicy?.id === policy.id;
                const shouldShow = (animationProgress / 100) > (index / filteredPolicies.length);
                
                if (!shouldShow) return null;

                return (
                  <g key={policy.id}>
                    {/* Policy Line */}
                    <line
                      x1={startPoint.x}
                      y1={startPoint.y}
                      x2={endPoint.x}
                      y2={endPoint.y}
                      stroke={dimension.color}
                      strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                      opacity={isSelected || isHovered ? 0.9 : 0.6}
                      className="transition-all duration-200"
                    />
                    
                    {/* Policy Dot */}
                    <circle
                      cx={endPoint.x}
                      cy={endPoint.y}
                      r={isSelected ? 8 : isHovered ? 6 : 4}
                      fill={dimension.color}
                      stroke="white"
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={isSelected || isHovered ? 1 : 0.8}
                      filter={isSelected || isHovered ? "url(#glow)" : "none"}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredPolicy(policy)}
                      onMouseLeave={() => setHoveredPolicy(null)}
                      onClick={() => setSelectedPolicy(selectedPolicy?.id === policy.id ? null : policy)}
                    />
                  </g>
                );
              })}

              {/* Dimension Labels */}
              {dimensions.map((dimension) => {
                const labelRadius = 300;
                const labelPos = polarToCartesian(dimension.angle, labelRadius);
                const IconComponent = dimension.icon;
                
                return (
                  <g key={`label-${dimension.id}`}>
                    {/* Label Background */}
                    <rect
                      x={labelPos.x - 60}
                      y={labelPos.y - 12}
                      width="120"
                      height="24"
                      rx="12"
                      fill={dimension.color}
                      opacity={selectedDimension === 'all' || selectedDimension === dimension.id ? 0.9 : 0.3}
                      className="transition-opacity duration-300"
                    />
                    
                    {/* Label Text */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      textAnchor="middle"
                      className="text-sm font-semibold fill-white"
                    >
                      {dimension.shortName}
                    </text>
                  </g>
                );
              })}

              {/* Center Circle */}
              <circle
                cx="400"
                cy="300"
                r="80"
                fill="rgba(15, 23, 42, 0.9)"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2"
              />
              
              {/* Center Logo/Text */}
              <text
                x="400"
                y="295"
                textAnchor="middle"
                className="text-black font-bold fill-white"
              >
                TPAF
              </text>
              <text
                x="400"
                y="310"
                textAnchor="middle"
                className="text-xs fill-slate-300"
              >
                AI Governance
              </text>
            </svg>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Dimension Legend */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-black font-semibold text-black mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Dimensions
            </h3>
            <div className="space-y-3">
              {dimensions.map((dimension) => {
                const IconComponent = dimension.icon;
                return (
                  <div
                    key={dimension.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedDimension === dimension.id
                        ? 'bg-slate-700'
                        : 'hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedDimension(
                      selectedDimension === dimension.id ? 'all' : dimension.id
                    )}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: dimension.color }}
                    />
                    <IconComponent className="w-4 h-4 text-black" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">
                        {dimension.shortName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {dimension.policies} policies
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-black font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Total Policies</span> {/* Changed from text-slate-300 */}
                <span className="text-black font-semibold">{filteredPolicies.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">High Priority</span> {/* Changed from text-slate-300 */}
                <span className="text-black font-semibold">
                  {filteredPolicies.filter(p => p.priority === 'high').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">In Development</span> {/* Changed from text-slate-300 */}
                <span className="text-black font-semibold">
                  {filteredPolicies.filter(p => p.phase === 'Development').length}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Policy Details */}
          {selectedPolicy && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-black font-semibold text-white mb-4">Policy Details</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-white">
                    {selectedPolicy.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {getDimension(selectedPolicy.dimension)?.name}
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  {selectedPolicy.description}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400">Phase:</span>
                  <span 
                    className="px-2 py-1 rounded text-white"
                    style={{ backgroundColor: getDimension(selectedPolicy.dimension)?.color }}
                  >
                    {selectedPolicy.phase}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-300">{selectedPolicy.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${selectedPolicy.progress}%`,
                        backgroundColor: getDimension(selectedPolicy.dimension)?.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tooltip for hovered policy */}
          {hoveredPolicy && !selectedPolicy && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h4 className="text-sm font-semibold text-white mb-2">
                {hoveredPolicy.title}
              </h4>
              <p className="text-xs text-slate-300 mb-2">
                {hoveredPolicy.description}
              </p>
              <div className="text-xs text-slate-400">
                Click to see more details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TPAFCircularVisualization;