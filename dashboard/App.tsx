
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Navbar } from './components/Navbar';
import { EnvironmentPage } from './pages/Environment';
import { ParticulatesPage } from './pages/Particulates';
import { AirQualityPage } from './pages/AirQuality';
import { UVRadiationPage } from './pages/UVRadiation';
import { WindPage } from './pages/Wind';
import { LoginPage } from './pages/LoginPage';
import { ForecastingPage } from './pages/Forecasting';
import { AlertsPage } from './pages/Alerts';
import { ReportsPage } from './pages/Reports';
import { UserProfileHeader } from './components/UserProfileHeader';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [displayName, setDisplayName] = useState('Tomin');
  const [avatarUrl, setAvatarUrl] = useState('https://picsum.photos/seed/user1/200');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme as 'dark' | 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });


  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderPage = () => {
    switch (route) {
      case '#/environment':
        return <EnvironmentPage />;
      case '#/particulates':
        return <ParticulatesPage />;
      case '#/air-quality':
        return <AirQualityPage />;
      case '#/uv-radiation':
        return <UVRadiationPage />;
      case '#/wind':
        return <WindPage />;
      case '#/forecasting':
        return <ForecastingPage />;
      case '#/alerts':
        return <AlertsPage />;
      case '#/reports':
        return <ReportsPage />;
      case '#/':
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
     switch (route) {
      case '#/environment': return 'Environment Details';
      case '#/particulates': return 'Particulate Matter Analysis';
      case '#/air-quality': return 'Air Quality Analysis';
      case '#/uv-radiation': return 'UV Radiation Levels';
      case '#/wind': return 'Wind & Anemometer Data';
      case '#/forecasting': return 'ML Forecasting Module';
      case '#/alerts': return 'System Alerts & Notifications';
      case '#/reports': return 'Reports & Data Export';
      case '#/':
      default: return 'Air Quality Prediction System';
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }


  return (
    <div className="min-h-screen dark:bg-[#050816] bg-gray-100 text-gray-800 dark:text-gray-200 font-sans antialiased flex relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(21,128,251,0.15),_transparent_40%)]"></div>
      <Navbar currentRoute={route} onExpandChange={setIsNavExpanded} onLogout={handleLogout} />
      <div className={`relative z-10 flex-grow transition-all duration-300 ${isNavExpanded ? 'pl-64' : 'pl-20 md:pl-24'}`}>
        <header className="py-6 px-4 md:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-cyan-300 dark:to-blue-500 tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Predictive insights and real-time analysis of air quality.</p>
          </div>
          <UserProfileHeader name={displayName} avatarUrl={avatarUrl} />
        </header>
        <main className="p-4 md:p-8">
          {renderPage()}
        </main>
        <footer className="text-center py-6 text-xs text-gray-500 border-t border-gray-200 dark:border-white/10">
          <p>System Status: <span className="text-green-600 dark:text-green-400 font-semibold">All systems operational.</span></p>
        </footer>
      </div>
    </div>
  );
}

export default App;
