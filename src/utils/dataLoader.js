// src/utils/dataLoader.js
import * as XLSX from 'xlsx';

// Simple data loader that avoids TypeScript complexity
export const loadTPAFData = async () => {
  // Dimension configuration
  const dimensions = [
    { id: 'infrastructure', name: 'Enabling Infrastructure', shortName: 'Infrastructure', color: '#005193', angle: 0 },
    { id: 'legislation', name: 'Legislation & Policy', shortName: 'Legislation', color: '#FBAD17', angle: 72 },
    { id: 'sustainability', name: 'Sustainability & Society', shortName: 'Sustainability', color: '#9C27B0', angle: 144 },
    { id: 'economic', name: 'Economic Measures & Innovation', shortName: 'Economic', color: '#E11A2C', angle: 216 },
    { id: 'education', name: 'Research, Education & Capacity', shortName: 'Education', color: '#4CAF50', angle: 288 }
  ];

  // Sheet mapping
  const sheetMapping = {
    "1. Enabling Infrastructure": "infrastructure",
    "2. Legislation & Policy": "legislation",
    "3. Sustainability & Society": "sustainability",
    "4. Economic Measures & Innovati": "economic",
    "5. Research, Education & Capaci": "education"
  };

  try {
    // Try to load from public folder
    const response = await fetch('/data.xlsx');
    if (!response.ok) throw new Error('Excel file not found');
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      cellStyles: true,
      cellDates: true
    });

    const policies = [];
    const allKeywords = new Set();
    let policyId = 1;

    // Extract keywords from text
    const extractKeywords = (text, existingKeyword = '') => {
      if (!text) return [];
      
      const keywords = [];
      
      // Add existing keyword
      if (existingKeyword && existingKeyword.trim()) {
        keywords.push(existingKeyword.toLowerCase().trim().replace(/[^\w\s-]/g, ''));
      }
      
      // Pattern matching for common keywords
      const patterns = [
        /\b(ethics?|ethical)\b/gi,
        /\b(transparency|transparent)\b/gi,
        /\b(standards?|standardization)\b/gi,
        /\b(collaboration|collaborative)\b/gi,
        /\b(innovation|innovative)\b/gi,
        /\b(assessment|evaluate|evaluation)\b/gi,
        /\b(monitoring|oversight|supervision)\b/gi,
        /\b(governance|governing)\b/gi,
        /\b(security|secure)\b/gi,
        /\b(fairness|fair|equity|equitable)\b/gi,
        /\b(accountability|accountable|responsible)\b/gi,
        /\b(risk|risk-management)\b/gi,
        /\b(stakeholder|participation)\b/gi,
        /\b(data-protection|privacy)\b/gi
      ];
      
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const normalized = match.toLowerCase().replace(/[^\w-]/g, '');
            if (normalized.length > 3) {
              keywords.push(normalized);
            }
          });
        }
      });
      
      return Array.from(new Set(keywords));
    };

    // Determine complexity
    const getComplexity = (details, examples = '') => {
      const totalLength = (details || '').length + (examples || '').length;
      const hasComplexTerms = /assessment|framework|implementation|governance|comprehensive|systematic/.test(details || '');
      
      if (totalLength > 800 || hasComplexTerms) return 'high';
      if (totalLength > 400) return 'medium';
      return 'low';
    };

    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const dimensionId = sheetMapping[sheetName];
      if (!dimensionId) return;

      const dimension = dimensions.find(d => d.id === dimensionId);
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      const startAngle = dimension.angle - 36;
      const endAngle = dimension.angle + 36;

      // Filter valid rows
      const validRows = sheetData.filter(row => {
        const title = row['Policy Option'] || row['Policy Option (relevance/goal)'] || '';
        return title && title.toString().trim().length > 0;
      });

      validRows.forEach((row, index) => {
        const title = (row['Policy Option'] || row['Policy Option (relevance/goal)'] || '').toString().trim();
        const details = (row['Details/Actions to be taken by govts'] || '').toString().trim();
        const examples = (row['Examples'] || '').toString().trim();
        const existingKeyword = (row['Keyword'] || '').toString();

        if (!title) return;

        // Calculate angle
        const angle = validRows.length === 1 
          ? dimension.angle 
          : startAngle + (endAngle - startAngle) * (index / Math.max(validRows.length - 1, 1));

        // Extract keywords
        const keywords = extractKeywords(details + ' ' + examples + ' ' + title, existingKeyword);
        keywords.forEach(k => allKeywords.add(k));

        // Determine complexity
        const complexity = getComplexity(details, examples);

        // Calculate radius
        const complexityWeight = complexity === 'high' ? 1 : complexity === 'medium' ? 0.8 : 0.6;
        const connectionWeight = Math.min(keywords.length / 5, 1);
        const radius = 0.5 + (complexityWeight * 0.3) + (connectionWeight * 0.2);

        policies.push({
          id: policyId++,
          title,
          description: details || `Policy for ${dimension.shortName.toLowerCase()} governance`,
          dimension: dimensionId,
          keywords: keywords.slice(0, 5),
          phase: ['Assessment', 'Development', 'Implementation'][Math.floor(Math.random() * 3)],
          progress: Math.floor(Math.random() * 100),
          complexity,
          priority: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          radius: Math.min(radius, 1),
          angle,
          examples,
          details,
          connections: []
        });
      });
    });

    // Calculate connections
    policies.forEach(policy => {
      policy.connections = policies
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

    console.log(`✅ Loaded ${policies.length} policies from Excel`);
    
    return {
      policies,
      keywords: Array.from(allKeywords).sort(),
      dimensions
    };

  } catch (error) {
    console.warn('Could not load Excel file, using mock data:', error);
    
    // Return mock data as fallback
    const mockPolicies = [
      {
        id: 1,
        title: 'AI Readiness Assessment',
        description: 'Comprehensive evaluation of AI infrastructure capabilities',
        dimension: 'infrastructure',
        keywords: ['assessment', 'standards', 'monitoring'],
        phase: 'Assessment',
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
        keywords: ['ethics', 'transparency', 'accountability'],
        phase: 'Development',
        progress: 60,
        complexity: 'high',
        priority: 'high',
        radius: 0.9,
        angle: 52,
        connections: []
      },
      {
        id: 3,
        title: 'Social Inclusion Framework',
        description: 'Ensuring AI benefits all segments of society',
        dimension: 'sustainability',
        keywords: ['fairness', 'stakeholder-engagement', 'ethics'],
        phase: 'Development',
        progress: 40,
        complexity: 'high',
        priority: 'medium',
        radius: 0.85,
        angle: 124,
        connections: []
      },
      {
        id: 4,
        title: 'AI Investment Framework',
        description: 'Guidelines for AI-focused economic investments',
        dimension: 'economic',
        keywords: ['innovation', 'assessment', 'governance'],
        phase: 'Development',
        progress: 55,
        complexity: 'high',
        priority: 'high',
        radius: 0.9,
        angle: 196,
        connections: []
      },
      {
        id: 5,
        title: 'AI Skills Development',
        description: 'Programs for building AI capabilities in workforce',
        dimension: 'education',
        keywords: ['collaboration', 'stakeholder-engagement', 'innovation'],
        phase: 'Implementation',
        progress: 80,
        complexity: 'medium',
        priority: 'medium',
        radius: 0.7,
        angle: 268,
        connections: []
      }
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
      keywords: ['ethics', 'transparency', 'standards', 'collaboration', 'innovation', 'assessment', 'monitoring', 'governance', 'security', 'fairness', 'accountability', 'risk-management', 'stakeholder-engagement', 'data-protection'],
      dimensions
    };
  }
};

export default loadTPAFData;