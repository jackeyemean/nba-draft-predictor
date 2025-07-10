import React, { useEffect, useState, useMemo, useRef } from 'react';
import { fetchAllResults, predict } from '../api';
import PlayerForm from '../components/PlayerForm';
import ResultsTable from '../components/ResultsTable';

export default function ResultsPage() {
  const [histData, setHistData]           = useState([]);
  const [customPlayers, setCustomPlayers] = useState([]);
  const [formOpen, setFormOpen]           = useState(false);
  const [highlightName, setHighlightName] = useState(null);
  const tableRef = useRef(null);

  const combined = useMemo(() => [...customPlayers, ...histData], [customPlayers, histData]);
  const [yearFilter, setYearFilter]   = useState('2025');
  const [groupFilter, setGroupFilter] = useState('All');

  const years  = useMemo(() =>
    [...new Set(histData.map(d => d['Draft Year']))].sort((a,b)=>b-a).map(String),
    [histData]
  );
  const groups = useMemo(() =>
    [...new Set(histData.map(d => d['Position Group']))].sort(),
    [histData]
  );
  const filtered = useMemo(() =>
    combined.filter(d => {
      const isCustom = customPlayers.some(p=>p.Name===d.Name);
      const yearOK   = isCustom || yearFilter==='All' || String(d['Draft Year'])===yearFilter;
      const groupOK  = groupFilter==='All' || d['Position Group']===groupFilter;
      return yearOK && groupOK;
    }),
    [combined, customPlayers, yearFilter, groupFilter]
  );

  useEffect(() => {
    fetchAllResults()
      .then(res => setHistData(res.data || []))
      .catch(console.error);
  }, []);

  const handleCreate = async (code, inputs, name) => {
    try {
      const { data } = await predict({ ...inputs, 'Position Group': code });
      const pred = data['Predicted Score'];
      const group = code === 'Guards' ? 'Guard'
                  : code === 'Wings'  ? 'Wing'  : 'Big';
      const finalName = name || `Player ${customPlayers.length + 1}`;
      const newP = {
        Name: finalName,
        'Draft Year': 2025,
        'Pick Number': '—',
        'Position Group': group,
        'Predicted Score': pred
      };
      setCustomPlayers(prev => [newP, ...prev]);
      // reset filters so new player is visible
      setYearFilter('All');
      setGroupFilter('All');
      setHighlightName(finalName);
      setFormOpen(false);
    } catch {
      alert('Prediction failed');
    }
  };

  useEffect(() => {
    if (!highlightName) return;
    const row = tableRef.current?.querySelector(`tr[data-name="${highlightName}"]`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightName]);

  return (
    <div className="space-y-6">
      {/* Generate Prospect */}
      <section className="bg-surface-light dark:bg-surface-dark rounded shadow-sm mt-6">
        <div
          onClick={() => setFormOpen(o=>!o)}
          className="flex items-center p-4 border-b border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-bg-light dark:hover:bg-bg-dark"
        >
          <span className="text-2xl text-gray-900 dark:text-gray-100 mr-2">
            {formOpen ? '▲' : '▼'}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Generate College Prospect
          </h2>
        </div>
        {formOpen && (
          <div className="p-6">
            <PlayerForm onSubmit={handleCreate} />
          </div>
        )}
      </section>

      {/* Results */}
      <section className="bg-surface-light dark:bg-surface-dark rounded shadow-sm p-6 border border-gray-300 dark:border-gray-600 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Results</h2>
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-gray-900 dark:text-gray-100 mb-1">Draft Year</label>
            <select
              value={yearFilter}
              onChange={e=>setYearFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0"
            >
              <option>All</option>{years.map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-900 dark:text-gray-100 mb-1">Position</label>
            <select
              value={groupFilter}
              onChange={e=>setGroupFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0"
            >
              <option>All</option>{groups.map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div ref={tableRef} className="overflow-y-auto max-h-[60vh]">
          <ResultsTable data={filtered} highlightNames={customPlayers.map(p=>p.Name)} />
        </div>
      </section>
    </div>
  );
}
