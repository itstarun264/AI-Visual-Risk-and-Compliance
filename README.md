# AI Visual Risk & Compliance Intelligence Platform

A production-quality, full-stack web application designed for real-time compliance tracking, behavior risk analysis, and visual safety auditing. 

This platform collects user profiles, financial logs, study sessions, and daily compliance habits to generate predictive risk summaries (0-100 score metrics). It also includes a modular computer vision pipeline (supporting mock simulations and YOLO weight files) to overlay safety violations (like missing helmets or blocked corridors) directly onto visual evidence.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Styling**: Tailwind CSS & custom glassmorphism overlays
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form + Zod
- **Server State**: TanStack Query (React Query)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database ORM**: SQLAlchemy 2.0 (with Alembic for migrations)
- **Database**: PostgreSQL (Containerized)
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing
- **Testing**: PyTest

---

## 📁 Project Structure

```text
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── ai.py             # Vision Model interfaces (Mock & YOLO)
│   │   ├── config.py         # Settings & environment validation
│   │   ├── database.py       # DB engine & session generators
│   │   ├── main.py           # FastAPI entry point & CORS
│   │   ├── models.py         # SQLAlchemy schemas (10 tables)
│   │   ├── schemas.py        # Pydantic validation structures
│   │   ├── security.py       # Password hashing & JWT dependencies
│   │   ├── services.py       # Risk, Financial, and Compliance calculation engines
│   │   └── routers/          # Endpoint router segments (auth, profile, financial, study, habits, etc.)
│   ├── requirements.txt      # Python dependencies
│   ├── seed.py               # Empty database initialization script
│   ├── Dockerfile            # Backend container script
│   └── tests/                # Automated pytest modules
├── frontend/                 # Next.js Application
│   ├── src/app/              # Next.js App Router (Layouts & Pages)
│   │   ├── globals.css       # Core glassmorphic theme styling
│   │   ├── page.tsx          # Initial routing guard
│   │   ├── login/            # Authentication login forms
│   │   ├── register/         # Authentication sign-up forms
│   │   └── dashboard/        # Main workspace and submodules
│   ├── src/context/          # Authentication and analytics data-source providers
│   ├── package.json          # Node dependencies
│   └── Dockerfile            # Frontend container script
├── docker-compose.yml        # Multi-container orchestration config
├── .env.example              # Environments template
└── README.md                 # Project handbook
```

---

## 🚀 Installation & Local Running

### Method 1: Running with Docker Compose (Recommended)
You can start the entire platform (Next.js, FastAPI, PostgreSQL) with a single command:

1. Clone or download the workspace directory.
2. In the root directory, copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Boot up the containers:
   ```bash
   docker compose up --build
   ```
4. Access the web interface at:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **FastAPI API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **PostgreSQL Database**: `localhost:5432`

---

### Method 2: Running Manually (Development Mode)

If you prefer to run the services outside Docker, follow these steps:

#### 1. Setup PostgreSQL Database
Ensure you have a PostgreSQL server running locally. Create a database called `risk_intelligence`:
```sql
CREATE DATABASE risk_intelligence;
```

#### 2. Run the Backend (FastAPI)
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the reset script to initialize empty tables:
   ```bash
   python seed.py
   ```
5. Start the FastAPI development server:
   ```bash
   python app/main.py
   ```
   The backend will be running at [http://localhost:8000](http://localhost:8000).

#### 3. Run the Frontend (Next.js)
1. Open a new terminal and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend dashboard will be available at [http://localhost:3000](http://localhost:3000).

---

## Analytics data sources

- **My Data** uses only finance, study, habit, and goal records entered by the signed-in user.
- **Imported Dataset** analyzes a selected CSV, XLSX, or XLS file without copying rows into My Data.
- Use **Profile & data → Data Import** to upload, preview, activate, or remove datasets. Files may contain extra columns; analytics recognize fields such as `date`, `income_inr`, `total_expenses_inr`, `study_hours`, `focus_score`, `habit_completion_rate`, goal progress, compliance, and risk scores.
- **Goal status is user-only.** Imported goal-progress columns never create goals, goal-status cards, or goal recommendations. Goals must be explicitly created by the signed-in user.

No account or activity records are created by `seed.py`. Register through the application before signing in.

## Forecasting model stack

Forecasting models are fitted to the selected user's records or imported dataset; ARIMA and Prophet are train-on-history models rather than downloadable pretrained checkpoints.

- **Financial:** Linear Trend, ARIMA, and Prophet are evaluated on a chronological holdout. The lowest-RMSE candidate produces the next-week and next-month expense forecast.
- **Productivity:** a Random Forest Regressor uses calendar, lag, and rolling study-hour features.
- **Habits:** a Random Forest Classifier estimates continuation probability from dated completion history. A completion-rate baseline is retained when it validates better.
- **Goals (My Data only):** financial, study, and habit goal probabilities are calculated from the corresponding selected model's forecast. Goal status is hidden for imported-dataset analytics.
- **Sparse data:** explicit non-ML fallbacks remain available and do not display fabricated accuracy.

The Forecasting interface displays the selected model, whether training occurred, evaluated candidates, and holdout MAE/RMSE/MAPE or classification accuracy.

---

## 🧪 Testing the Application
We have built testing modules inside the backend folder. To execute:
1. Activate your backend virtual environment.
2. Run `pytest` command:
   ```bash
   pytest tests/
   ```
   This will execute isolated tests covering user auth flows, profile parameters updates, financial ratio math, focus session logs, and habit streaks.
