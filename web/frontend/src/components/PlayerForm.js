import React, { useState, useEffect } from 'react';
import { FEATURE_RANGES } from '../constants';

const LABELS = {
  'Age':            'Age',
  'Height':         'Height (ft & in)',
  'Weight':         'Weight (lbs)',
  'Wingspan':       'Wingspan (ft & in)',
  'C_3P%':          '3P%',

  'C_BPM':          'BPM',
  'C_AST_TO':       'AST/TOV',
  'C_ORB_DRB':      'ORB/DRB',

  'C_3P%':          '3P%',
  'C_TS%':          'TS%',

  'C_PTS/40':       'PTS/40',
  'C_AST/40':       'AST/40',
  'C_TRB/40':       'TRB/40',
  'C_STL/40':       'STL/40',
  'C_BLK/40':       'BLK/40'
};

const GROUPS = {
  'Guards': [
    ['Info',     ['Age', 'Height', 'Wingspan', 'Weight']],
    ['Advanced', ['C_BPM', 'C_AST_TO']],
    ['Shooting', ['C_3P%', 'C_TS%']],
    ['Per Game', ['C_PTS/40', 'C_AST/40', 'C_TRB/40', 'C_STL/40', 'C_BLK/40']]
  ],
  'Wings': [
    ['Info',     ['Age', 'Height', 'Wingspan', 'Weight']],
    ['Advanced', ['C_BPM', 'C_AST_TO']],
    ['Shooting', ['C_3P%', 'C_TS%']],
    ['Per Game', ['C_PTS/40', 'C_AST/40', 'C_TRB/40', 'C_STL/40', 'C_BLK/40']]
  ],
  'Bigs': [
    ['Info',     ['Age', 'Height', 'Wingspan', 'Weight']],
    ['Advanced', ['C_BPM', 'C_ORB_DRB']],
    ['Shooting', ['C_3P%', 'C_TS%']],
    ['Per Game', ['C_PTS/40', 'C_AST/40', 'C_TRB/40', 'C_STL/40', 'C_BLK/40']]
  ]
};

export default function PlayerForm({ onSubmit }) {
  const [name, setName]         = useState('');
  const [position, setPosition] = useState('Guards');
  const specs                   = FEATURE_RANGES[position];

  const [inputs, setInputs] = useState({});
  useEffect(() => {
    const init = {};
    Object.entries(specs).forEach(([k, cfg]) => init[k] = cfg.defaultValue);
    setInputs(init);
  }, [position, specs]);

  const handleChange = e => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    // ─── Minimal mapping layer ────────────────────────────────
    const payload = {};
    Object.entries(inputs).forEach(([key, val]) => {
      switch (key) {
        case 'TS%':     payload['C_TS%']   = val; break;
        case '3P%':     payload['C_3P%']   = val; break;
        case 'AST/TO':  payload['C_AST_TO']= val; break;
        case 'ORB/DRB': payload['C_ORB_DRB']= val; break;
        case 'BPM':     payload['C_BPM']   = val; break;
        case 'PTS/40':  payload['C_PTS/40'] = val; break;
        case 'AST/40':  payload['C_AST/40'] = val; break;
        case 'REB/40':  payload['C_TRB/40'] = val; break;
        case 'STL/40':  payload['C_STL/40'] = val; break;
        case 'BLK/40':  payload['C_BLK/40'] = val; break;
        default:        payload[key]        = val;
      }
    });
    // ────────────────────────────────────────────────────────────

    onSubmit(position, payload, name.trim() || null);
    setName('');
  };

  const renderSlider = feature => {
    const cfg = specs[feature];
    const raw = inputs[feature] ?? cfg.defaultValue;

    const isDim = feature === 'Height' || feature === 'Wingspan';
    const step  = isDim ? 1   // 1" for Height/Wingspan
                      : 0.1; // 0.1 for everything else

    const display = isDim
      ? `${Math.floor(raw/12)}′ ${raw % 12}″`
      : raw.toFixed(1);

    return (
      <div key={feature} className="flex flex-col mb-4">
        <label htmlFor={feature} className="font-medium mb-1" title={LABELS[feature]}>
          {LABELS[feature]}: {display}
        </label>
        <input
          id={feature}
          name={feature}
          type="range"
          min={cfg.min}
          max={cfg.max}
          step={step}
          value={raw}
          onChange={handleChange}
          className="w-full"
        />
      </div>
    );
  };

  const allSections = GROUPS[position];
  const LEFT_KEYS   = ['Info','Advanced'];
  const left        = allSections.filter(([sec]) => LEFT_KEYS.includes(sec));
  const right       = allSections.filter(([sec]) => !LEFT_KEYS.includes(sec));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name & Position */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Prospect Name</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Optional"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Position Group</label>
          <select
            className="border p-2 rounded w-full"
            value={position}
            onChange={e => setPosition(e.target.value)}
          >
            <option>Guards</option>
            <option>Wings</option>
            <option>Bigs</option>
          </select>
        </div>
      </div>

      {/* Two-column vertical stacks */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          {left.map(([section, fields]) => (
            <section key={section} className="space-y-2 mb-6">
              <h3 className="font-semibold">{section}</h3>
              <div className="flex flex-col">
                {fields.filter(f => f in specs).map(renderSlider)}
              </div>
            </section>
          ))}
        </div>
        <div>
          {right.map(([section, fields]) => (
            <section key={section} className="space-y-2 mb-6">
              <h3 className="font-semibold">{section}</h3>
              <div className="flex flex-col">
                {fields.filter(f => f in specs).map(renderSlider)}
              </div>
            </section>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-accent px-4 py-2">
        Create Player
      </button>
    </form>
  );
}
