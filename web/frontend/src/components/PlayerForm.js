// PlayerForm.js

import React, { useState, useEffect, useMemo } from 'react';
import { FEATURE_RANGES } from '../constants';

const LABELS = {
  Age:            'Age',
  Height:         'Height   (ft & in)',
  Weight:         'Weight       (lbs)',
  Wingspan:       'Wingspan (ft & in)',
  C_MPG:          'MPG',
  FGA_per_game:   'FGA',
  '3PA_per_game': '3PA',
  'FTA_per_game': 'FTA',
  'C_FG%':        'FG%',
  'C_3P%':        '3P%',
  'C_FT%':        'FT%',
  PTS_per_game:   'PTS', 
  AST_per_game:   'AST',
  TOV_per_game:   'TOV',
  OffReb:         'ORB',
  DefReb:         'DRB',
  STL_per_game:   'STL',
  BLK_per_game:   'BLK',
  C_BPM:          'BPM'
};
const TOOLTIPS = {
  Age:            'Player age in years',
  Height:         'Height measured in feet & inches',
  Weight:         'Weight measured in pounds',
  Wingspan:       'Wingspan measured in feet & inches',
  C_MPG:          'Average minutes played per game',
  FGA_per_game:   'Field goal attempts per game',
  '3PA_per_game': 'Three-point attempts per game',
  'FTA_per_game': 'Free throw attempts per game',
  'C_FG%':        'Field goal percentage',
  'C_3P%':        'Three-point percentage',
  'C_FT%':        'Free throw percentage',
  PTS_per_game:   'Points per game',
  AST_per_game:   'Assists per game',
  TOV_per_game:   'Turnovers per game',
  OffReb:         'Offensive rebounds per game',
  DefReb:         'Defensive rebounds per game',
  STL_per_game:   'Steals per game',
  BLK_per_game:   'Blocks per game',
  C_BPM:          'Box Plus/Minus metric'
};

const GROUPS = {
  Guards: [
    ['Context',           ['Age','Height','Wingspan','Weight','C_MPG','C_BPM']],
    ['Shooting Splits',   ['C_FG%','C_3P%','C_FT%']],
    ['Per Game Averages', ['PTS_per_game', 'AST_per_game','TOV_per_game','OffReb','DefReb','STL_per_game','BLK_per_game','FGA_per_game','3PA_per_game','FTA_per_game']]
  ],
  Wings: [
    ['Context',           ['Age','Height','Wingspan','Weight','C_MPG','C_BPM']],
    ['Shooting Splits',   ['C_FG%','C_3P%','C_FT%']],
    ['Per Game Averages', ['PTS_per_game', 'AST_per_game','TOV_per_game','OffReb','DefReb','STL_per_game','BLK_per_game','FGA_per_game','3PA_per_game','FTA_per_game']]
  ],
  Bigs: [
    ['Context',           ['Age','Height','Wingspan','Weight','C_MPG','C_BPM']],
    ['Shooting Splits',   ['C_FG%','C_3P%','C_FT%']],
    ['Per Game Averages', ['PTS_per_game', 'AST_per_game','TOV_per_game','OffReb','DefReb','STL_per_game','BLK_per_game','FGA_per_game','3PA_per_game','FTA_per_game']]
  ]
};

export default function PlayerForm({ onSubmit }) {
  // load last‐used form state
  const saved = JSON.parse(localStorage.getItem('playerForm')) || {};

  const [position, setPosition] = useState(saved.position || 'Guards');
  const specs = FEATURE_RANGES[position];

  // inputs state: either saved for this position, or fresh defaults
  const [inputs, setInputs] = useState(() => {
    if (saved.position === position && saved.inputs) {
      return saved.inputs;
    }
    return Object.fromEntries(
      Object.entries(specs).map(([k, cfg]) => [k, cfg.defaultValue])
    );
  });

  const [name, setName] = useState(saved.name || '');

  const [overridePPG, setOverridePPG] = useState(false);

  // whenever position or its specs change, re‐init sliders if no saved state
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('playerForm')) || {};
    if (stored.position === position && stored.inputs) {
      setInputs(stored.inputs);
    } else {
      setInputs(
        Object.fromEntries(
          Object.entries(specs).map(([k, cfg]) => [k, cfg.defaultValue])
        )
      );
    }
  }, [position, specs]);

  // persist on every change
  useEffect(() => {
    localStorage.setItem(
      'playerForm',
      JSON.stringify({ position, inputs, name })
    );
  }, [position, inputs, name]);

  // compute per-40s, ratios, TS%, etc.
  const computed = useMemo(() => {
    const mpg = Math.max(inputs.C_MPG || 1, 1);
    const fga = inputs.FGA_per_game || 0;
    const fta = inputs.FTA_per_game   || 0;
    const tpa = Math.min(inputs['3PA_per_game'] || 0, fga);
    const fgP = Number(((inputs['C_FG%'] || 0) / 100).toFixed(3));
    const tpP = Number(((inputs['C_3P%'] || 0) / 100).toFixed(3));
    const ftP = Number(((inputs['C_FT%'] || 0) / 100).toFixed(3));
    const ast = inputs.AST_per_game   || 0;
    const tov = inputs.TOV_per_game   || 0;
    const orb = inputs.OffReb         || 0;
    const drb = inputs.DefReb         || 0;
    const stl = inputs.STL_per_game   || 0;
    const blk = inputs.BLK_per_game   || 0;

    // dynamic ppg calculation
    const twoPA = fga - tpa;
    const dynamicPPG = 2 * fgP * twoPA + 3 * tpP * tpa + ftP * fta;
    const ppg = overridePPG
      ? inputs.PTS_per_game        // use user value
      : dynamicPPG;               // or auto-calc

    const per40 = x => mpg ? (x/mpg)*40 : 0;

    return {
      'PTS_per_game': Number(ppg.toFixed(3)),
      'C_PTS/40':  per40(ppg),
      'C_AST/40':  per40(ast),
      'C_TRB/40':  per40(orb + drb),
      'C_STL/40':  per40(stl),
      'C_BLK/40':  per40(blk),
      'C_AST_TO':  tov ? Number((ast / tov).toFixed(3)) : 0,
      'C_ORB_DRB': drb ? Number((orb / drb).toFixed(3)) : 0,
      'C_TS%': (() => {
        const denom = fga + 0.44 * fta;
        return denom ? Number(((ppg / (2 * denom))).toFixed(3)) : 0;
      })(),

      'C_3P%': tpP,
    };
  }, [inputs, overridePPG]);

  // handle slider changes, with clamping logic
  const handleChange = e => {
    const { name, value } = e.target;
    const num = Number(value);

    setInputs(prev => {
      const u = { ...prev };

      if (name === 'C_MPG') {
        u.C_MPG = Math.max(num, 1);
      } else if (name === 'FGA_per_game') {
        u.FGA_per_game = num;
        u['3PA_per_game'] = Math.min(prev['3PA_per_game']||0, num);
      } else if (name === '3PA_per_game') {
        const cap = prev.FGA_per_game ?? specs.FGA_per_game.defaultValue;
        u['3PA_per_game'] = Math.min(num, cap);
      } else {
        u[name] = num;
      }

      return u;
    });
  };

  // submit
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(position, {
      ...computed,
      Age:      inputs.Age,
      Height:   inputs.Height,
      Weight:   inputs.Weight,
      Wingspan: inputs.Wingspan,
      C_BPM:    inputs.C_BPM,
      'Position Group': position
    }, name.trim() || null);
  };

  // render
  const renderSlider = feature => {
    const cfg = specs[feature];
   const raw = feature === 'PTS_per_game'
     ? computed.PTS_per_game
     : inputs[feature] ?? cfg.defaultValue;
    const isDim = feature === 'Height' || feature === 'Wingspan';
    const step  = isDim ? 1 : 0.1;
    const min   = feature === 'C_MPG'
                  ? 1
                  : cfg.min;
    const max   = feature === '3PA_per_game'
                  ? (inputs.FGA_per_game ?? cfg.max)
                  : cfg.max;
    const display = isDim
      ? `${Math.floor(raw/12)}′ ${raw % 12}″`
      : raw.toFixed(1);

    return (
      <div key={feature} className="flex flex-col">
        <label
          htmlFor={feature}
          className="text-sm font-medium mb-1 whitespace-pre"
          title={TOOLTIPS[feature] || ''}
        >
          {LABELS[feature]}: {display}
        </label>
        <input
          id={feature}
          name={feature}
          type="range"
          min={min}
          max={max}
          step={step}
          value={
            feature === 'PTS_per_game'
              // PTS slider: either computed or user value
              ? (overridePPG 
                  ? inputs.PTS_per_game 
                  : computed.PTS_per_game)
              // all the others: raw from inputs
              : raw
          }
          onChange={
            feature === 'PTS_per_game'
              // only let handleChange fire if overridePPG is true
              ? (overridePPG ? handleChange : undefined)
              // others always use handleChange
              : handleChange
          }
          disabled={feature === 'PTS_per_game' && !overridePPG}
          title={TOOLTIPS[feature] || ''}
          className="w-full"
        />
      </div>
    );
  };

  const left  = GROUPS[position]
                  .filter(([s]) => ['Context', 'Shooting Splits'].includes(s));
  const right = GROUPS[position]
                  .filter(([s]) => ['Per Game Averages'].includes(s));
 const liveKeys = Object.entries(computed)
                    // only show truly “live” stats, hide PTS_per_game
                    .filter(([k, v]) => Number.isFinite(v) && k !== 'PTS_per_game')
                    .map(([k]) => k);

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Prospect Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Optional"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Position Group
            </label>
            <select
              className="w-full p-2 border rounded"
              value={position}
              onChange={e => setPosition(e.target.value)}
            >
              <option>Guards</option>
              <option>Wings</option>
              <option>Bigs</option>
            </select>
          </div>
        </div>

        {/* Live Stats */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {liveKeys.map(k => (
                  <th key={k}
                      className="px-2 py-1 text-xs text-gray-500 uppercase text-left">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 odd:bg-gray-50">
              <tr>
                {liveKeys.map(k => (
                  <td key={k}
                      className="px-2 py-1 text-sm text-gray-700 text-left">
                    {['C_TS%', 'C_3P%', 'C_AST_TO', 'C_ORB_DRB'].includes(k)
                      ? computed[k].toFixed(3)
                      : computed[k].toFixed(1)
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* PPG Override Toggle */}
        <div className="flex items-center space-x-2">
          <input 
            id="overridePPG" 
            type="checkbox" 
            checked={overridePPG} 
            onChange={e => setOverridePPG(e.target.checked)} 
            className="h-4 w-4"
          />
          <label htmlFor="overridePPG" className="text-sm">
            Disable PPG Calculation
          </label>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-6">

          <div className="space-y-4">
            {left.map(([sec, fields], idx) => (
              <div
                key={sec}
                className={`space-y-4 ${sec === 'Context' ? 'mb-8' : ''}`} // Add extra margin after Context
              >
                <h3 className="text-base font-semibold">{sec}</h3>
                <div className="space-y-4">
                  {fields.filter(f => f in specs).map(renderSlider)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {right.map(([sec, fields]) => (
              <div key={sec} className="space-y-4">
                <h3 className="text-base font-semibold">{sec}</h3>
                <div className="space-y-4">
                  {fields.filter(f => f in specs).map(renderSlider)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit"
                className="btn-accent w-full py-2 font-semibold rounded">
          Create Player
        </button>
      </form>
    </div>
  );
}
