// App.js
import React from 'react';
import { FiGithub } from 'react-icons/fi';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold text-gray-800">NBA Draft Predictor</h1>
          <a
            href="https://github.com/jackeyemean/nba-draft-predictor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiGithub className="w-5 h-5 mr-2" />
            <span>jackeyemean/nba-draft-predictor</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <ResultsPage />
      </main>
    </div>
  );
}
