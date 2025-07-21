// src/services/unescoExpertService.ts
export interface UNESCOExpert {
  id: string;
  name: string;
  title: string;
  organization?: string;
  expertise: string[];
  languages: string[];
  regions: string[];
  linkedin?: string;
  imageUrl?: string;
  bio?: string;
}

export const fetchExpertsByFilters = async (filters: {
  expertise?: string[];
  languages?: string[];
  regions?: string[];
}): Promise<UNESCOExpert[]> => {
  try {
    // In production, you should create a backend endpoint that:
    // 1. Scrapes UNESCO's site (or uses their API)
    // 2. Returns structured data
    // This is a mock implementation:
    
    const response = await fetch('https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders/grid?hub=47');
    const html = await response.text();
    
    // Parse HTML to extract expert data (simplified example)
    const experts: UNESCOExpert[] = [];
    
    // This would be replaced with actual parsing logic:
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const expertElements = doc.querySelectorAll('.wrapper-hub-rei002');
    expertElements.forEach(el => {
      const name = el.querySelector('.h5')?.textContent?.trim() || 'Unknown';
      const title = el.querySelector('.text-dark.three-lines')?.textContent?.trim() || '';
      const link = el.querySelector('a')?.href || '';
      const id = link.split('/').pop() || '';
      const imageUrl = el.querySelector('img')?.src || '';
      
      experts.push({
        id,
        name,
        title,
        imageUrl,
        expertise: [],
        languages: [],
        regions: [],
        // These would be populated from the detailed page
      });
    });
    
    return experts;
  } catch (error) {
    console.error('Error fetching experts:', error);
    return [];
  }
};

export const fetchExpertDetails = async (id: string): Promise<UNESCOExpert | null> => {
  try {
    const response = await fetch(`https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders/profile/${id}`);
    const html = await response.text();
    
    // Parse detailed expert page HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const name = doc.querySelector('h1')?.textContent?.trim() || 'Unknown';
    const title = doc.querySelector('.pb-5 strong')?.nextSibling?.textContent?.trim() || '';
    const bio = doc.querySelector('.mt-3')?.textContent?.trim() || '';
    
    // Extract languages
    const languages = Array.from(doc.querySelectorAll('.tags ul li a')).map(el => 
      el.textContent?.trim() || ''
    ).filter(Boolean);
    
    // Extract regions
    const regions = Array.from(doc.querySelectorAll('.pb-5 .tags ul li a')).map(el => 
      el.textContent?.trim() || ''
    ).filter(Boolean);
    
    // Extract expertise
    const expertise = Array.from(doc.querySelectorAll('.pb-5 .tags ul li a')).map(el => 
      el.textContent?.trim() || ''
    ).filter(Boolean);
    
    // Extract LinkedIn
    const linkedin = doc.querySelector('.social-linkedin a')?.getAttribute('href') || '';
    
    return {
      id,
      name,
      title,
      bio,
      languages,
      regions,
      expertise,
      linkedin,
      imageUrl: doc.querySelector('picture img')?.getAttribute('src') || ''
    };
  } catch (error) {
    console.error('Error fetching expert details:', error);
    return null;
  }
};