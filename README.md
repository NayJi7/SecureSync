# 🌐 SecureSync

![SecureSync Overview](frontend/src/README/1.gif)

Welcome to this web development project combining **Django** for the backend and **React + Vite + TypeScript** for the frontend.

## 🚀 Tech Stack

- 🐍 **Backend**: Django (Python)
- ⚛️ **Frontend**: React (with TypeScript)
- ⚙️ **Bundler**: Vite

## 📁 Project Structure

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

## 🔧 Prerequisites

- Python 3.10+
- Node.js + npm
- Virtualenv (venv for Python)
- Git

## 🛠 Installation & Setup

### 1. Clone the project

```bash
git clone https://github.com/your-username/your-project.git
cd SecureSync
```

### 2. Activate the Python virtual environment

```bash
source venv/bin/activate
# or on Windows
venv\Scripts\activate
```

### 3. Install Python dependencies (with pip)

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Install Node dependencies (with npm)

```bash
cd frontend
npm install
```

### 5. Run Django backend + React frontend with Vite

```bash
# Start the backend (in one terminal)
cd backend
python manage.py runserver

# Start the frontend (in another terminal)
cd frontend
npm run dev
```

## 🌍 Application Access

- Backend (API): http://localhost:8000/admin
- Frontend (UI): http://localhost:5173/

## 💪 Contributors

<a href="https://github.com/NayJi7/SecureSync/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NayJi7/SecureSync" />
</a>
