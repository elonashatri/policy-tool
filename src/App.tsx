// src/App.tsx
import React, { useState } from 'react';
import TPAFCircularVisualization from './components/TPAFCircularVisualization';
import HomePage from './components/HomePage';
import RAMResults from './components/RAMResults';
import CapacityBuilding from './components/CapacityBuilding';

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
          <RAMResults
            onNavigateToHome={navigateToHome}
            onNavigateToExplore={navigateToExplore}
          />
        );
      
      case 'capacity-building':
        return (
          <CapacityBuilding
            onNavigateToHome={navigateToHome}
            onNavigateToExplore={navigateToExplore}
          />
        );
      
      default:
        return (
          <HomePage 
            onNavigateToExplore={navigateToExplore} 
            onNavigateToRAMJourney={navigateToRAMJourney} 
            onNavigateToCapacityBuilding={navigateToCapacityBuilding} 
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;