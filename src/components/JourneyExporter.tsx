import React from 'react';
import type { Policy, Dimension, Phase } from '../services/tpafDataService';
import coverImage from '../assets/only-cover.png';
import g20Logo from '../assets/g20-logo.png';



interface JourneyExporterProps {
  savedPolicies: Set<number>;
  readPolicies: Set<number>;
  data: {
    policies: Policy[];
    dimensions: Dimension[];
    phases: Phase[];
    keywords: string[];
  };
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const useJourneyExporter = ({
  savedPolicies,
  readPolicies,
  data,
  svgRef
}: JourneyExporterProps) => {
  
  // Professional Report Design System for Policy Documents
  const DESIGN = {
    colors: {
      // TPAF dimension colors
      infrastructure: '#005193',
      legislation: '#FBAD17', 
      sustainability: '#9C27B0',
      economic: '#E11A2C',
      education: '#4CAF50',
      
      // Document colors
      primary: '#1a365d',
      secondary: '#2d3748',
      text: '#2d3748',
      textLight: '#4a5568',
      textMuted: '#718096',
      background: '#ffffff',
      backgroundLight: '#f8fafc',
      border: '#e2e8f0',
      accent: '#3182ce'
    },
    
    // Professional typography for formal documents
    typography: {
      title: 18,        // Report title
      sectionTitle: 14, // Dimension titles
      heading: 11,      // Policy titles
      subheading: 9,    // Subsection headers
      body: 9,          // Main text (readable for policy content)
      small: 8,         // Metadata
      tiny: 7           // Footer
    },
    
    // Generous spacing for readability
    spacing: {
      margin: 20,       // Page margins
      section: 12,      // Between major sections
      policy: 8,        // Between policies
      paragraph: 4,     // Between paragraphs
      element: 3        // Small spacing
    },
    
    // Layout dimensions
    layout: {
      lineHeight: 1.4,  // Readable line height
      paragraphSpacing: 4,
      maxTextWidth: 170 // Max width for text blocks
    }
  };

  // Helper: Get dimension color
  const getDimensionColor = (dimensionId: string): string => {
    const colorMap: Record<string, string> = {
      infrastructure: DESIGN.colors.infrastructure,
      legislation: DESIGN.colors.legislation,
      sustainability: DESIGN.colors.sustainability,
      economic: DESIGN.colors.economic,
      education: DESIGN.colors.education
    };
    return colorMap[dimensionId] || DESIGN.colors.primary;
  };
  // Helper function to convert image URL to Base64
  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  };
  // Helper: Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // Helper: Render formal paragraph with proper spacing and margin checking
  
  const renderParagraph = (
    pdf: any,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    pageWidth: number,
    fontSize: number = DESIGN.typography.body,
    lineHeight: number = DESIGN.layout.lineHeight
  ): number => {
    if (!text || text.trim() === '') return 0;

    // Set font before splitting text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fontSize);
    
    // Calculate actual max width considering margins
    const actualMaxWidth = Math.min(maxWidth, pageWidth - x - DESIGN.spacing.margin);
    
    // Split text into lines
    const lines = pdf.splitTextToSize(text.trim(), actualMaxWidth);
    
    // Calculate line height in mm (jsPDF uses points internally)
    const lineHeightInMM = (fontSize * lineHeight) / 2.83465;
    
    // Render each line
    lines.forEach((line: string, index: number) => {
      pdf.text(line, x, y + (index * lineHeightInMM));
    });
    
    return lines.length * lineHeightInMM;
  };

  // Helper: Calculate text height for layout planning
  // const calculateTextHeight = (
  //   pdf: any,
  //   text: string,
  //   maxWidth: number,
  //   pageWidth: number,
  //   fontSize: number = DESIGN.typography.body
  // ): number => {
  //   if (!text || text.trim() === '') return 0;
    
  //   pdf.setFont('helvetica', 'normal');
  //   pdf.setFontSize(fontSize);
    
  //   const actualMaxWidth = Math.min(maxWidth, pageWidth - DESIGN.spacing.margin * 2);
  //   const lines = pdf.splitTextToSize(text.trim(), actualMaxWidth);
    
  //   return lines.length * (fontSize * DESIGN.layout.lineHeight) / 2.83465;
  // };

  // Helper: Draw section header with dimension styling (fixed width)
  const drawSectionHeader = (
    pdf: any,
    title: string,
    subtitle: string,
    color: string,
    x: number,
    y: number,
    width: number,
    percentage?: number  // Add percentage parameter
  ): number => {
    const headerHeight = 25;
    
    // Header background with dimension color
    pdf.setFillColor(...hexToRgb(color));
    pdf.rect(x, y, width, headerHeight, 'F');
    
    // Title - ensure it fits within the header width
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(DESIGN.typography.sectionTitle);
    
    // Check if title fits, truncate if necessary
    const titleWidth = pdf.getStringUnitWidth(title) * DESIGN.typography.sectionTitle / pdf.internal.scaleFactor;
    const maxTitleWidth = width - (percentage ? 40 : 16); // Adjust width if showing percentage
    
    let displayTitle = title;
    if (titleWidth > maxTitleWidth) {
      // Truncate title if too long
      while (pdf.getStringUnitWidth(displayTitle + '...') * DESIGN.typography.sectionTitle / pdf.internal.scaleFactor > maxTitleWidth && displayTitle.length > 0) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += '...';
    }
    
    pdf.text(displayTitle, x + 8, y + 12);
    
    // Subtitle
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(DESIGN.typography.small);
    pdf.text(subtitle, x + 8, y + 20);
    
    // Add percentage if provided
    if (percentage !== undefined) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`${percentage}% completed`, x + width - 4, y + 5, { align: 'right' });
    }
    
    return headerHeight;
  };

  // // Helper: Draw policy card with proper text wrapping
  // const drawPolicyCard = (
  //   pdf: any,
  //   policy: Policy,
  //   x: number,
  //   y: number,
  //   width: number,
  //   dimColor: string,
  //   policyIndex: number,
  //   pageWidth: number  // Add pageWidth parameter
  // ): number => {
  //   // Calculate required height based on content
  //   const titleHeight = calculateTextHeight(
  //     pdf, 
  //     `${policyIndex + 1}. ${policy.title}`, 
  //     width - 16, 
  //     pageWidth,  // Add this
  //     DESIGN.typography.heading
  //   );

  //   const descHeight = policy.description ? calculateTextHeight(
  //     pdf, 
  //     policy.description, 
  //     width - 16, 
  //     pageWidth,  // Add this
  //     DESIGN.typography.body
  //   ) : 0;

  //   const detailsHeight = policy.details ? calculateTextHeight(
  //     pdf, 
  //     policy.details, 
  //     width - 16, 
  //     pageWidth,  // Add this
  //     DESIGN.typography.body
  //   ) : 0;

  //   const examplesHeight = policy.examples ? calculateTextHeight(
  //     pdf, 
  //     policy.examples, 
  //     width - 16, 
  //     pageWidth,  // Add this
  //     DESIGN.typography.body
  //   ) : 0;
  //   const cardHeight = Math.max(30, titleHeight + descHeight + detailsHeight + examplesHeight + 40); // Extra padding for headers and spacing
    
  //   // Policy header background
  //   pdf.setFillColor(...hexToRgb(DESIGN.colors.backgroundLight));
  //   pdf.rect(x, y, width, 12, 'F');
    
  //   // Dimension indicator bar
  //   pdf.setFillColor(...hexToRgb(dimColor));
  //   pdf.rect(x, y, 4, 12, 'F');

  //   // Policy title - ensure it fits
  //   pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
  //   pdf.setFont('helvetica', 'bold');
  //   pdf.setFontSize(DESIGN.typography.heading);
    
  //   const titleText = `${policyIndex + 1}. ${policy.title}`;
  //   const titleUsedHeight = renderParagraph(pdf, titleText, x + 8, y + 8, width - 16, pageWidth, DESIGN.typography.heading);
    
  //   let contentY = y + 15 + titleUsedHeight;
    
  //   return cardHeight;
  // };

  // // Helper: Load image as base64
  // const loadImageAsBase64 = async (imagePath: string): Promise<string | null> => {
  //   try {
  //     // For local development, we'll create a placeholder
  //     // In production, you'd load the actual image
  //     return null; // Will be handled gracefully
  //   } catch (error) {
  //     console.warn(`Could not load image: ${imagePath}`);
  //     return null;
  //   }
  // };


  const exportJourneyPDF = async () => {
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Convert imported images to Base64 (no need to declare variables here)
      const coverImageBase64 = await getBase64ImageFromURL(coverImage);
      const g20LogoBase64 = await getBase64ImageFromURL(g20Logo);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });


      pdf.setProperties({
        // title: 'Aggregated report from UNESCO TPAF AI Governance Implementation Plan',
        subject: 'Selected Policy Options for Implementation',
        // author: 'UNESCO Technology Policy Assistance Facility',
        keywords: 'AI governance, policy implementation, TPAF, UNESCO, policy options',
        creator: 'TPAF Platform'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = DESIGN.spacing.margin;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Calculate statistics
      const totalPolicies = data.policies.length;
      const savedCount = savedPolicies.size;
      // const readCount = readPolicies.size;
      // const completionRate = Math.round((savedCount / totalPolicies) * 100);

      // ==================== ENHANCED COVER PAGE WITH IMAGES ====================
      
      // Try to load the cover image and G20 logo
      // let coverImageData: string | null = null;
      // let g20LogoData: string | null = null;
      
      try {
      } catch (error) {
        console.log('Images not loaded, proceeding with text-only cover');
      }

      // Cover page background
      pdf.setFillColor(...hexToRgb(DESIGN.colors.primary));
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      let coverCurrentY = margin;
     // Main cover image section
     
    const coverImageMaxWidth = contentWidth; // Use full content width
    const coverImageAspectRatio = 1632 / 512; // 3.19
    const coverImageHeight = coverImageMaxWidth / coverImageAspectRatio; // ~54mm for A4
    // const coverImageY = margin + 60; // 60mm from top
    // const coverImageWidth = pageWidth;
    const coverHeight = pageWidth / coverImageAspectRatio;
    // const coverY = (pageHeight - coverHeight) / 2;


    // 2. Transparent logo overlay
    const logoDisplayHeight = 20; // mm
    const logoAspectRatio = 1798/512
    const logoDisplayWidth = logoDisplayHeight * logoAspectRatio;
    const logoX = (pageWidth - logoDisplayWidth) / 2; // Center horizontally
    const logoY = 20; // 20mm from top

    
      if (coverImageBase64) {
        try {
          pdf.addImage(
            coverImageBase64,
            'PNG',
            0,0,            // X: Full left edge
            // coverY - 30,       // Y: Centered vertically
            pageWidth,   // Full page width
            coverHeight,  // Proportional height
            undefined,    // Maintain aspect ratio
            'SLOW'        // Best quality
          );
        } catch (error) {
          console.error('Cover image error:', error);
        }
      }

            // Top section with G20 logo

      // Replace the logo rendering code with this:
      if (g20LogoBase64) {
        try {
          // Add logo with transparency
          pdf.addImage(
            g20LogoBase64,
            'PNG',
            logoX,
            logoY,
            logoDisplayWidth,
            logoDisplayHeight,
            undefined,
            'FAST'  // Better for transparency
          );
          
          // Add title
          pdf.setTextColor(255, 255, 255); // White text
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text('G20 Technology Policy Assistance Facility (TPAF)', 
            pageWidth / 2,
            logoY + logoDisplayHeight + 10,
            { align: 'center' }
          );
          
        } catch (error) {
          console.error('Logo error:', error);
        }
      }


      
      coverCurrentY += 40;

      coverCurrentY += coverImageHeight + 20;


      // Title section
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('Report: AI Governance', pageWidth / 2, coverCurrentY, { align: 'center' });
      
      pdf.setFontSize(22);
      pdf.text('Implementation Plan', pageWidth / 2, coverCurrentY + 15, { align: 'center' });

      coverCurrentY += 35;

      // UNESCO and TPAF branding
      // pdf.setFillColor(255, 255, 255, 0.15);
      // pdf.rect(margin + 30, coverCurrentY, contentWidth - 60, 35, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      // pdf.text('UNESCO', pageWidth / 2, coverCurrentY + 12, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(15);
      // pdf.text('Technology Policy Assistance Facility (TPAF)', pageWidth / 2, coverCurrentY + 25, { align: 'center' });

      coverCurrentY += 50;

      // Subtitle
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.text('Selected Policy Options for National Implementation', pageWidth / 2, coverCurrentY, { align: 'center' });

      // Summary information at bottom
      const summaryBoxY = pageHeight - 80;
      // pdf.setFillColor(255, 255, 255, 0.1);
      // pdf.rect(margin + 20, summaryBoxY, contentWidth - 40, 50, 'F');
      
      pdf.setFontSize(DESIGN.typography.body);
      const summaryTextY = summaryBoxY + 15;
      pdf.text(`${savedCount} policy options selected from ${totalPolicies} available`, pageWidth / 2, summaryTextY, { align: 'center' });
      
      const savedPolicyDimensions = Array.from(new Set(Array.from(savedPolicies).map(id => data.policies.find(p => p.id === id)?.dimension).filter(Boolean)));
      pdf.text(`Covering ${savedPolicyDimensions.length} dimensions of AI governance`, pageWidth / 2, summaryTextY + 10, { align: 'center' });
      
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      pdf.text(`Generated: ${today}`, pageWidth / 2, summaryTextY + 25, { align: 'center' });

      // ==================== TABLE OF CONTENTS ====================
      pdf.addPage();
      currentY = margin;

      pdf.setTextColor(...hexToRgb(DESIGN.colors.primary));
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(DESIGN.typography.sectionTitle);
      pdf.text('Contents', margin, currentY);
      currentY += 15;

      // Generate TOC based on selected policies by dimension
      const savedPolicyObjects = Array.from(savedPolicies)
        .map(id => data.policies.find(p => p.id === id))
        .filter((policy): policy is Policy => policy !== undefined);

      const dimensionGroups = data.dimensions.map(dim => ({
        dimension: dim,
        policies: savedPolicyObjects.filter(p => p.dimension === dim.id)
      })).filter(group => group.policies.length > 0);

      let pageCounter = 3; // Start after cover and TOC

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(DESIGN.typography.body);
      pdf.setTextColor(...hexToRgb(DESIGN.colors.text));

      pdf.text('Executive Summary', margin, currentY);
      pdf.text('2', pageWidth - margin - 10, currentY, { align: 'right' });
      currentY += 6;

      dimensionGroups.forEach(group => {
        pdf.text(`${group.dimension.name}`, margin, currentY);
        pdf.text(pageCounter.toString(), pageWidth - margin - 10, currentY, { align: 'right' });
        currentY += 5;
        
        // Estimate pages needed for this dimension (rough calculation)
        const estimatedPages = Math.max(1, Math.ceil(group.policies.length * 0.8));
        pageCounter += estimatedPages;
      });

      pdf.text('Implementation Timeline', margin, currentY + 5);
      pdf.text(pageCounter.toString(), pageWidth - margin - 10, currentY + 5, { align: 'right' });

      // ==================== EXECUTIVE SUMMARY ====================
      pdf.addPage();
      currentY = margin;

      pdf.setTextColor(...hexToRgb(DESIGN.colors.primary));
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(DESIGN.typography.sectionTitle);
      pdf.text('Executive Summary', margin, currentY);
      currentY += 15;

      // Overview paragraph
      pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(DESIGN.typography.body);
      
      const overviewText = `This implementation plan outlines ${savedCount} carefully selected AI governance policy options across ${dimensionGroups.length} key dimensions of the UNESCO Technology Policy Assistance Facility (TPAF) framework. These policies represent a comprehensive approach to establishing robust AI governance infrastructure, regulatory frameworks, and implementation strategies aligned with international best practices and UNESCO's ethical AI principles.`;
      
      currentY += renderParagraph(pdf, overviewText, margin, currentY, contentWidth,pageWidth, DESIGN.typography.body);
      currentY += DESIGN.spacing.paragraph;

      // Dimension Overview
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(DESIGN.typography.heading);
      pdf.text('Selected Policy Areas', margin, currentY);
      currentY += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(DESIGN.typography.body);

      dimensionGroups.forEach(group => {
        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = margin;
        }

        const dimColor = getDimensionColor(group.dimension.id);
        
        // Dimension indicator
        pdf.setFillColor(...hexToRgb(dimColor));
        pdf.rect(margin, currentY - 2, 3, 6, 'F');
        
        // Dimension summary
        pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${group.dimension.name}:`, margin + 6, currentY);
        
        pdf.setFont('helvetica', 'normal');
        const uniquePhases = Array.from(new Set(group.policies.map(p => p.phaseId)));
        const summaryText = `${group.policies.length} policy options selected, covering ${uniquePhases.length} implementation phases`;
        currentY += renderParagraph(pdf, summaryText, margin + 6, currentY + 4, contentWidth - 6,pageWidth, DESIGN.typography.small);
        currentY += 8;
      });

      // Key Implementation Principles
      currentY += DESIGN.spacing.section;
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(DESIGN.typography.heading);
      pdf.text('Implementation Approach', margin, currentY);
      currentY += 8;

      const principles = [
        '...'
      ];

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(DESIGN.typography.body);

      principles.forEach(principle => {
        if (currentY > pageHeight - 25) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text('•', margin, currentY);
        currentY += renderParagraph(pdf, principle, margin + 6, currentY, contentWidth - 6,pageWidth, DESIGN.typography.body);
        currentY += DESIGN.spacing.paragraph;
      });

      // ==================== DIMENSION-BY-DIMENSION DETAILED SECTIONS ====================
      dimensionGroups.forEach(group => {
        pdf.addPage();
        currentY = margin;

        const dimColor = getDimensionColor(group.dimension.id);
        const totalPoliciesInDimension = data.policies.filter(p => p.dimension === group.dimension.id).length;
        const percentageSaved = Math.round((group.policies.length / totalPoliciesInDimension) * 100);

        // Dimension header
        const headerHeight = drawSectionHeader(
          pdf, 
          group.dimension.name, 
          `${group.policies.length} selected policy options`,
          dimColor,
          margin,
          currentY,
          contentWidth,
          percentageSaved  // Pass the calculated percentage
        );
        currentY += headerHeight + DESIGN.spacing.section;


        // Dimension introduction
        pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(DESIGN.typography.body);

        const dimensionIntros: Record<string, string> = {
          infrastructure: 'The enabling infrastructure dimension focuses on the technological foundations necessary for responsible AI deployment, including computational resources, data infrastructure, and technical standards that support ethical AI development.',
          legislation: 'This dimension addresses the regulatory and legal frameworks required for AI governance, including comprehensive laws, definitions, risk assessments, and compliance mechanisms that ensure AI systems operate within established legal boundaries.',
          sustainability: 'Sustainability and society policies ensure AI development and deployment consider environmental impacts, promote social equity, address digital divides, and foster inclusive participation in the AI ecosystem.',
          economic: 'Economic measures focus on innovation policies, market regulations, competitive frameworks, and economic incentives that promote responsible AI development while fostering innovation and economic growth.',
          education: 'Research, education, and capacity building policies develop human capital, research capabilities, and institutional knowledge necessary for effective AI governance and ethical AI development.'
        };

        const introText = dimensionIntros[group.dimension.id] || `This section outlines the selected policy options for ${group.dimension.name}.`;
        currentY += renderParagraph(pdf, introText, margin, currentY, contentWidth, pageWidth,DESIGN.typography.body);
        currentY += DESIGN.spacing.section;

        // Individual Policy Sections
        group.policies.forEach((policy, policyIndex) => {
          // Check if we need a new page - more conservative estimate
          const estimatedPolicyHeight = 100;
          if (currentY > pageHeight - estimatedPolicyHeight && policyIndex > 0) {
            pdf.addPage();
            currentY = margin;
          }

          // Policy header with proper margin checking
          const headerWidth = contentWidth;
          pdf.setFillColor(...hexToRgb(DESIGN.colors.backgroundLight));
          pdf.rect(margin, currentY, headerWidth, 12, 'F');
          
          pdf.setFillColor(...hexToRgb(dimColor));
          pdf.rect(margin, currentY, 4, 12, 'F');

          // Policy title with text wrapping
          pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(DESIGN.typography.heading);
          
          const titleText = `${policyIndex + 1}. ${policy.title}`;
          const titleHeight = renderParagraph(pdf, titleText, margin + 8, currentY + 8, headerWidth - 16, pageWidth,DESIGN.typography.heading);
          
          // Adjust header height if title wrapped
          const actualHeaderHeight = Math.max(12, titleHeight + 4);
          if (actualHeaderHeight > 12) {
            // Redraw header with correct height
            pdf.setFillColor(...hexToRgb(DESIGN.colors.backgroundLight));
            pdf.rect(margin, currentY, headerWidth, actualHeaderHeight, 'F');
            pdf.setFillColor(...hexToRgb(dimColor));
            pdf.rect(margin, currentY, 4, actualHeaderHeight, 'F');
            // Re-render title
            pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(DESIGN.typography.heading);
            renderParagraph(pdf, titleText, margin + 8, currentY + 8, headerWidth - 16, pageWidth, DESIGN.typography.heading);
          }
          
          currentY += actualHeaderHeight + 3;

          // Policy phase (if available)
          const phase = data.phases.find(p => p.id === policy.phaseId);
          if (phase) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(DESIGN.typography.small);
            pdf.setTextColor(...hexToRgb(DESIGN.colors.textMuted));
            pdf.text(`Implementation Phase: ${phase.name}`, margin, currentY);
            currentY += 8;
          }

          // Policy Description
          pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(DESIGN.typography.body);

          if (policy.description && policy.description.trim()) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(DESIGN.typography.subheading);
            pdf.text('Policy Description:', margin, currentY);
            currentY += 6;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(DESIGN.typography.body);
            const descHeight = renderParagraph(pdf, policy.description, margin, currentY, contentWidth,pageWidth, DESIGN.typography.body);
            currentY += descHeight + DESIGN.spacing.paragraph;
          }

          // Implementation Details (if available)
          if (policy.details && policy.details.trim()) {
            if (currentY > pageHeight - 40) {
              pdf.addPage();
              currentY = margin;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(DESIGN.typography.subheading);
            pdf.text('Implementation Details:', margin, currentY);
            currentY += 6;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(DESIGN.typography.body);
            const detailsHeight = renderParagraph(
              pdf, 
              policy.details, 
              margin, 
              currentY, 
              contentWidth, 
              pageWidth,  // Add this
              DESIGN.typography.body
            );
            currentY += detailsHeight + DESIGN.spacing.paragraph;
          }

          // Examples (if available)
          if (policy.examples && policy.examples.trim()) {
            if (currentY > pageHeight - 40) {
              pdf.addPage();
              currentY = margin;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(DESIGN.typography.subheading);
            pdf.text('Implementation Examples:', margin, currentY);
            currentY += 6;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(DESIGN.typography.body);
            const examplesHeight = renderParagraph(pdf, policy.examples, margin, currentY, contentWidth,pageWidth, DESIGN.typography.body);
            currentY += examplesHeight + DESIGN.spacing.paragraph;
          }

          // Keywords (if available) - ensure they fit on one line or wrap properly
          if (policy.keywords && policy.keywords.length > 0) {
            if (currentY > pageHeight - 15) {
              pdf.addPage();
              currentY = margin;
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(DESIGN.typography.small);
            pdf.setTextColor(...hexToRgb(DESIGN.colors.textMuted));
            pdf.text('Keywords: ', margin, currentY);
            
            pdf.setFont('helvetica', 'normal');
            const keywordText = policy.keywords.join(', ');
            // Ensure keywords don't exceed margins
            const keywordsHeight = renderParagraph(pdf, keywordText, margin + 20, currentY, contentWidth - 20,pageWidth, DESIGN.typography.small);
            currentY += Math.max(8, keywordsHeight);
          }

          currentY += DESIGN.spacing.policy;
        });
      });

      // ==================== VISUAL JOURNEY MAP ====================
      if (svgRef.current) {
        try {
          pdf.addPage();
          currentY = margin;

          pdf.setTextColor(...hexToRgb(DESIGN.colors.primary));
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(DESIGN.typography.sectionTitle);
          pdf.text('Policy Selection Overview', margin, currentY);
          currentY += 15;

          const svgElement = svgRef.current;
          const tempDiv = document.createElement('div');
          tempDiv.style.cssText = `
            width: 700px;
            height: 500px;
            position: absolute;
            left: -9999px;
            background: white;
            padding: 15px;
            border-radius: 8px;
          `;
          
          tempDiv.appendChild(svgElement.cloneNode(true));
          document.body.appendChild(tempDiv);

          const canvas = await html2canvas(tempDiv, {
            backgroundColor: 'white',
            scale: 1.5,
            logging: false
          });

          const imgData = canvas.toDataURL('image/png', 0.95);
          const imgWidth = contentWidth;
          const imgHeight = Math.min(160, (canvas.height * imgWidth) / canvas.width);
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          document.body.removeChild(tempDiv);
          
          currentY += imgHeight + 10;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(DESIGN.typography.small);
          pdf.setTextColor(...hexToRgb(DESIGN.colors.textMuted));
          const captionText = 'This visualization shows your selected policies (highlighted) within the complete TPAF framework, organized by the five key dimensions of AI governance.';
          renderParagraph(pdf, captionText, margin, currentY, contentWidth, pageWidth,DESIGN.typography.small);

        } catch (error) {
          console.error('Visualization capture failed:', error);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(DESIGN.typography.body);
          pdf.setTextColor(...hexToRgb(DESIGN.colors.textMuted));
          pdf.text('Policy selection visualization unavailable', margin, currentY);
        }
      }

      // ==================== IMPLEMENTATION TIMELINE ====================
      pdf.addPage();
      currentY = margin;

      pdf.setTextColor(...hexToRgb(DESIGN.colors.primary));
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(DESIGN.typography.sectionTitle);
      pdf.text('Implementation Timeline & Next Steps', margin, currentY);
      currentY += 15;

      // Timeline introduction
      pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(DESIGN.typography.body);
      
      const timelineIntro = 'The implementation of these AI governance policies should follow a structured approach that builds foundational capabilities before advancing to more complex regulatory and operational frameworks. The following timeline provides a recommended sequence for policy implementation.';
      currentY += renderParagraph(pdf, timelineIntro, margin, currentY, contentWidth, pageWidth,DESIGN.typography.body);
      currentY += DESIGN.spacing.section;

      // Phase-based recommendations
      const phaseRecommendations = [
        {
          phase: 'Phase 1: Foundation (Months 1-6)',
          description: 'Establish basic infrastructure assessments, stakeholder engagement frameworks, and initial regulatory gap analyses. Focus on building institutional capacity and multi-stakeholder partnerships.',
          color: DESIGN.colors.infrastructure
        },
        {
          phase: 'Phase 2: Framework Development (Months 6-12)', 
          description: 'Develop comprehensive policy frameworks, draft initial regulations, and establish governance structures. Begin pilot programs for low-risk AI applications.',
          color: DESIGN.colors.legislation
        },
        {
          phase: 'Phase 3: Implementation (Months 12-24)',
          description: 'Deploy comprehensive regulatory frameworks, implement monitoring systems, and scale governance mechanisms across all AI applications and sectors.',
          color: DESIGN.colors.economic
        },
        {
          phase: 'Phase 4: Monitoring & Evaluation (Ongoing)',
          description: 'Establish continuous monitoring, regular policy reviews, and adaptive governance mechanisms to ensure frameworks remain effective as AI technologies evolve.',
          color: DESIGN.colors.education
        }
      ];

      phaseRecommendations.forEach(phase => {
        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = margin;
        }

        // Phase header
        pdf.setFillColor(...hexToRgb(phase.color));
        pdf.rect(margin, currentY, 4, 8, 'F');
        
        pdf.setTextColor(...hexToRgb(DESIGN.colors.text));
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(DESIGN.typography.heading);
        pdf.text(phase.phase, margin + 8, currentY + 6);
        currentY += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(DESIGN.typography.body);
        currentY += renderParagraph(pdf, phase.description, margin, currentY, contentWidth, pageWidth,DESIGN.typography.body);
        currentY += DESIGN.spacing.policy;
      });

      // Next Steps
      currentY += DESIGN.spacing.section;
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(DESIGN.typography.heading);
      pdf.text('Immediate Next Steps', margin, currentY);
      currentY += 8;

      const nextSteps = [
        'Establish a National AI Governance Task Force with representatives from government, civil society, industry, and academia',
        'Conduct comprehensive stakeholder consultations on the selected policy options to ensure broad consensus and support',
        'Develop detailed implementation plans for each policy area, including timelines, resource requirements, and success metrics',
        'Identify international partnerships and cooperation opportunities to leverage global best practices and shared resources',
        'Establish monitoring and evaluation frameworks to track implementation progress and policy effectiveness'
      ];

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(DESIGN.typography.body);

      nextSteps.forEach((step, index) => {
        if (currentY > pageHeight - 25) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(`${index + 1}.`, margin, currentY);
        currentY += renderParagraph(pdf, step, margin + 8, currentY, contentWidth - 8, pageWidth,  DESIGN.typography.body);
        currentY += DESIGN.spacing.paragraph;
      });

      // ==================== FOOTER SYSTEM ====================
      const totalPages = pdf.internal.pages.length - 1;
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        if (i === 1) continue; // Skip cover
        
        // Footer line
        pdf.setDrawColor(...hexToRgb(DESIGN.colors.border));
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        
        // Footer content
        pdf.setTextColor(...hexToRgb(DESIGN.colors.textMuted));
        pdf.setFontSize(DESIGN.typography.tiny);
        
        // Left: Document title
        // pdf.text('AI Governance Implementation Plan Report', margin, pageHeight - 7);
        
        // Center: Confidential marking
        pdf.text('CONFIDENTIAL', pageWidth / 2, pageHeight - 7, { align: 'center' });
        
        // Right: Page numbers
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
      }

      // ==================== SAVE PDF ====================
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `UNESCO_TPAF_Implementation_Plan_${timestamp}.pdf`;
      
      pdf.save(filename);
      console.log(`Implementation plan generated: ${filename}`);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      exportJourneyJSON();
    }
  };

  // Enhanced JSON export
  const exportJourneyJSON = () => {
    const savedPolicyObjects = Array.from(savedPolicies)
      .map(id => data.policies.find(p => p.id === id))
      .filter((policy): policy is Policy => policy !== undefined);

    const dimensionGroups = data.dimensions.map(dim => ({
      dimension: dim.name,
      shortName: dim.shortName,
      color: getDimensionColor(dim.id),
      policies: savedPolicyObjects
        .filter(p => p.dimension === dim.id)
        .map(policy => {
          const phase = data.phases.find(p => p.id === policy.phaseId);
          return {
            id: policy.id,
            title: policy.title,
            description: policy.description,
            details: policy.details || '',
            examples: policy.examples || '',
            keywords: policy.keywords || [],
            complexity: policy.complexity,
            phase: phase?.name || 'Unknown Phase'
          };
        })
    })).filter(group => group.policies.length > 0);

    const implementationPlan = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '4.0',
        source: 'UNESCO TPAF Platform - Implementation Plan',
        title: 'Report: AI Governance Implementation Plan'
      },
      summary: {
        totalAvailablePolicies: data.policies.length,
        selectedPolicies: savedPolicies.size,
        reviewedPolicies: readPolicies.size,
        dimensionsCovered: dimensionGroups.length,
        implementationReadiness: Math.round((savedPolicies.size / data.policies.length) * 100)
      },
      implementationPlan: dimensionGroups,
      timeline: {
        phase1: 'Foundation (Months 1-6)',
        phase2: 'Framework Development (Months 6-12)',
        phase3: 'Implementation (Months 12-24)',
        phase4: 'Monitoring & Evaluation (Ongoing)'
      },
      nextSteps: [
        'Establish National AI Governance Task Force',
        'Conduct stakeholder consultations',
        'Develop detailed implementation plans',
        'Identify international partnerships',
        'Establish monitoring frameworks'
      ]
    };

    const dataStr = JSON.stringify(implementationPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UNESCO_TPAF_Implementation_Plan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportJourneyPDF,
    exportJourneyJSON
  };
};