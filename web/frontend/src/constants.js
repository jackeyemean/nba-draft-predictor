// constants.js

export const FEATURE_RANGES = {
  Guards: {
    Age:            { min: 18, max: 23, defaultValue: 20 },
    Height:         { min: 72, max: 80, defaultValue: 76 },   // 6'0"–6'8"
    Weight:         { min: 160, max: 230, defaultValue: 190 },// lbs
    Wingspan:       { min: 72, max: 84, defaultValue: 78 },   // inches
    C_MPG:          { min: 5,  max: 36, defaultValue: 30  },  // minutes
    FGA_per_game:   { min: 2,  max: 20, defaultValue: 10  },
    '3PA_per_game': { min: 0,  max: 8,  defaultValue: 3   },
    'FTA_per_game': { min: 0,  max: 8,  defaultValue: 3   },
    'C_FG%':        { min: 30, max: 60, defaultValue: 44  },
    'C_3P%':        { min: 25, max: 45, defaultValue: 35  },
    'C_FT%':        { min: 60, max: 90, defaultValue: 75  },
    PTS_per_game:   { min: 0,  max: 40, defaultValue: 15   },
    AST_per_game:   { min: 0,  max: 10, defaultValue: 4   },
    TOV_per_game:   { min: 0,  max: 5,  defaultValue: 2   },
    OffReb:         { min: 0,  max: 3,  defaultValue: 1   },
    DefReb:         { min: 0,  max: 6,  defaultValue: 3   },
    STL_per_game:   { min: 0,  max: 3,  defaultValue: 1   },
    BLK_per_game:   { min: 0,  max: 2,  defaultValue: 0.3 },
    C_BPM:          { min: -10, max: 20,  defaultValue: 5 }
  },

  Wings: {
    Age:            { min: 18, max: 24, defaultValue: 21 },
    Height:         { min: 75, max: 82, defaultValue: 80 },   // 6'3"–6'10"
    Weight:         { min: 180, max: 250, defaultValue: 215 },
    Wingspan:       { min: 78, max: 88, defaultValue: 82 },
    C_MPG:          { min: 8,  max: 36, defaultValue: 28  },
    FGA_per_game:   { min: 3,  max: 18, defaultValue: 8   },
    '3PA_per_game': { min: 0,  max: 6,  defaultValue: 2   },
    'FTA_per_game': { min: 0,  max: 6,  defaultValue: 2   },
    'C_FG%':        { min: 35, max: 60, defaultValue: 46  },
    'C_3P%':        { min: 25, max: 45, defaultValue: 35  },
    'C_FT%':        { min: 60, max: 90, defaultValue: 75  },
    PTS_per_game:   { min: 0,  max: 40, defaultValue: 15   },
    AST_per_game:   { min: 0,  max: 5,  defaultValue: 2   },
    TOV_per_game:   { min: 0,  max: 4,  defaultValue: 1.5 },
    OffReb:         { min: 0,  max: 4,  defaultValue: 1   },
    DefReb:         { min: 0,  max: 8,  defaultValue: 4   },
    STL_per_game:   { min: 0,  max: 3,  defaultValue: 1   },
    BLK_per_game:   { min: 0,  max: 2,  defaultValue: 0.5 },
    C_BPM:          { min: -10, max: 20,  defaultValue: 5 }
  },

  Bigs: {
    Age:            { min: 18, max: 25, defaultValue: 22 },
    Height:         { min: 80, max: 90, defaultValue: 84 },   // 6'8"–7'6"
    Weight:         { min: 200, max: 300, defaultValue: 240 },
    Wingspan:       { min: 82, max: 96, defaultValue: 88 },
    C_MPG:          { min: 8,  max: 34, defaultValue: 26  },
    FGA_per_game:   { min: 1,  max: 15, defaultValue: 6   },
    '3PA_per_game': { min: 0,  max: 5,  defaultValue: 0   },
    'FTA_per_game': { min: 0,  max: 8,  defaultValue: 3   },
    'C_FG%':        { min: 45, max: 70, defaultValue: 55  },
    'C_3P%':        { min: 0,  max: 40, defaultValue: 20  },
    'C_FT%':        { min: 50, max: 90, defaultValue: 70  },
    PTS_per_game:   { min: 0,  max: 40, defaultValue: 15   },
    AST_per_game:   { min: 0,  max: 4,  defaultValue: 1   },
    TOV_per_game:   { min: 0,  max: 4,  defaultValue: 1.5 },
    OffReb:         { min: 0,  max: 8,  defaultValue: 3   },
    DefReb:         { min: 5,  max: 15, defaultValue: 8   },
    STL_per_game:   { min: 0,  max: 2,  defaultValue: 0.5 },
    BLK_per_game:   { min: 0,  max: 4,  defaultValue: 1   },
    C_BPM:          { min: -10, max: 20,  defaultValue: 5 }
  }
};
