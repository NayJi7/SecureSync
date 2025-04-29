# 🌐 SecureSync

Bienvenue dans ce projet de développement web combinant **Django** pour le backend et **React + Vite + TypeScript** pour le frontend.

---

## 🚀 Stack Technique

- 🐍 **Backend** : Django (Python)
- ⚛️ **Frontend** : React (avec TypeScript) 
- ⚙️ **Bundler** : Vite

---

## 📁 Structure du projet

.
└── SecureSync
    ├── backend
    │   ├── accounts
    │   ├── backend
    │   ├── db.sqlite3
    │   ├── manage.py
    │   ├── media
    │   ├── object
    │   ├── requirements.txt
    │   └── statistique
    ├── frontend
    │   ├── components.json
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── jsrepo.json
    │   ├── next-env.d.ts
    │   ├── node_modules
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── public
    │   ├── README.md
    │   ├── src
    │   ├── tailwind.config.ts
    │   ├── tsconfig.app.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   └── vite.config.ts
    ├── node_modules
    │   ├── ansi-regex
    │   ├── ansi-styles
    │   ├── asynckit
    │   ├── axios
    │   ├── call-bind-apply-helpers
    │   ├── chalk
    │   ├── cliui
    │   ├── color-convert
    │   ├── color-name
    │   ├── combined-stream
    │   ├── concurrently
    │   ├── delayed-stream
    │   ├── dunder-proto
    │   ├── emoji-regex
    │   ├── escalade
    │   ├── es-define-property
    │   ├── es-errors
    │   ├── es-object-atoms
    │   ├── es-set-tostringtag
    │   ├── follow-redirects
    │   ├── form-data
    │   ├── function-bind
    │   ├── get-caller-file
    │   ├── get-intrinsic
    │   ├── get-proto
    │   ├── gopd
    │   ├── has-flag
    │   ├── hasown
    │   ├── has-symbols
    │   ├── has-tostringtag
    │   ├── is-fullwidth-code-point
    │   ├── js-tokens
    │   ├── lodash
    │   ├── loose-envify
    │   ├── math-intrinsics
    │   ├── mime-db
    │   ├── mime-types
    │   ├── proxy-from-env
    │   ├── react
    │   ├── react-dom
    │   ├── require-directory
    │   ├── rxjs
    │   ├── scheduler
    │   ├── shell-quote
    │   ├── string-width
    │   ├── strip-ansi
    │   ├── supports-color
    │   ├── tree-kill
    │   ├── tslib
    │   ├── wrap-ansi
    │   ├── y18n
    │   ├── yargs
    │   └── yargs-parser
    ├── package.json
    ├── package-lock.json
    ├── README.md
    └── venv
        ├── bin
        ├── lib
        ├── lib64 -> lib
        └── pyvenv.cfg

70 directories, 20 files


---

## 🔧 Pré-requis

- Python 3.10+
- Node.js + npm
- `virtualenv` (ou équivalent)
- Git

---

## 🛠 Installation & Lancement

### 1. Cloner le projet

```bash
git clone https://github.com/ton-utilisateur/ton-projet.git
cd SecureSync
```

2. Activer l'environnement virtuel Python
```bash
source env/bin/activate

# ou sous Windows
env\Scripts\activate
```
3. Installer les dépendances Django

```bash
cd backend 
pip install -r requirements.txt
cd ..
```
4. Lancer le frontend React avec Vite

```bash
cd frontend
npm install
npm run dev
```
🌍 Accès à l'application

    Backend (API) : http://localhost:8000

    Frontend (UI) : http://localhost:5173

📦 Scripts utiles
Commande	Description
npm run dev	Lancer Vite en mode développement
python manage.py makemigrations // trouver les migration 
python manage.py migrate  // installer les migration

💪 Contributeur 

Anthony Voisin
Adam Terrak
Mehdi Sekkat
Firas Benmansour