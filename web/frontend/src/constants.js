// constants.js
export const FEATURE_RANGES = {
  Guards: {
    Age:        {min: 18, max: 30, defaultValue: 20},
    Height:     {min: 68, max: 84, defaultValue: 76},   // inches
    Weight:     {min: 140, max: 260, defaultValue: 190},
    Wingspan:   {min: 70, max: 90, defaultValue: 81},
    'C_TS%':    {min: 0, max: 100, defaultValue: 55},
    'C_3P%':    {min: 0, max: 100, defaultValue: 35},
    'C_AST_TO': {min: 0, max: 5,   defaultValue: 2},
    'C_BPM':    {min: -5, max: 5,  defaultValue: 0},
    'C_PTS/40': {min: 0, max: 60,  defaultValue: 20},
    'C_AST/40': {min: 0, max: 20,  defaultValue: 6},
    'C_TRB/40': {min: 0, max: 20,  defaultValue: 5},
    'C_STL/40': {min: 0, max: 5,   defaultValue: 1},
    'C_BLK/40': {min: 0, max: 5,   defaultValue: 0.5}
  },
  Wings: {
    Age:        {min: 18, max: 30, defaultValue: 21},
    Height:     {min: 72, max: 88, defaultValue: 80},
    Weight:     {min: 150, max: 280, defaultValue: 215},
    Wingspan:   {min: 72, max: 92, defaultValue: 83},
    'C_TS%':    {min: 0, max: 100, defaultValue: 54},
    'C_3P%':    {min: 0, max: 100, defaultValue: 34},
    'C_AST_TO': {min: 0, max: 5,   defaultValue: 1.5},
    'C_BPM':    {min: -5, max: 5,  defaultValue: 0},
    'C_PTS/40': {min: 0, max: 60,  defaultValue: 18},
    'C_AST/40': {min: 0, max: 20,  defaultValue: 4},
    'C_TRB/40': {min: 0, max: 20,  defaultValue: 6},
    'C_STL/40': {min: 0, max: 5,   defaultValue: 1},
    'C_BLK/40': {min: 0, max: 5,   defaultValue: 0.5}
  },
  Bigs: {
    Age:        {min: 18, max: 32, defaultValue: 22},
    Height:     {min: 78, max: 96, defaultValue: 84},
    Weight:     {min: 180, max: 320, defaultValue: 250},
    Wingspan:   {min: 80, max: 100, defaultValue: 90},
    'C_TS%':    {min: 0, max: 100, defaultValue: 56},
    'C_3P%':    {min: 0, max: 100, defaultValue: 30},
    'C_ORB_DRB':{min: 0, max: 5,   defaultValue: 1},
    'C_BPM':    {min: -5, max: 5,  defaultValue: 0},
    'C_PTS/40': {min: 0, max: 60,  defaultValue: 16},
    'C_AST/40': {min: 0, max: 20,  defaultValue: 3},
    'C_TRB/40': {min: 0, max: 20,  defaultValue: 12},
    'C_STL/40': {min: 0, max: 5,   defaultValue: 0.5},
    'C_BLK/40': {min: 0, max: 5,   defaultValue: 2}
  }
};
