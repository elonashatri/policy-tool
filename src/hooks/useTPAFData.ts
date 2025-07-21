import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import TPAFDataService, { TPAFData, Policy, Phase } from '../services/tpafDataService';
import type { Dimension } from '../services/tpafDataService';

interface UseTPAFDataReturn {
  data: TPAFData;
  loading: boolean;
  error: string | null;
  reloadData: () => Promise<void>;
}

export const useTPAFData = (excelFilePath?: string): UseTPAFDataReturn => {
  const [data, setData] = useState<TPAFData>({
    policies: [],
    keywords: [],
    dimensions: [],
    phases: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataService = TPAFDataService.getInstance();

  // Wrap loadData in useCallback to memoize it
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (excelFilePath) {
        try {
          const loadedData = await dataService.loadFromExcel(excelFilePath);
          setData(loadedData);
          console.log(`✅ Loaded ${loadedData.policies.length} policies from Excel`);
          return;
        } catch (excelError) {
          console.warn('Could not load Excel file, using fallback data:', excelError);
        }
      }

      const cachedData = dataService.getData();
      if (cachedData.policies.length > 0) {
        setData(cachedData);
        console.log(`✅ Using cached data with ${cachedData.policies.length} policies`);
      } else {
        const mockData = generateMockData();
        setData(mockData);
        console.log(`⚠️ Using mock data with ${mockData.policies.length} policies`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading TPAF data:', err);
      
      const mockData = generateMockData();
      setData(mockData);
    } finally {
      setLoading(false);
    }
  }, [excelFilePath, dataService]);

  // Generate mock data as fallback
  const generateMockData = (): TPAFData => {
    // FIRST create mock phases
    const mockPhases: Phase[] = [
      {
        id: 'assessment',
        name: 'Assessment',
        policies: []
      },
      {
        id: 'development',
        name: 'Development',
        policies: []
      },
      {
        id: 'implementation',
        name: 'Implementation',
        policies: []
      }
    ];

    // THEN create mock policies
    const mockPolicies: Policy[] = [
      {
        id: 1,
        title: 'AI Readiness Assessment',
        description: 'Comprehensive evaluation of AI infrastructure capabilities',
        dimension: 'infrastructure',
        phaseId: 'assessment',
        keywords: ['assessment', 'standards', 'monitoring'],
        progress: 75,
        complexity: 'medium',
        priority: 'high',
        radius: 0.8,
        angle: -20,
        connections: []
      },
      {
        id: 2,
        title: 'AI Ethics Framework',
        description: 'Establishment of ethical guidelines for AI development',
        dimension: 'legislation',
        phaseId: 'development',
        keywords: ['ethics', 'transparency', 'accountability'],
        progress: 60,
        complexity: 'high',
        priority: 'high',
        radius: 0.9,
        angle: 52,
        connections: []
      },
      {
        id: 3,
        title: 'Sustainable AI Infrastructure',
        description: 'Developing eco-friendly AI computing infrastructure',
        dimension: 'sustainability',
        phaseId: 'implementation',
        keywords: ['sustainability', 'energy-efficiency', 'infrastructure'],
        progress: 45,
        complexity: 'medium',
        priority: 'medium',
        radius: 0.7,
        angle: 150,
        connections: []
      }
    ];

    // Add policies to phases
    mockPhases[0].policies.push(mockPolicies[0]);
    mockPhases[1].policies.push(mockPolicies[1]);
    mockPhases[2].policies.push(mockPolicies[2]);

    // NOW create dimensions
    const dimensions: Dimension[] = [
      { 
        id: 'infrastructure', 
        name: 'Enabling Infrastructure', 
        shortName: 'Infrastructure', 
        color: '#005193', 
        angle: 0,
        phases: [mockPhases[0]]
      },
      { 
        id: 'legislation', 
        name: 'Legislation & Policy', 
        shortName: 'Legislation', 
        color: '#FBAD17', 
        angle: 72,
        phases: [mockPhases[1]]
      },
      { 
        id: 'sustainability', 
        name: 'Sustainability & Society', 
        shortName: 'Sustainability', 
        color: '#9C27B0', 
        angle: 144,
        phases: [mockPhases[2]]
      },
      { 
        id: 'economic', 
        name: 'Economic Measures & Innovation', 
        shortName: 'Economic', 
        color: '#E11A2C', 
        angle: 216,
        phases: [] 
      },
      { 
        id: 'education', 
        name: 'Research, Education & Capacity', 
        shortName: 'Education', 
        color: '#4CAF50', 
        angle: 288,
        phases: [] 
      }
    ];

    const keywords = [
      'ethics', 'transparency', 'standards', 'collaboration', 'innovation',
      'assessment', 'monitoring', 'governance', 'security', 'fairness',
      'accountability', 'risk-management', 'stakeholder-engagement', 'data-protection'
    ];


    // Calculate connections for mock data
    mockPolicies.forEach(policy => {
      policy.connections = mockPolicies
        .filter(other => 
          other.id !== policy.id && 
          policy.keywords.some(keyword => other.keywords.includes(keyword))
        )
        .map(other => ({
          id: other.id,
          sharedKeywords: policy.keywords.filter(k => other.keywords.includes(k)),
          strength: policy.keywords.filter(k => other.keywords.includes(k)).length
        }));
    });

    return {
      policies: mockPolicies,
      keywords,
      dimensions,
      phases: mockPhases
    };
  };

  useEffect(() => {
    loadData();
  }, [loadData, excelFilePath]); // Add loadData to dependencies

  return {
    data,
    loading,
    error,
    reloadData: loadData
  };
};

export default useTPAFData;