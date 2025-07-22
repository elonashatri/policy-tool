// src/App.tsx
import React, { useState } from 'react';
import TPAFCircularVisualization from './components/TPAFCircularVisualization';
import HomePage from './components/HomePage';

// Define the possible views/routes
type AppView = 'home' | 'explore' | 'ram-journey' | 'capacity-building';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Navigation functions that will be passed to components
  const navigateToHome = () => setCurrentView('home');
  const navigateToExplore = () => setCurrentView('explore');
  const navigateToRAMJourney = () => setCurrentView('ram-journey');
  const navigateToCapacityBuilding = () => setCurrentView('capacity-building');

  // Render the appropriate component based on current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onNavigateToExplore={navigateToExplore}
            onNavigateToRAMJourney={navigateToRAMJourney}
            onNavigateToCapacityBuilding={navigateToCapacityBuilding}
          />
        );
      
      case 'explore':
        return (
          <TPAFCircularVisualization
            onNavigateToHome={navigateToHome}
          />
        );
      
      case 'ram-journey':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">📊</span>
              </div>
              <h1 className="text-3xl font-light text-gray-800 mb-4">RAM-Based Journey</h1>
              <p className="text-lg text-gray-600 mb-8">
                This feature is coming soon! Upload your Readiness Assessment results to get 
                personalized policy recommendations based on your country's specific context and gaps.
              </p>
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="font-semibold text-gray-800 mb-2">What you'll get:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Gap-specific policy recommendations</li>
                    <li>• Implementation guidance based on your capacity</li>
                    <li>• Similar countries' experiences and lessons learned</li>
                    <li>• Phased roadmap for AI governance development</li>
                  </ul>
                </div>
                <button
                  onClick={navigateToHome}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'capacity-building':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">🎓</span>
              </div>
              <h1 className="text-3xl font-light text-gray-800 mb-4">Capacity Building</h1>
              <p className="text-lg text-gray-600 mb-8">
                Our comprehensive training and mentorship programs are under development. 
                Learn to design, implement, and monitor AI policies with expert guidance.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="font-semibold text-gray-800 mb-2">🎯 Design Your Own Policy</h3>
                  <p className="text-sm text-gray-600">Interactive white-glove service with expert co-creation</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="font-semibold text-gray-800 mb-2">⚙️ Implementation Support</h3>
                  <p className="text-sm text-gray-600">Hands-on assistance to operationalize policies</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="font-semibold text-gray-800 mb-2">📊 Monitoring & Evaluation</h3>
                  <p className="text-sm text-gray-600">Tools and training for tracking effectiveness</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="font-semibold text-gray-800 mb-2">🏗️ Build Internal Capacity</h3>
                  <p className="text-sm text-gray-600">Comprehensive training for long-term capability</p>
                </div>
              </div>
              <button
                onClick={navigateToHome}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        );
      
      default:
        return <HomePage onNavigateToExplore={navigateToExplore} onNavigateToRAMJourney={navigateToRAMJourney} onNavigateToCapacityBuilding={navigateToCapacityBuilding} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;