// src/components/RAMResults.tsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Target,
  FileText,
  Users,
  Lightbulb,
  BarChart3,
  Download
} from 'lucide-react';
import coverImage from '../assets/only-cover.png';
import g20Logo from '../assets/g20-logo.png';

interface RAMResultsProps {
  onNavigateToHome: () => void;
  onNavigateToExplore: () => void;
}

interface RAMResults {
  dimensions: {
    infrastructure: number;
    legislation: number;
    sustainability: number;
    economic: number;
    education: number;
  };
  specificGaps: string[];
  strengths: string[];
  capacity: 'low' | 'medium' | 'high';
  countryProfile: string;
}

interface PolicyRecommendation {
  id: string;
  title: string;
  dimension: string;
  phase: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  timeframe: string;
  complexity: 'low' | 'medium' | 'high';
}

const RAMResults: React.FC<RAMResultsProps> = ({
  onNavigateToHome,
  onNavigateToExplore
}) => {
  const [hasUploadedAssessment, setHasUploadedAssessment] = useState(false);
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [showQuickAssessment, setShowQuickAssessment] = useState(false);
  const [quickAssessmentAnswers, setQuickAssessmentAnswers] = useState<Record<string, string>>({});
  const [ramResults, setRAMResults] = useState<RAMResults | null>(null);

  // Mock RAM results based on quick assessment or file upload
  const generateRAMResults = (answers: Record<string, string>): RAMResults => {
    // This would be replaced with actual assessment logic
    const aiStrategy = answers.aiStrategy || 'no';
    const infrastructure = answers.infrastructure || 'basic';
    const dataProtection = answers.dataProtection || 'no';
    const capacity = answers.capacity || 'low';

    let dimensions = {
      infrastructure: infrastructure === 'advanced' ? 75 : infrastructure === 'developing' ? 50 : 25,
      legislation: aiStrategy === 'yes' ? 80 : aiStrategy === 'partial' ? 40 : 15,
      sustainability: 45, // Default moderate
      economic: 35, // Default lower
      education: infrastructure === 'advanced' ? 65 : 40
    };

    if (dataProtection === 'yes') {
      dimensions.legislation += 20;
    }

    const gaps = [];
    const strengths = [];

    if (dimensions.legislation < 40) gaps.push('no-ai-strategy');
    if (dimensions.infrastructure < 50) gaps.push('weak-infrastructure');
    if (dimensions.economic < 40) gaps.push('no-economic-framework');
    
    if (dimensions.infrastructure > 60) strengths.push('strong-infrastructure');
    if (dataProtection === 'yes') strengths.push('data-protection-foundation');

    return {
      dimensions,
      specificGaps: gaps,
      strengths,
      capacity: capacity as 'low' | 'medium' | 'high',
      countryProfile: `${capacity.charAt(0).toUpperCase() + capacity.slice(1)} capacity country with ${infrastructure} infrastructure`
    };
  };

  const generatePolicyRecommendations = (results: RAMResults): PolicyRecommendation[] => {
    const recommendations: PolicyRecommendation[] = [];

    // Critical gaps
    if (results.specificGaps.includes('no-ai-strategy')) {
      recommendations.push({
        id: 'ai-strategy',
        title: 'Develop National AI Strategy and Governance Framework',
        dimension: 'Legislation',
        phase: 'Analysis & Design',
        priority: 'critical',
        reasoning: 'No national AI strategy exists - this is the foundation for all other AI governance efforts',
        timeframe: '12-18 months',
        complexity: 'high'
      });
    }

    if (results.specificGaps.includes('weak-infrastructure')) {
      recommendations.push({
        id: 'infrastructure-assessment',
        title: 'Assess Digital Infrastructure Readiness for AI',
        dimension: 'Infrastructure',
        phase: 'Analysis',
        priority: 'critical',
        reasoning: 'Current infrastructure may not support AI deployment at scale',
        timeframe: '6-9 months',
        complexity: 'medium'
      });
    }

    if (results.specificGaps.includes('no-economic-framework')) {
      recommendations.push({
        id: 'economic-strategy',
        title: 'Define AI Economic Impact Strategy',
        dimension: 'Economic',
        phase: 'Analysis & Design',
        priority: 'high',
        reasoning: 'Economic framework needed to guide AI investment and market development',
        timeframe: '9-12 months',
        complexity: 'high'
      });
    }

    // Build on strengths
    if (results.strengths.includes('data-protection-foundation')) {
      recommendations.push({
        id: 'enhance-data-protection',
        title: 'Enhance Data Protection Framework for AI Applications',
        dimension: 'Legislation',
        phase: 'Implementation',
        priority: 'medium',
        reasoning: 'Build on existing data protection laws to address AI-specific challenges',
        timeframe: '6-12 months',
        complexity: 'medium'
      });
    }

    if (results.strengths.includes('strong-infrastructure')) {
      recommendations.push({
        id: 'ai-infrastructure-optimization',
        title: 'Optimize Infrastructure for AI Workloads',
        dimension: 'Infrastructure',
        phase: 'Implementation',
        priority: 'medium',
        reasoning: 'Leverage strong infrastructure foundation for AI-specific optimizations',
        timeframe: '3-6 months',
        complexity: 'medium'
      });
    }

    // Future opportunities
    recommendations.push({
      id: 'ai-education',
      title: 'Develop AI Ethics and Skills Education Programs',
      dimension: 'Education',
      phase: 'Design',
      priority: 'medium',
      reasoning: 'Build public understanding and professional capacity for AI governance',
      timeframe: '12-24 months',
      complexity: 'medium'
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAssessmentFile(file);
      setHasUploadedAssessment(true);
      
      // Mock processing - in real app, would parse the file
      setTimeout(() => {
        const mockResults = generateRAMResults({
          aiStrategy: 'no',
          infrastructure: 'developing',
          dataProtection: 'yes',
          capacity: 'medium'
        });
        setRAMResults(mockResults);
      }, 2000);
    }
  };

  const handleQuickAssessmentSubmit = () => {
    const results = generateRAMResults(quickAssessmentAnswers);
    setRAMResults(results);
    setHasUploadedAssessment(true);
  };

  const quickAssessmentQuestions = [
    {
      id: 'aiStrategy',
      question: 'Does your country have a national AI strategy?',
      options: [
        { value: 'yes', label: 'Yes, comprehensive strategy' },
        { value: 'partial', label: 'Partial or draft strategy' },
        { value: 'no', label: 'No strategy yet' }
      ]
    },
    {
      id: 'infrastructure',
      question: 'How would you rate your digital infrastructure readiness?',
      options: [
        { value: 'advanced', label: 'Advanced (5G, cloud, data centers)' },
        { value: 'developing', label: 'Developing (4G, some cloud services)' },
        { value: 'basic', label: 'Basic (3G/4G, limited digital services)' }
      ]
    },
    {
      id: 'dataProtection',
      question: 'Do you have comprehensive data protection laws?',
      options: [
        { value: 'yes', label: 'Yes, comprehensive laws' },
        { value: 'basic', label: 'Basic privacy protections' },
        { value: 'no', label: 'No specific data protection laws' }
      ]
    },
    {
      id: 'capacity',
      question: 'What is your country\'s AI governance capacity?',
      options: [
        { value: 'high', label: 'High (dedicated AI teams, resources)' },
        { value: 'medium', label: 'Medium (some expertise, moderate resources)' },
        { value: 'low', label: 'Low (limited expertise, constrained resources)' }
      ]
    }
  ];

  const getDimensionColor = (score: number) => {
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 border-red-400 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-400 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      default: return 'bg-green-50 border-green-400 text-green-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header - Same as other pages */}
      <div className="w-full mb-8">
        <div 
          className="flex flex-col shadow-md overflow-hidden relative"
          style={{
            width: '100vw',
            height: 'min(280px, 24vw)',
            minHeight: '200px',
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
          }}
        >
          {/* G20 Logo */}
          <div className="absolute top-4 left-60 sm:top-6 sm:right-40">
            <img 
              src={g20Logo} 
              alt="G20 Logo" 
              className="h-16 sm:h-24 object-contain" 
            />
          </div>

          {/* Title */}
          <div className="absolute right-60 top-1/3 transform -translate-y-1/2 text-right w-full px-4">
            <h1 className="text-white font-regular text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              AI Readiness Assessment<br />Results & Recommendations
            </h1>
          </div>

          {/* Controls */}
          <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 min-w-[300px] max-w-[100vw] w-auto px-4 py-2">
            <div className="flex flex-row flex-wrap justify-center gap-3 bg-black bg-opacity-70 p-3 rounded-xl backdrop-blur-sm">
              <button 
                onClick={onNavigateToHome}
                className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Home</span>
              </button>
              
              <button 
                onClick={onNavigateToExplore}
                className="bg-white bg-opacity-20 border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-30"
              >
                <span>Explore All Policies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {!hasUploadedAssessment ? (
          // Assessment Input Section
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-800 mb-4">Share Your AI Readiness Assessment</h2>
              <p className="text-lg text-gray-600">
                Upload your completed assessment or answer a few quick questions to get personalized policy recommendations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* File Upload Option */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-8 drop-shadow-md">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Assessment Results</h3>
                  <p className="text-gray-600 text-sm">Have completed RAM results? Upload them for detailed analysis</p>
                </div>

                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="assessment-upload"
                  />
                  <label htmlFor="assessment-upload" className="cursor-pointer">
                    <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">Click to upload assessment file</p>
                    <p className="text-sm text-gray-500">PDF, Excel, CSV, or JSON formats</p>
                  </label>
                </div>

                {assessmentFile && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <FileText className="w-4 h-4 inline mr-2" />
                      {assessmentFile.name} uploaded successfully
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Assessment Option */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-8 drop-shadow-md">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Assessment</h3>
                  <p className="text-gray-600 text-sm">Answer 4 quick questions for immediate recommendations</p>
                </div>

                {!showQuickAssessment ? (
                  <button
                    onClick={() => setShowQuickAssessment(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    Start Quick Assessment
                  </button>
                ) : (
                  <div className="space-y-6">
                    {quickAssessmentQuestions.map((question, index) => (
                      <div key={question.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {index + 1}. {question.question}
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setQuickAssessmentAnswers(prev => ({
                                ...prev,
                                [question.id]: option.value
                              }))}
                              className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                                quickAssessmentAnswers[question.id] === option.value
                                  ? 'border-green-500 bg-green-50 text-green-800'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {Object.keys(quickAssessmentAnswers).length === quickAssessmentQuestions.length && (
                      <button
                        onClick={handleQuickAssessmentSubmit}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Generate Recommendations
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Results Display Section
          ramResults && (
            <div className="space-y-8">
              {/* Readiness Overview */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-8 drop-shadow-md">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your AI Readiness Profile</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Dimension Scores</h3>
                    <div className="space-y-4">
                      {Object.entries(ramResults.dimensions).map(([dimension, score]) => (
                        <div key={dimension} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {dimension}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getDimensionColor(score)}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold w-8">{score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Key Insights</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Profile</p>
                          <p className="text-sm text-gray-600">{ramResults.countryProfile}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Priority Focus</p>
                          <p className="text-sm text-gray-600">
                            {ramResults.specificGaps.length} critical gaps identified requiring immediate attention
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Strengths</p>
                          <p className="text-sm text-gray-600">
                            {ramResults.strengths.length} existing foundations to build upon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Recommendations */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-8 drop-shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Personalized Policy Recommendations</h2>
                  <button 
                    onClick={onNavigateToExplore}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    View in Policy Explorer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {generatePolicyRecommendations(ramResults).map((rec, index) => (
                    <div key={rec.id} className={`border-l-4 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold">{index + 1}.</span>
                            <h3 className="text-lg font-semibold">{rec.title}</h3>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(rec.priority)}`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {rec.dimension}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {rec.phase}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>⏱️ {rec.timeframe}</div>
                          <div>🎯 {rec.complexity} complexity</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">💡 Implementation Tip</p>
                      <p className="text-sm text-blue-700">
                        Start with the critical priority items as they form the foundation for other policies. 
                        Countries with similar profiles typically see results within 6-12 months of implementing 
                        their first 2-3 recommended policies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={onNavigateToExplore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
                >
                  Explore All Policies
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RAMResults;