import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/navigation';
import { Dashboard } from '@/pages/dashboard';
import { Leaderboard } from '@/pages/leaderboard';
import { UserProfile } from '@/pages/user-profile';
import { About } from '@/pages/about';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="twitter-tracker-theme">
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;