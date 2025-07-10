// src/components/PlayerForm.js
import React, { useState, useEffect, useMemo } from 'react';
import { FEATURE_RANGES } from '../constants';

const LABELS = {
  Age:            'Age',
  Height:         'Height (ft & in)',
  Weight:         'Weight (lbs)',
  Wingspan:       'Wingspan (ft & in)',
  C_MPG:          'Minutes Per Game',
  FGA_per_game:   'Field Goal Attempts',
  '3PA_per_game': '3 Point Attempts',
  'FTA_per_game': 'Free Throw Attempts',
  'C_FG%':        'Field Goal %',
  'C_3P%':        '3 Point %',
  'C_FT%':        'Free Throw %',
  PTS_per_game:   'Points',
  AST_per_game:   'Assists',
  TOV_per_game:   'Turnovers',
  OffReb:         'Offensive Rebounds',
  DefReb:         'Defensive Rebounds',
  STL_per_game:   'Steals',
  BLK_per_game:   'Blocks',
  C_BPM:          'Box +/-'
};

const GROUPS = {
  Guards: [
    ['Context',         ['Age','Height','Wingspan','Weight','C_MPG','C_BPM']],
    ['Shooting Splits', ['C_FG%','C_3P%','C_FT%']],
    ['Per Game Averages',['PTS_per_game','AST_per_game','TOV_per_game','OffReb','DefReb','STL_per_game','BLK_per_game','FGA_per_game','3PA_per_game','FTA_per_game']]
  ],
  Wings: [
    ['Context',         ['Age','Height','Wingspan','Weight','C_MPG','C_BPM']],
    ['Shooting Splits', ['C_FG%','C_3P%','C_FT%']],
    ['Per Game Averages',['PTS_per_game','AST_per_game','TOV_per_game','OffReb','DefReb','STL_per_game','BLK_per_game','FGA_per_game','3PA_per_game','FTA_per_game']]
  ],
  Bigs: [
    ['Context',         ['Age','Height','Wingspan','Weight','C_MPG','C_BPM']],
    ['Shooting Splits', ['C_FG%','C_3P%','C_FT%']],
    ['Per Game Averages',['PTS_per_game','AST_per_game','TOV_per_game','OffReb','DefReb','STL_per_game','BLK_per_game','FGA_per_game','3PA_per_game','FTA_per_game']]
  ],
};

export default function PlayerForm({ onSubmit }) {
  const saved = JSON.parse(localStorage.getItem('playerForm')) || {};
  const initialPosition = FEATURE_RANGES[saved.position] ? saved.position : 'Guards';
  const [position, setPosition] = useState(initialPosition);
  const specs = FEATURE_RANGES[position];

  // raw inputs, including PTS_per_game
  const [inputs, setInputs] = useState(() => {
    if (saved.position === position && saved.inputs) return saved.inputs;
    return Object.fromEntries(
      Object.entries(specs).map(([k, cfg]) => [k, cfg.defaultValue])
    );
  });
  const [name, setName] = useState(saved.name || '');
  const [manualPTS, setManualPTS] = useState(false);

  // persist
  useEffect(() => {
    localStorage.setItem('playerForm', JSON.stringify({ position, inputs, name }));
  }, [position, inputs, name]);

  // reset inputs on position change
  useEffect(() => {
    setInputs(
      Object.fromEntries(
        Object.entries(specs).map(([k, cfg]) => [k, cfg.defaultValue])
      )
    );
    setManualPTS(false);
  }, [position, specs]);

  // compute dynamic metrics and respect manualPTS override for PTS
  const computed = useMemo(() => {
    const mpg = Math.max(inputs.C_MPG || 1, 1);
    const fga = inputs.FGA_per_game   || 0;
    const fta = inputs.FTA_per_game   || 0;
    const tpa = Math.min(inputs['3PA_per_game'] || 0, fga);
    const fgP = (inputs['C_FG%'] || 0)   / 100;
    const tpP = (inputs['C_3P%'] || 0)   / 100;
    const ftP = (inputs['C_FT%'] || 0)   / 100;
    const ast = inputs.AST_per_game      || 0;
    const tov = inputs.TOV_per_game      || 0;
    const orb = inputs.OffReb            || 0;
    const drb = inputs.DefReb            || 0;
    const stl = inputs.STL_per_game      || 0;
    const blk = inputs.BLK_per_game      || 0;

    const dynamicPTS = 2 * fgP * (fga - tpa)
                     + 3 * tpP * tpa
                     + ftP * fta;
    // choose PTS based on manual override
    const ppg = manualPTS
      ? inputs.PTS_per_game
      : dynamicPTS;

    const per40 = x => mpg ? (x / mpg) * 40 : 0;

    return {
      PTS_per_game: ppg,
      'C_PTS/40':  per40(ppg),
      'C_AST/40':  per40(ast),
      'C_TRB/40':  per40(orb + drb),
      'C_STL/40':  per40(stl),
      'C_BLK/40':  per40(blk),
      'C_AST_TO':  tov ? ast / tov             : 0,
      'C_ORB_DRB': drb ? orb / drb             : 0,
      'C_TS%':     (() => {
                      const denom = fga + 0.44 * fta;
                      return denom ? ppg / (2 * denom) : 0;
                   })(),
      'C_3P%':     tpP,
    };
  }, [inputs, manualPTS]);

  // whenever computed.PTS_per_game changes and not manual, sync into inputs
  useEffect(() => {
    if (!manualPTS) {
      setInputs(prev => ({ ...prev, PTS_per_game: Number(computed.PTS_per_game.toFixed(3)) }));
    }
  }, [computed.PTS_per_game, manualPTS]);

  const shootingKeys = [
    'FGA_per_game','3PA_per_game','FTA_per_game',
    'C_FG%','C_3P%','C_FT%'
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    const num = Number(value);

    // user moved PTS slider
    if (name === 'PTS_per_game') {
      setManualPTS(true);
      setInputs(prev => ({ ...prev, [name]: num }));
      return;
    }

    // any shooting slider resets manual override
    if (shootingKeys.includes(name)) {
      setManualPTS(false);
    }

    setInputs(prev => {
      const u = { ...prev };
      if (name === 'C_MPG') {
        u.C_MPG = Math.max(num, 1);
      } else if (name === 'FGA_per_game') {
        u.FGA_per_game = num;
        u['3PA_per_game'] = Math.min(prev['3PA_per_game'] || 0, num);
      } else if (name === '3PA_per_game') {
        const cap = prev.FGA_per_game || specs.FGA_per_game.defaultValue;
        u['3PA_per_game'] = Math.min(num, cap);
      } else {
        u[name] = num;
      }
      return u;
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(
      position,
      {
        ...computed,
        Age:       inputs.Age,
        Height:    inputs.Height,
        Weight:    inputs.Weight,
        Wingspan:  inputs.Wingspan,
        C_BPM:     inputs.C_BPM,
      },
      name.trim() || null
    );
  };

  // split into left/right sections
  const groupDef = GROUPS[position];
  const left  = groupDef.filter(([sec]) => sec !== 'Per Game Averages');
  const right = groupDef.filter(([sec]) => sec === 'Per Game Averages');

  // keys for live table
  const liveKeys = Object.keys(computed).filter(k => k !== 'PTS_per_game');

  const renderSlider = feature => {
    const cfg = specs[feature];
    const raw = inputs[feature] ?? cfg.defaultValue;
    const isDim = feature === 'Height' || feature === 'Wingspan';
    const step  = isDim ? 1 : 0.1;
    const min   = feature === 'C_MPG' ? 1 : cfg.min;
    const max   = feature === '3PA_per_game'
      ? inputs.FGA_per_game || cfg.max
      : cfg.max;
    const display = isDim
      ? `${Math.floor(raw/12)}′ ${raw % 12}″`
      : raw.toFixed(1);

    return (
      <div key={feature} className="flex flex-col">
        <label htmlFor={feature} className="text-sm font-medium mb-1 whitespace-pre">
          {LABELS[feature]}: {display}
        </label>
        <input
          id={feature}
          name={feature}
          type="range"
          min={min}
          max={max}
          step={step}
          value={raw}
          onChange={handleChange}
          className="w-full"
        />
      </div>
    );
  };

  return (
    <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-lg text-gray-900 dark:text-gray-100 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Position */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Prospect Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0"
              placeholder="Optional"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Position Group</label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0"
              value={position}
              onChange={e => setPosition(e.target.value)}
            >
              <option>Guards</option>
              <option>Wings</option>
              <option>Bigs</option>
            </select>
          </div>
        </div>

        {/* Live Per 40 Minutes */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
            Per 40 Minutes
          </label>
          <div className="bg-bg-light dark:bg-bg-dark border border-gray-300 dark:border-gray-600 rounded px-2 py-1 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-surface-light dark:bg-surface-dark">
              <tr>
                {liveKeys.map(k => (
                  <th
                    key={k}
                    className="px-2 py-1 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 text-left"
                  >
                    {({
                       'C_PTS/40': 'Points',
                       'C_AST/40': 'Assists',
                       'C_TRB/40': 'Rebounds',
                       'C_STL/40': 'Steals',
                       'C_BLK/40': 'Blocks',
                       'C_AST_TO': 'Assists / Turnovers',
                       'C_ORB_DRB':'Off/Def Rebounds',
                       'C_TS%':    'True Shooting %',
                       'C_3P%':    '3 Point %'
                    }[k] || k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr className="bg-bg-light dark:bg-bg-dark">
                {liveKeys.map(k => (
                  <td
                    key={k}
                    className="px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {(['C_TS%','C_3P%','C_AST_TO','C_ORB_DRB'].includes(k)
                      ? computed[k].toFixed(3)
                      : computed[k].toFixed(1)
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {left.map(([section, fields]) => (
              <div key={section}>
                <h3 className="text-base font-semibold mb-2">{section}</h3>
                <div className="space-y-4">
                  {fields.filter(f => f in specs).map(renderSlider)}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {right.map(([section, fields]) => (
              <div key={section}>
                <h3 className="text-base font-semibold mb-2">{section}</h3>
                <div className="space-y-4">
                  {fields.filter(f => f in specs).map(renderSlider)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-accent text-white dark:bg-accent-dark dark:text-gray-100 font-semibold rounded py-2 w-full"
        >
          PREDICT NBA CAREER
        </button>
      </form>
    </div>
  );
}
