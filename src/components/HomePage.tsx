import React, { useState } from 'react';
import { ArrowRight, BookOpen, Map, GraduationCap, Users, Download, Search, Sparkles, Globe, Target, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';
import coverImage from '../assets/only-cover.png';
import g20Logo from '../assets/g20-logo.png';
import sideDesign from "../assets/sideDesign.png";

interface HomePageProps {
  onNavigateToExplore: () => void;
  onNavigateToRAMJourney: () => void;
  onNavigateToCapacityBuilding: () => void;
}

const BeautifulTPAFLandingPage: React.FC<HomePageProps> = ({
  onNavigateToExplore,
  onNavigateToRAMJourney,
  onNavigateToCapacityBuilding
}) => {
  const [selectedPathway, setSelectedPathway] = useState<string>('');

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

          {/* Controls Container - Landing Page Version */}
          <div className="absolute left-1/2 bottom-2 sm:bottom-2 transform -translate-x-1/2 
            min-w-[500px] max-w-[100vw] w-auto  /* Container width controls */
            px-4 py-2"> 
            <div className="flex flex-row justify-center gap-3 bg-black bg-opacity-50 p-3 rounded-xl bg-black bg-opacity-70 backdrop-blur-sm">
              {/* Getting Started */}
              <div className="w-full sm:w-auto">
                <button 
                  onClick={() => {
                    document.getElementById('entry-points')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-10"
                >
                  <span>Getting Started</span>
                </button>
              </div>
              
              {/* About TPAF */}
              <div className="w-full sm:w-auto">
                <button 
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-10"
                >
                  <span>About TPAF</span>
                </button>
              </div>
              
              {/* Policy Dimensions */}
              <div className="w-full sm:w-auto">
                <select 
                  className="bg-transparent border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40"
                  onChange={(e) => {
                    if (e.target.value) {
                      document.getElementById('entry-points')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <option value="" className="text-gray-800">Policy Dimensions</option>
                  <option value="infrastructure" className="text-gray-800">Infrastructure</option>
                  <option value="legislation" className="text-gray-800">Legislation</option>
                  <option value="sustainability" className="text-gray-800">Sustainability</option>
                  <option value="economic" className="text-gray-800">Economic</option>
                  <option value="education" className="text-gray-800">Education</option>
                </select>
              </div>
              
              {/* Implementation Phases */}
              <div className="w-full sm:w-auto">
                <select 
                  className="bg-transparent border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-48"
                  onChange={(e) => {
                    if (e.target.value) {
                      document.getElementById('entry-points')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <option value="" className="text-gray-800">Implementation Phases</option>
                  <option value="analysis" className="text-gray-800">Analysis & Planning</option>
                  <option value="design" className="text-gray-800">Design & Strategy</option>
                  <option value="implementation" className="text-gray-800">Implementation</option>
                  <option value="monitoring" className="text-gray-800">Monitoring & Evaluation</option>
                </select>
              </div>
              
              {/* Explore Policies - Main CTA */}
              <div className="w-full sm:w-auto">
                <button 
                  onClick={onNavigateToExplore}
                  className="bg-white bg-opacity-20 border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 flex items-center justify-center gap-2 hover:bg-white hover:bg-opacity-30 font-medium"
                >
                  <span>Explore Policies</span>
                </button>
              </div>
              
              {/* Find Experts */}
              <div className="w-full sm:w-auto">
                <a
                  href="https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white rounded-lg px-3 py-2 text-white text-xs sm:text-sm w-full sm:w-40 text-center block hover:bg-white hover:bg-opacity-10"
                >
                  Find Experts
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Main Entry Points */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-800 mb-4">Choose Your Journey</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Different pathways for different needs and contexts
          </p>
        </div>

        <div id="entry-points" className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Entry Point 1: RAM-Based - Blue Theme */}
          <div className="group relative">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 overflow-hidden h-full hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:scale-105" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}>
              
              {/* Side Design with Blue Overlay */}
              <div className="absolute left-0 top-0 w-4 h-full overflow-hidden">
                <img 
                  src={sideDesign} 
                  alt="Side Design" 
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'hue-rotate(200deg) saturate(1.2) brightness(0.9)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#a8c6fa]/60 via-[#6a9ceb]/70 via-[#3a72c2]/80 to-[#20508e]/90 mix-blend-overlay"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 pl-20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#3a72c2] to-[#20508e] rounded-2xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-[#3a72c2]/25">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[#20508e] bg-[#a8c6fa]/30 px-2 py-1 rounded-full inline-block mb-2">
                      ASSESSMENT-BASED
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Explore Based on Your AI Readiness
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  Upload your completed Readiness Assessment or take a quick evaluation to get contextual policy guidance tailored to your AI governance gaps and strengths.
                </p>

                <div className="bg-gradient-to-r from-[#a8c6fa]/20 to-[#6a9ceb]/20 rounded-xl p-4 mb-6 border-l-4 border-[#3a72c2]">
                  <p className="text-sm text-gray-700 italic">
                    "I need assistance at every stage of policy development."
                  </p>
                </div>

                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3a72c2] rounded-full"></div>
                    <span>Countries with RAM results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#6a9ceb] rounded-full"></div>
                    <span>Capacity-specific guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#a8c6fa] rounded-full"></div>
                    <span>Targeted development needs</span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToRAMJourney}
                  className="w-full bg-gradient-to-r from-[#3a72c2] to-[#20508e] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-[#3a72c2]/25 transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:gap-4"
                >
                  Start with Assessment Results
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Entry Point 2: Open Exploration - Green Theme */}
          <div className="group relative">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 overflow-hidden h-full hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:scale-105" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}>
              
              {/* Side Design with Green Overlay */}
              <div className="absolute left-0 top-0 w-4 h-full overflow-hidden">
                <img 
                  src={sideDesign} 
                  alt="Side Design" 
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'hue-rotate(120deg) saturate(1.1) brightness(0.9)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#8fc9a8]/60 via-[#5eaa7f]/70 via-[#3a7d54]/80 to-[#255a34]/90 mix-blend-overlay"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 pl-20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#3a7d54] to-[#255a34] rounded-2xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-[#3a7d54]/25">
                    <Map className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[#255a34] bg-[#8fc9a8]/30 px-2 py-1 rounded-full inline-block mb-2">
                      SELF-GUIDED
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Explore & Save Policy Options
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  Discover AI policy options across all dimensions and phases. Browse, compare, and save relevant policies.
                </p>

                <div className="bg-gradient-to-r from-[#8fc9a8]/20 to-[#5eaa7f]/20 rounded-xl p-4 mb-6 border-l-4 border-[#3a7d54]">
                  <p className="text-sm text-gray-700 italic">
                    "I need help in certain key areas of AI governance."
                  </p>
                </div>

                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3a7d54] rounded-full"></div>
                    <span>Countries exploring options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#5eaa7f] rounded-full"></div>
                    <span>Building comprehensive strategies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#8fc9a8] rounded-full"></div>
                    <span>Learning from global approaches</span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToExplore}
                  className="w-full bg-gradient-to-r from-[#3a7d54] to-[#255a34] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-[#3a7d54]/25 transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:gap-4"
                >
                  Start Exploring Policies
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Entry Point 3: Capacity Building - Red Theme */}
          <div className="group relative">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 overflow-hidden h-full hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:scale-105" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}>
              
              {/* Side Design with Red Overlay */}
              <div className="absolute left-0 top-0 w-4 h-full overflow-hidden">
                <img 
                  src={sideDesign} 
                  alt="Side Design" 
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'hue-rotate(0deg) saturate(1.3) brightness(0.9)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#ffa3a3]/60 via-[#f87373]/70 via-[#e54e4e]/80 to-[#cf3535]/90 mix-blend-overlay"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 pl-20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#e54e4e] to-[#cf3535] rounded-2xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-[#e54e4e]/25">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[#cf3535] bg-[#ffa3a3]/30 px-2 py-1 rounded-full inline-block mb-2">
                      CAPACITY BUILDING
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Build Your Policy Design Capacity
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  Learn to design, implement, and monitor AI policies through guided frameworks and expert mentorship.
                </p>

                <div className="bg-gradient-to-r from-[#ffa3a3]/20 to-[#f87373]/20 rounded-xl p-4 mb-6 border-l-4 border-[#e54e4e]">
                  <p className="text-sm text-gray-700 italic">
                    "I want to find best practices and learn from experiences."
                  </p>
                </div>

                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#e54e4e] rounded-full"></div>
                    <span>Policy teams & officials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#f87373] rounded-full"></div>
                    <span>Researchers & academics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#ffa3a3] rounded-full"></div>
                    <span>Internal expertise development</span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToCapacityBuilding}
                  className="w-full bg-gradient-to-r from-[#e54e4e] to-[#cf3535] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-[#e54e4e]/25 transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:gap-4 relative"
                >
                  Start Learning Journey
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  
                  {/* <div className="absolute -top-2 -right-2 bg-[#fde6a8] text-[#efae42] text-xs font-bold px-2 py-1 rounded-lg border border-[#efae42]/20">
                    Soon
                  </div> */}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/5 border border-white/20 p-8 mb-16" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.05)' }}>
          <h3 className="text-2xl font-light text-gray-800 text-center mb-8">What You'll Get</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-3 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Policy Repository</h4>
              <p className="text-sm text-gray-600">73+ policy options across 5 dimensions and 4 implementation phases</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-3 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Design Your Own Policy Tool</h4>
              <p className="text-sm text-gray-600">Interactive frameworks to help you craft context-appropriate policies</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-3 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert Network</h4>
              <p className="text-sm text-gray-600">Connect with implementation specialists and peer governments</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-3 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Training & Mentorship</h4>
              <p className="text-sm text-gray-600">Build long-term capacity to design and monitor policies yourself</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulTPAFLandingPage;