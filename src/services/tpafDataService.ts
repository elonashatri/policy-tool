import * as XLSX from 'xlsx';

// Add new Phase interface
export interface Phase {
  id: string;
  name: string;
  policies: Policy[];
}

export type ExpertReference = {
  name: string;
  unescoProfileId: string; // ID from the UNESCO portal
  expertise: string[]; // Matching expertise tags
};

// Update the Policy interface to include expertContacts
export interface Policy {
  id: number;
  title: string;
  description: string;
  dimension: DimensionId;
  phaseId: string;
  keywords: string[];
  progress: number;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  radius: number;
  angle: number;
  examples?: string;
  details?: string;
  connections?: {
    id: number;
    sharedKeywords: string[];
    strength: number;
  }[];
  expertReferences?: ExpertReference[]; // Replace expertContacts
}


export type DimensionId = 'infrastructure' | 'legislation' | 'sustainability' | 'economic' | 'education';

// Update Dimension interface to include phases
export interface Dimension {
  id: DimensionId;
  name: string;
  shortName: string;
  color: string;
  angle: number;
  phases: Phase[];
}

// Update TPAFData interface
export interface TPAFData {
  policies: Policy[];
  keywords: string[];
  dimensions: Dimension[];
  phases: Phase[]; // Add phases to top-level structure
}

class TPAFDataService {
  private static instance: TPAFDataService;
  private cachedData: TPAFData | null = null;

  private constructor() {}

  public static getInstance(): TPAFDataService {
    if (!TPAFDataService.instance) {
      TPAFDataService.instance = new TPAFDataService();
    }
    return TPAFDataService.instance;
  }

  // Dimension configuration
  private readonly dimensions: Dimension[] = [
    { 
      id: 'infrastructure', 
      name: 'Enabling Infrastructure', 
      shortName: 'Infrastructure', 
      color: '#005193', 
      angle: 0,
      phases: [] 
    },
    { 
      id: 'legislation', 
      name: 'Legislation & Policy', 
      shortName: 'Legislation', 
      color: '#FBAD17', 
      angle: 72,
      phases: [] 
    },
    { 
      id: 'sustainability', 
      name: 'Sustainability & Society', 
      shortName: 'Sustainability', 
      color: '#9C27B0', 
      angle: 144,
      phases: [] 
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

  // Sheet name to dimension mapping
  private readonly sheetMapping: Record<string, DimensionId> = {
    "Enabling Infrastructure": "infrastructure",
    "Legislation and Policy": "legislation",
    "Sustainability and Society": "sustainability",
    "Economic Measures": "economic",
    "Research, Education": "education"
  };

  // Helper function to slugify phase names
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
  }

  // Helper function to check if a string is a header/column name
  private isHeaderRow(text: string): boolean {
    const headerPatterns = [
      /phases?\s+of\s+the\s+policy\s+option/i,
      /relevance\s*\/\s*goal/i,
      /policy\s+option/i,
      /details\s*\/\s*actions/i,
      /examples?/i,
      /keywords?/i
    ];
    
    return headerPatterns.some(pattern => pattern.test(text.trim()));
  }

  // Extract keywords from text content
  private extractKeywords(text: string, existingKeyword: string = ''): string[] {
    if (!text) return [];
    
    const keywords: string[] = [];
    
    // Add existing keyword if present
    if (existingKeyword && existingKeyword.trim()) {
      keywords.push(existingKeyword.toLowerCase().trim().replace(/[^\w\s-]/g, ''));
    }
    
    // Keyword patterns to match
    const keywordPatterns = [
      /\b(ethics?|ethical)\b/gi,
      /\b(transparency|transparent)\b/gi,
      /\b(standards?|standardization)\b/gi,
      /\b(collaboration|collaborative|cooperat\w+)\b/gi,
      /\b(innovation|innovative)\b/gi,
      /\b(assessment|evaluate?|evaluation)\b/gi,
      /\b(monitoring|oversight|supervision)\b/gi,
      /\b(governance|governing)\b/gi,
      /\b(security|secure)\b/gi,
      /\b(fairness|fair|equity|equitable)\b/gi,
      /\b(accountability|accountable|responsible)\b/gi,
      /\b(risk[- ]?management|risk)\b/gi,
      /\b(stakeholder[- ]?engagement|participation)\b/gi,
      /\b(data[- ]?protection|privacy)\b/gi
    ];
    
    keywordPatterns.forEach(pattern => {
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
    
    return Array.from(new Set(keywords)); // Remove duplicates
  }

  // Determine complexity based on content
  private getComplexity(details: string, examples: string = ''): 'low' | 'medium' | 'high' {
    const totalLength = (details || '').length + (examples || '').length;
    const hasComplexTerms = /assessment|framework|implementation|governance|comprehensive|systematic/.test(details || '');
    
    if (totalLength > 800 || hasComplexTerms) return 'high';
    if (totalLength > 400) return 'medium';
    return 'low';
  }

  // Load and transform data from Excel file
  public async loadFromExcel(filePath: string): Promise<TPAFData> {
    try {
      console.log(`Loading Excel file from: ${filePath}`);
      const response = await fetch(filePath);
      
      if (!response.ok) {
        console.error(`Failed to fetch Excel file. Status: ${response.status}`);
        throw new Error('Excel file not found');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('Excel file loaded successfully');
      
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellDates: true,
      });

      return this.transformExcelData(workbook);
    } catch (error) {
      console.error('Error loading Excel file:', error);
      throw error;
    }
  }

private transformExcelData(workbook: XLSX.WorkBook): TPAFData {
    // DEBUG: Log workbook info
    console.log('All sheet names:', workbook.SheetNames);
    
    // Process each sheet and collect data
    const sheetDataMap: Record<string, any[]> = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        blankrows: false,
        raw: false,
        header: 'A' // Preserve original column structure
      });

      // Handle merged cells
      if (sheet['!merges']) {
        sheet['!merges'].forEach(merge => {
          const key = XLSX.utils.encode_cell({r: merge.s.r, c: merge.s.c});
          const value = sheet[key]?.v;
          for (let r = merge.s.r; r <= merge.e.r; r++) {
            for (let c = merge.s.c; c <= merge.e.c; c++) {
              const cell = XLSX.utils.encode_cell({r, c});
              if (!sheet[cell]) sheet[cell] = {v: value};
            }
          }
        });
      }

      console.log(`Sheet "${sheetName}" has ${sheetData.length} rows`);
      if (sheetData.length > 0) {
        console.log('First row:', sheetData[0]);
        console.log('Sheet merges:', sheet['!merges'] || []);
      }

      sheetDataMap[sheetName] = sheetData;
    });

    const policies: Policy[] = [];
    const allKeywords = new Set<string>();
    let policyId = 1;
    
    // Clone dimensions to avoid mutating original
    const dimensionsWithPhases = JSON.parse(JSON.stringify(this.dimensions));
    
    // Create a global phase registry to avoid duplicates
    const globalPhaseRegistry: Map<string, Phase> = new Map();

    // Define policy-to-expert mapping function
    const mapPolicyToExperts = (policy: Partial<Policy>): ExpertReference[] => {
      const expertMap: Record<DimensionId, ExpertReference[]> = {
        'infrastructure': [{
          name: 'Infrastructure Expert',
          unescoProfileId: 'infra-001',
          expertise: ['AI Infrastructure', 'Digital Policy', 'Cloud Computing']
        }],
        'legislation': [{
          name: 'Policy Governance Expert',
          unescoProfileId: 'legal-001',
          expertise: ['AI Regulation', 'Policy Frameworks', 'Compliance']
        }],
        'sustainability': [{
          name: 'Sustainability Specialist',
          unescoProfileId: 'sustain-001',
          expertise: ['AI for SDGs', 'Environmental Impact', 'Ethical AI']
        }],
        'economic': [{
          name: 'Economic Policy Advisor',
          unescoProfileId: 'econ-001',
          expertise: ['AI Economics', 'Innovation Policy', 'Digital Markets']
        }],
        'education': [{
          name: 'Education Technology Expert',
          unescoProfileId: 'edu-001',
          expertise: ['AI Education', 'Capacity Building', 'Digital Literacy']
        }]
      };

      // Get base experts for dimension
      const dimensionExperts = expertMap[policy.dimension as DimensionId] || [];
      
      // Add additional experts based on keywords
      const keywordExperts: ExpertReference[] = [];
      if (policy.keywords?.includes('ethics')) {
        keywordExperts.push({
          name: 'AI Ethics Specialist',
          unescoProfileId: 'ethics-001',
          expertise: ['Ethical AI', 'Human Rights', 'Algorithmic Bias']
        });
      }
      if (policy.keywords?.includes('governance')) {
        keywordExperts.push({
          name: 'Governance Expert',
          unescoProfileId: 'gov-001',
          expertise: ['Policy Implementation', 'Regulatory Frameworks']
        });
      }

      return [...dimensionExperts, ...keywordExperts].slice(0, 3); // Limit to 3 experts
    };

    // Process each sheet's data
    Object.entries(sheetDataMap).forEach(([sheetName, sheetData]) => {
      const dimensionId = this.sheetMapping[sheetName];
      if (!dimensionId) return;

      const dimension = dimensionsWithPhases.find((d: Dimension) => d.id === dimensionId);
      if (!dimension) return;

      const startAngle = dimension.angle - 36;
      const endAngle = dimension.angle + 36;

      // Group policies by phase
      const phaseMap: Record<string, Policy[]> = {};
      let currentPhase = 'Analyse needs and plan for fundamentals'; // Default phase name

      // Filter valid rows
      const validRows = (sheetData as Array<Record<string, any>>).filter((row: Record<string, any>) => {
        const policyTitle = row['B'] || row['Policy Option'] || '';
        return policyTitle.toString().trim().length > 0;
      });

      validRows.forEach((row: Record<string, any>, index: number) => {
        // Get phase from column A if available
        const phaseCell = row['A'] || row['Phases of the Policy Option'] || 
                         row['Phases of the Policy Option (relevance/goal)'];
        
        if (phaseCell && phaseCell.toString().trim().length > 0) {
          const phaseCellText = phaseCell.toString().trim();
          
          // Skip if this is a header row
          if (!this.isHeaderRow(phaseCellText)) {
            currentPhase = phaseCellText;
          }
        }
        
        // Initialize phase if not exists
        if (!phaseMap[currentPhase]) {
          phaseMap[currentPhase] = [];
        }

        // Extract policy information
        const title = (row['B'] || row['Policy Option'] || '').toString().trim();
        const details = (row['C'] || row['Details/Actions to be taken by govts'] || '').toString().trim();
        const examples = (row['D'] || row['Examples'] || '').toString().trim();
        const existingKeyword = (row['E'] || row['Keyword'] || '').toString();

        if (!title) return;

        // Calculate angle within dimension arc
        const angle = validRows.length === 1 
          ? dimension.angle 
          : startAngle + (endAngle - startAngle) * (index / Math.max(validRows.length - 1, 1));

        // Extract keywords
        const keywords = this.extractKeywords(details + ' ' + examples + ' ' + title, existingKeyword);
        keywords.forEach(k => allKeywords.add(k));

        // Determine complexity
        const complexity = this.getComplexity(details, examples);

        // Calculate radius based on complexity and connections
        const complexityWeight = complexity === 'high' ? 1 : complexity === 'medium' ? 0.8 : 0.6;
        const connectionWeight = Math.min(keywords.length / 5, 1);
        const radius = 0.5 + (complexityWeight * 0.3) + (connectionWeight * 0.2);

        const phaseId = this.slugify(currentPhase);
        
        // Create policy object without expertReferences first
        const policy: Partial<Policy> = {
          id: policyId,
          title,
          description: details || `Policy for ${dimension.shortName.toLowerCase()} governance`,
          dimension: dimensionId,
          phaseId,
          keywords: keywords.slice(0, 5), // Limit to top 5
          progress: Math.floor(Math.random() * 100),
          complexity,
          priority: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          radius: Math.min(radius, 1),
          angle,
          examples,
          details
        };

        // Now add expert references
        const completePolicy: Policy = {
          ...policy,
          expertReferences: mapPolicyToExperts(policy),
          connections: [] // Initialize empty, will be populated later
        } as Policy;

        policies.push(completePolicy);
        phaseMap[currentPhase].push(completePolicy);
        policyId++;
      });

      // Create phase objects for this dimension and add to global registry
      Object.entries(phaseMap).forEach(([phaseName, phasePolicies]) => {
        const phaseId = this.slugify(phaseName);
        
        // Check if phase already exists in global registry
        if (!globalPhaseRegistry.has(phaseId)) {
          globalPhaseRegistry.set(phaseId, {
            id: phaseId,
            name: phaseName,
            policies: []
          });
        }
        
        // Add policies to the global phase
        const globalPhase = globalPhaseRegistry.get(phaseId)!;
        globalPhase.policies.push(...phasePolicies);
        
        // Also add to dimension's phases if not already there
        if (!dimension.phases.find((p: Phase) => p.id === phaseId)) {
          dimension.phases.push({
            id: phaseId,
            name: phaseName,
            policies: phasePolicies
          });
        }
      });
    });

    // Calculate connections between policies
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
    
    // Collect all unique phases from global registry
    const allPhases: Phase[] = Array.from(globalPhaseRegistry.values());

    const data: TPAFData = {
      policies,
      keywords: Array.from(allKeywords).sort(),
      dimensions: dimensionsWithPhases,
      phases: allPhases // Use unique phases from global registry
    };

    console.log('Processed data with phases:', data);
    console.log('Unique phases found:', allPhases.map(p => p.name));
    this.cachedData = data;
    return data;
  }

  // Get cached data or return empty structure
  public getData(): TPAFData {
    return this.cachedData || {
      policies: [],
      keywords: [],
      dimensions: this.dimensions,
      phases: []
    };
  }

  // Check if data is loaded
  public isDataLoaded(): boolean {
    return this.cachedData !== null && this.cachedData.policies.length > 0;
  }
}

export default TPAFDataService;