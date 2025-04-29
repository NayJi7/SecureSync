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
    │   ├── index.html
    │   ├── jsrepo.json
    │   ├── node_modules
    │   ├── package.json
    │   ├── public
    │   ├── src
    │   ├── tailwind.config.ts
    │   ├── tsconfig.app.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   └── vite.config.ts
    ├── node_modules
    ├── package.json
    ├── README.md
    └── venv

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
3. Installer les dépendances Python (avec pip)

```bash
cd backend 
pip install -r requirements.txt
cd ..
```
4. Installer les dépendances Node (avec npm)
```bash
cd frontend
npm install
```

5. Lancer le frontend React avec Vite

```bash
npm run dev
```
🌍 Accès à l'application

    Backend (API) : http://localhost:8000/admin
    Frontend (UI) : http://localhost:5173/

📦 Scripts utiles
```bash
# Commande	Description
npm run dev	# Lancer Vite en mode développement
python manage.py makemigrations # trouver les migration 
python manage.py migrate  # installer les migration
```

💪 Contributeur 

Anthony Voisin
Adam Terrak
Mehdi Sekkat
Firas Benmansour
