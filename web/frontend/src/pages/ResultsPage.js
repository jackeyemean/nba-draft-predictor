// ResultsPage.js
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

  useEffect(() => {
    fetchAllResults()
      .then(res => setHistData(res.data || []))
      .catch(console.error);
  }, []);

  const handleCreate = async (code, inputs, name) => {
    try {
      const { data } = await predict({ ...inputs, 'Position Group': code });
      const pred = data['Predicted Score'];
      const group =
        code === 'Guards' ? 'Guard' :
        code === 'Wings'  ? 'Wing'  : 'Big';
      const finalName = name || `Player ${customPlayers.length + 1}`;
      const newP = {
        Name: finalName,
        'Draft Year': 2025,
        'Pick Number': '—',
        'Position Group': group,
        'Predicted Score': pred
      };
      setCustomPlayers(prev => [newP, ...prev]);
      setHighlightName(finalName);
      setFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Prediction failed');
    }
  };

  const combined = useMemo(
    () => [...customPlayers, ...histData],
    [customPlayers, histData]
  );

  const [yearFilter, setYearFilter]   = useState('2025');
  const [groupFilter, setGroupFilter] = useState('All');

  const years  = useMemo(
    () => [...new Set(histData.map(d => d['Draft Year']))]
          .sort((a, b) => b - a)
          .map(String),
    [histData]
  );
  const groups = useMemo(
    () => [...new Set(histData.map(d => d['Position Group']))].sort(),
    [histData]
  );

  const filtered = useMemo(
    () => combined.filter(d => {
      const isCustom = customPlayers.some(p => p.Name === d.Name);
      const yearOK   = isCustom
        || yearFilter === 'All'
        || String(d['Draft Year']) === yearFilter;
      const groupOK  = groupFilter === 'All'
        || d['Position Group'] === groupFilter;
      return yearOK && groupOK;
    }),
    [combined, customPlayers, yearFilter, groupFilter]
  );

  useEffect(() => {
    if (!highlightName || !tableRef.current) return;
    const row = tableRef.current.querySelector(
      `tr[data-name="${highlightName}"]`
    );
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightName]);

  return (
    <div className="space-y-6">
      {/* Create New Player */}
      <section className="bg-white rounded shadow-sm">
        <div
          onClick={() => setFormOpen(o => !o)}
          className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800">Create New Player</h2>
          <span className="text-2xl text-gray-600">{formOpen ? '▲' : '▼'}</span>
        </div>
        {formOpen && (
          <div className="p-6 bg-gray-50 rounded-b-lg">
            <PlayerForm onSubmit={handleCreate} />
          </div>
        )}
      </section>

      {/* Results (filters + table) */}
      <section className="bg-white rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Results</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Draft Year</label>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="border p-2 rounded bg-white"
            >
              <option>All</option>
              {years.map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Position</label>
            <select
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              className="border p-2 rounded bg-white"
            >
              <option>All</option>
              {groups.map(g => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div
          ref={tableRef}
          className="overflow-y-auto max-h-[60vh]"
        >
          <ResultsTable
            data={filtered}
            highlightNames={customPlayers.map(p => p.Name)}
          />
        </div>
      </section>
    </div>
  );
}
