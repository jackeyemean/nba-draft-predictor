import React, { useState, useEffect } from 'react';
import { FiGithub, FiMoon, FiSun } from 'react-icons/fi';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-300 dark:border-gray-600">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <a
            href="https://github.com/jackeyemean/nba-draft-predictor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiGithub className="w-5 h-5 mr-2" />
            <span>jackeyemean/nba-draft-predictor</span>
          </a>
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Toggle dark mode"
          >
            {dark
              ? <><FiSun className="w-5 h-5"/><span className="ml-2">Light Mode</span></>
              : <><FiMoon className="w-5 h-5"/><span className="ml-2">Dark Mode</span></>
            }
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        <ResultsPage />
      </main>
    </div>
  );
}
