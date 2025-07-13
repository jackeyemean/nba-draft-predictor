## Project Structure

```
nba-draft-predictor
├── archive
├── data
│   ├── raw
│   └── cleaned
├── models
│   ├── training/
│   │   ├── train_and_LOO.py
│   │   └── test_and_LOO.py
│   ├── bigs.pkl
│   ├── guards.pkl
│   └── wings.pkl
├── scraper/
│   ├── extractors.py
│   ├── network.py
│   ├── scraper.py
│   └── main.py
├── web/
│   ├── backend/
│   │   ├── app.py
│   │   ├── Procfile
│   │   ├── requirements.txt
│   │   ├── results.csv
│   │   └── models/
│   │       ├── __init__.py
│   │       ├── bigs.pkl
│   │       ├── guards.pkl
│   │       ├── loader.py
│   │       └── wings.pkl
│   └── frontend/
│       ├── .gitignore
│       ├── package.json
│       ├── package-lock.json
│       ├── postcss.config.js
│       ├── tailwind.config.js
│       ├── public/
│       │   ├── favicon.ico
│       │   └── index.html
│       └── src/
│           ├── api.js
│           ├── App.js
│           ├── constants.js
│           ├── index.css
│           ├── index.js
│           ├── components/
│           │   ├── PlayerForm.js
│           │   └── ResultsTable.js
│           └── pages/
│               └── ResultsPage.js
├── .gitignore
├── README.md
├── requirements.txt
└── results.csv
```
