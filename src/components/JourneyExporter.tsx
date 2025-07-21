import React from 'react';
import type { Policy, Dimension, Phase } from '../services/tpafDataService';

interface JourneyExporterProps {
  savedPolicies: Set<number>;
  readPolicies: Set<number>;
  data: {
    policies: Policy[];
    dimensions: Dimension[];
    phases: Phase[];
  };
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const useJourneyExporter = ({
  savedPolicies,
  readPolicies,
  data,
  svgRef
}: JourneyExporterProps) => {
  const exportJourneyPDF = async () => {
    try {
      // Try to dynamically import PDF generation libraries
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TPAF AI Governance Journey Report', margin, currentY);
      currentY += 15;

      // Add generation date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, currentY);
      currentY += 15;

      // Overall Statistics
      const totalPolicies = data.policies.length;
      const savedCount = savedPolicies.size;
      const readCount = readPolicies.size;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Journey Overview', margin, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Policies: ${totalPolicies}`, margin, currentY);
      currentY += 7;
      pdf.text(`Policies Read: ${readCount} (${Math.round((readCount/totalPolicies)*100)}%)`, margin, currentY);
      currentY += 7;
      pdf.text(`Policies Saved: ${savedCount} (${Math.round((savedCount/totalPolicies)*100)}%)`, margin, currentY);
      currentY += 15;

      // Progress by Dimension
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Progress by Dimension', margin, currentY);
      currentY += 10;

      data.dimensions.forEach(dim => {
        const dimPolicies = data.policies.filter(p => p.dimension === dim.id);
        const saved = dimPolicies.filter(p => savedPolicies.has(p.id)).length;
        const read = dimPolicies.filter(p => readPolicies.has(p.id)).length;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${dim.shortName}:`, margin, currentY);
        currentY += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`  Read: ${read}/${dimPolicies.length} (${Math.round((read/dimPolicies.length)*100)}%)`, margin, currentY);
        currentY += 5;
        pdf.text(`  Saved: ${saved}/${dimPolicies.length} (${Math.round((saved/dimPolicies.length)*100)}%)`, margin, currentY);
        currentY += 8;
      });

      // Try to capture SVG visualization
      if (svgRef.current) {
        try {
          pdf.addPage();
          currentY = margin;

          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Circular Visualization', margin, currentY);
          currentY += 15;

          // Create a temporary container with the SVG
          const svgElement = svgRef.current;
          const svgData = new XMLSerializer().serializeToString(svgElement);
          
          // Create a temporary div to hold the SVG
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = svgData;
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.width = '800px';
          tempDiv.style.height = '500px';
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });

          // Add to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          
          // Clean up
          document.body.removeChild(tempDiv);
        } catch (error) {
          console.error('Error capturing visualization:', error);
          pdf.setFontSize(12);
          pdf.text('Visualization capture failed - please see the interactive version', margin, currentY);
        }
      }

      // Add saved policies details
      if (savedPolicies.size > 0) {
        pdf.addPage();
        currentY = margin;

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Saved Policies', margin, currentY);
        currentY += 15;

        Array.from(savedPolicies).forEach(policyId => {
          const policy = data.policies.find(p => p.id === policyId);
          if (policy) {
            const dimension = data.dimensions.find(d => d.id === policy.dimension);
            const phase = data.phases.find(p => p.id === policy.phaseId);

            // Check if we need a new page
            if (currentY > pageHeight - 40) {
              pdf.addPage();
              currentY = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            const titleLines = pdf.splitTextToSize(policy.title, pageWidth - (margin * 2));
            pdf.text(titleLines, margin, currentY);
            currentY += titleLines.length * 6;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Dimension: ${dimension?.shortName || 'Unknown'}`, margin, currentY);
            currentY += 5;
            pdf.text(`Phase: ${phase?.name || 'Unknown'}`, margin, currentY);
            currentY += 5;
            pdf.text(`Complexity: ${policy.complexity}`, margin, currentY);
            currentY += 8;

            // Add description if it fits
            if (policy.description && currentY < pageHeight - 30) {
              const descLines = pdf.splitTextToSize(policy.description, pageWidth - (margin * 2));
              const maxLines = Math.floor((pageHeight - currentY - 20) / 4);
              const displayLines = descLines.slice(0, maxLines);
              
              pdf.text(displayLines, margin, currentY);
              currentY += displayLines.length * 4;
              
              if (descLines.length > maxLines) {
                pdf.text('...', margin, currentY);
                currentY += 4;
              }
            }
            
            currentY += 5; // Space between policies
          }
        });
      }

      // Save the PDF
      pdf.save(`tpaf-journey-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF, falling back to JSON:', error);
      // Fallback to JSON export
      exportJourneyJSON();
    }
  };

  const exportJourneyJSON = () => {
    const totalPolicies = data.policies.length;
    const savedCount = savedPolicies.size;
    const readCount = readPolicies.size;
    
    const dimensionStats = data.dimensions.map(dim => {
      const dimPolicies = data.policies.filter(p => p.dimension === dim.id);
      const saved = dimPolicies.filter(p => savedPolicies.has(p.id)).length;
      const read = dimPolicies.filter(p => readPolicies.has(p.id)).length;
      return {
        dimension: dim.shortName,
        total: dimPolicies.length,
        saved,
        read,
        savedPercentage: Math.round((saved / dimPolicies.length) * 100),
        readPercentage: Math.round((read / dimPolicies.length) * 100)
      };
    });
    
    const phaseStats = data.phases.map(phase => {
      const phasePolicies = data.policies.filter(p => p.phaseId === phase.id);
      const saved = phasePolicies.filter(p => savedPolicies.has(p.id)).length;
      const read = phasePolicies.filter(p => readPolicies.has(p.id)).length;
      return {
        phase: phase.name,
        total: phasePolicies.length,
        saved,
        read,
        savedPercentage: Math.round((saved / phasePolicies.length) * 100),
        readPercentage: Math.round((read / phasePolicies.length) * 100)
      };
    });
    
    const savedPolicyDetails = Array.from(savedPolicies).map(policyId => {
      const policy = data.policies.find(p => p.id === policyId);
      if (!policy) return null;
      
      const dimension = data.dimensions.find(d => d.id === policy.dimension);
      const phase = data.phases.find(p => p.id === policy.phaseId);
      
      return {
        id: policy.id,
        title: policy.title,
        description: policy.description,
        dimension: dimension?.shortName,
        phase: phase?.name,
        complexity: policy.complexity,
        keywords: policy.keywords
      };
    }).filter(Boolean);
    
    const journeyData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportType: 'TPAF Journey Report',
        version: '1.0'
      },
      summary: {
        overall: {
          saved: savedCount,
          read: readCount,
          total: totalPolicies,
          savedPercentage: Math.round((savedCount / totalPolicies) * 100),
          readPercentage: Math.round((readCount / totalPolicies) * 100)
        },
        byDimension: dimensionStats,
        byPhase: phaseStats
      },
      savedPolicies: savedPolicyDetails,
      rawData: {
        savedPolicyIds: Array.from(savedPolicies),
        readPolicyIds: Array.from(readPolicies)
      }
    };
    
    const blob = new Blob([JSON.stringify(journeyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tpaf-journey-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    exportJourneyPDF,
    exportJourneyJSON
  };
};