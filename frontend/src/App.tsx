import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { TemplesPage } from './pages/TemplesPage.js';
import { TempleDetailPage } from './pages/TempleDetailPage.js';
import { ParkingPage } from './pages/ParkingPage.js';
import { AssistantPage } from './pages/AssistantPage.js';
import { PlannerPage } from './pages/PlannerPage.js';
import { SafetyPage } from './pages/SafetyPage.js';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage.js';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/temples" element={<TemplesPage />} />
            <Route path="/temples/:id" element={<TempleDetailPage />} />
            <Route path="/parking" element={<ParkingPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/authority" element={<AuthorityDashboardPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
