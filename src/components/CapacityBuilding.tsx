// src/components/CapacityBuilding.tsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen, 
  Users, 
  Award,
  PlayCircle,
  FileText,
  MessageCircle,
  Globe,
  CheckCircle,
  ExternalLink,
  Clock,
  Star,
  Target,
  Lightbulb,
  Settings,
  Shield,
  Scale,
  Building,
  Layers
} from 'lucide-react';
import coverImage from '../assets/only-cover.png';
import g20Logo from '../assets/g20-logo.png';

interface CapacityBuildingProps {
  onNavigateToHome: () => void;
  onNavigateToExplore: () => void;
}

const CapacityBuilding: React.FC<CapacityBuildingProps> = ({
  onNavigateToHome,
  onNavigateToExplore
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('');

  // Exact courses from the slides
  const coreCourses = [
    {
      id: 'ai-literacy-basic',
      title: 'AI Literacy for Civil Servants (basic course)',
      department: 'CI SHS/EAI',
      color: 'blue',
      audience: 'Junior / mid-level civil servants who may use or want to use general AI tools but do not have much background knowledge about AI',
      description: 'Introductory course for public sector focusing on UNESCO Framework on AI and Digital Transformation for Civil Servants, emphasis on AI application in public service',
      available: true
    },
    {
      id: 'ai-literacy-advanced',
      title: 'AI Literacy for Civil Servants (advanced course)',
      department: 'CI SHS/EAI',
      color: 'purple',
      audience: 'Junior / mid-level civil servants who are involved in AI development / deployment / procurement with solid technical understanding of AI',
      description: 'Aims to equip civil servants with knowledge, skills, and attitudes needed to responsibly lead and govern digital transformation and use of AI in public sector',
      available: true
    },
    {
      id: 'ai-policy-makers',
      title: 'AI Literacy for Policy Makers',
      department: 'CI SHS/EAI',
      color: 'green',
      audience: 'Senior civil servants / policy makers (e.g. CIOs of government agencies) who make decisions about development / deployment / procurement of AI systems',
      description: 'Strategic training for senior decision makers on AI governance, policy development, and implementation oversight',
      available: true
    },
    {
      id: 'ai-supervisory',
      title: 'AI for Supervisory Authorities',
      department: 'CI SHS/EAI',
      color: 'orange',
      audience: 'Supervisory Authorities for AI (civil servants working in these public bodies)',
      description: 'Specialized training for regulatory oversight bodies responsible for AI compliance and enforcement',
      available: false
    },
    {
      id: 'ai-judicial',
      title: 'AI for Judicial Operators',
      department: 'CI SHS/EAI',
      color: 'red',
      audience: 'Judicial Operators',
      description: 'Training for legal professionals on AI applications in judicial systems, fairness, and legal considerations',
      available: false
    },
    {
      id: 'ai-public-sector',
      title: 'AI for the Public Sector',
      department: 'CI',
      color: 'teal',
      audience: 'Public sector (exact profile TBC)',
      description: 'Practical training for designing and implementing AI-based public services and citizen-facing applications',
      available: false
    }
  ];

  const moocCourses = [
    {
      id: 'mooc-ethics',
      title: 'MOOC: AI Ethics',
      audience: 'General public (TBC)',
      description: 'Comprehensive introduction to ethical considerations in AI development and deployment',
      available: true
    },
    {
      id: 'mooc-transformation',
      title: 'MOOC: AI and Digital Transformation in the Public Sector',
      audience: 'Civil Servants',
      description: 'Overview of digital transformation strategies and AI integration in government services',
      available: false
    }
  ];

  // Shared modules across courses (from slide 2)
  const sharedModules = [
    'AI ethics and UNESCO Recommendation',
    'Foundations of AI / types of AI systems',
    'Challenges / opportunities of AI / dig transformation in public sector'
  ];

  const aiPublicSectorModules = [
    'AI project management cycle and understanding data',
    'Problem Identification and AI Use Cases in the Public Sector',
    'Design Thinking and Human-Centric AI Public Services',
    'Making Sense of Needs and Identifying Requirements',
    'Designing AI-Based Public Services',
    'Consolidation of AI-based Public Service',
    'Public procurement and due diligence of AI',
    'Risks and considerations for Generative AI systems',
    'Future trends'
  ];

  const aiLiteracyModules = [
    'Different governance frameworks and regulatory approaches for AI',
    'UNESCO tools for AI Assessment',
    'AI use cases in the public sector & public procurement and AI',
    'Implementing AI responsibly in the government'
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 border-blue-200 bg-blue-50',
      purple: 'from-purple-500 to-purple-600 border-purple-200 bg-purple-50',
      green: 'from-green-500 to-green-600 border-green-200 bg-green-50',
      orange: 'from-orange-500 to-orange-600 border-orange-200 bg-orange-50',
      red: 'from-red-500 to-red-600 border-red-200 bg-red-50',
      teal: 'from-teal-500 to-teal-600 border-teal-200 bg-teal-50'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
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
              UNESCO AI Training Suite<br />& Capacity Building
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
                <span>Explore Policies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-800 mb-4">UNESCO AI Training Suite</h2>
          {/* <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            UNESCO offers various training programs to support capacity building in AI governance and policy development. 
            These courses are designed for different roles and experience levels within government and public sector organizations.
          </p> */}
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Training Resources Available</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                These training programs are available to support countries in building AI governance capacity. 
                Each country can assess which programs align with their specific needs, context, and capacity building priorities.
              </p>
            </div>
          </div>
        </div>

        {/* Core Training Courses */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Core Training Courses</h3>
          <p className="text-gray-600 text-center mb-8">Internal-facing UNESCO AI training suite</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreCourses.map((course) => {
              const colorClasses = getColorClasses(course.color);
              return (
                <div 
                  key={course.id} 
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/10 ${
                    !course.available ? 'opacity-60' : ''
                  }`}
                  style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}
                >
                  {/* Department Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`text-xs font-medium px-3 py-1 rounded-full ${colorClasses.split(' ')[2]} ${colorClasses.split(' ')[3]}`}>
                      {course.department}
                    </div>
                    {course.available ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>In Development</span>
                      </div>
                    )}
                  </div>

                  {/* Course Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-2xl flex items-center justify-center`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">{course.title}</h4>
                  
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{course.description}</p>
                  )}

                  <div className="border-t border-gray-100 pt-4">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Target Audience:</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{course.audience}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shared Core Modules */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Common Core Modules</h3>
          <p className="text-gray-600 text-center mb-8">Shared modules across AI for Public Sector and AI Literacy for Civil Servants</p>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-8"
                 style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Foundational Modules</h4>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">Shared Across All Courses:</h5>
                  <ul className="space-y-2">
                    {sharedModules.map((module, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{module}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-3">AI Literacy Specific:</h5>
                  <ul className="space-y-2">
                    {aiLiteracyModules.map((module, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{module}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOOC Courses */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Massive Open Online Courses (MOOCs)</h3>
          <p className="text-gray-600 text-center mb-8">External-facing courses for broader audiences</p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {moocCourses.map((course) => (
              <div 
                key={course.id}
                className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-6 ${
                  !course.available ? 'opacity-60' : ''
                }`}
                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    MOOC
                  </div>
                  {course.available ? (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>TBC</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                <div className="border-t border-gray-100 pt-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Audience:</h5>
                  <p className="text-xs text-gray-600">{course.audience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Interested in These Training Programs?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            These UNESCO training programs are designed to support capacity building in AI governance. 
            Contact UNESCO to learn more about program availability and how they might support your country's needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.unesco.org/en/artificial-intelligence/recommendation-ethics"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Contact UNESCO for Training Info
              <ExternalLink className="w-5 h-5" />
            </a>
            
            <button
              onClick={onNavigateToExplore}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore Policy Options
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityBuilding;