# 🌐 SecureSync

Bienvenue dans ce projet de développement web combinant **Django** pour le backend et **React + Vite + TypeScript** pour le frontend.

## 🚀 Stack Technique

- 🐍 **Backend** : Django (Python)
- ⚛️ **Frontend** : React (avec TypeScript)
- ⚙️ **Bundler** : Vite

## 📁 Structure du projet

```
SecureSync/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── media/
│   ├── object/
│   ├── statistique/
│   ├── accounts/
│   └── backend/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig*.json
│   ├── vite.config.ts
│   └── node_modules/
│
├── node_modules
├── package.json
├── README.md
└── venv/
```

## 🔧 Pré-requis

- Python 3.10+
- Node.js + npm
- Virtualenv (venv pour python)
- Git

## 🛠 Installation & Lancement

### 1. Cloner le projet

```bash
git clone https://github.com/ton-utilisateur/ton-projet.git
cd SecureSync
```

### 2. Activer l'environnement virtuel Python

```bash
source venv/bin/activate
# ou sous Windows
venv\Scripts\activate
```

### 3. Installer les dépendances Python (avec pip)

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Installer les dépendances Node (avec npm)

```bash
cd frontend
npm install
```

### 5. Lancer le backend Django + le frontend React avec Vite

```bash
# Démarrer le backend (dans un terminal)
cd backend
python manage.py runserver

# Démarrer le frontend (dans un autre terminal)
cd frontend
npm run dev
```

## 🌍 Accès à l'application

- Backend (API) : http://localhost:8000/admin
- Frontend (UI) : http://localhost:5173/

## 💪 Contributeurs

- Anthony Voisin
- Adam Terrak
- Mehdi Sekkat
- Firas Benmansour
