# MarketPulse AI - AI-Powered Market Product Trend Assistant

MarketPulse AI is a complete, production-quality demonstration web application designed for a fictional organization operating in the health and wellness supplements industry. It demonstrates how an AI-assisted platform can centralize manual market research processes, extract and attribute product benefit claims, analyze hero ingredients, map products to clinical benefit categories, verify claims using grounded evidence, and maintain human-in-the-loop compliance audits.

## 1. Business Problem & Solution Scope
An annual market analysis currently requires approximately **200 hours** of manual labor, with yearly maintenance and refresh workloads costing **800–1,000 hours**. Additionally, static reports become outdated quickly, details are fragmented across spreadsheets, and analysts miss emerging niche opportunities.

**MarketPulse AI** addresses these challenges by:
1. **Centralizing intelligence**: Providing a queryable database of categories, brands, and products.
2. **Automating extraction**: Applying Gemini 2.5 Flash to parse claims, dosage listings, and hero ingredients.
3. **Traceability**: Instating validation timelines mapping a claim directly back to registered package scans.
4. **Human-in-the-Loop**: Flagging low-confidence classifications for reviewer overrides and maintaining an immutable audit log.

## 2. Technology Stack
* **Frontend**: React (JavaScript/JSX, standard ESM, **no TypeScript**), Vite, Tailwind CSS v4.3, React Router DOM, Recharts, Lucide React.
* **Backend**: Python 3.11, FastAPI, Uvicorn, SQLAlchemy, Pydantic, SQLite database.
* **AI Provider**: Google Gemini (`google-genai` official Python SDK, using `gemini-2.5-flash`).
* **Authentication**: JWT token authorization, secure password hashing using `pwdlib` (`PasswordHash.recommended()`).

## 3. JWT Flow & Authentication Architecture
1. **User Registration**: `POST /api/auth/register` creates an `analyst` (default) account with hashed passwords. Returns JWT access token.
2. **User Login**: `POST /api/auth/login` checks credentials. Returns token.
3. **Session Recovery**: `GET /api/auth/me` verifies bearer tokens.
4. **Client Requests**: The unified fetch client in `services/api.js` automatically attaches the token in the `Authorization: Bearer <token>` header. If the server responds with a 401 Unauthorized, the client clears local storage and redirects the user to `/login`.
5. **Route Guards**: Protected React routes reject unauthenticated users. Role-based backend dependency checks restrict `/review` and `/audit` endpoints to `reviewer` or `admin` roles.

## 4. Database Schema Models
* **User**: User credentials, active status, roles (`executive`, `analyst`, `reviewer`, `admin`).
* **Category**: Health domains (e.g. *Sleep & Relaxation*).
* **Brand**: Supplement manufacturers (e.g. *Northstar Wellness*).
* **Source**: Ingestion references (e.g. manual upload, public web, retailer site).
* **Product**: Product listings with revenue, momentum scores, AI confidence, and status.
* **Claim**: Raw & normalized claims with category weights summing to 1.0 per product.
* **Ingredient**: Active ingredients.
* **ProductIngredient**: Connective table with dosage quantities, hero tags, and confidence.
* **Evidence**: OCR scans or study logs supporting product claims.
* **Review**: Escalations flagged for compliance check-offs.
* **AuditLog**: Immutably records overrides, category remappings, and the Gemini model version.

---

## 5. Local Installation & Execution

### Environment Variables (.env)
Create a `.env` file inside `backend/`:
```env
DATABASE_URL=sqlite:///./marketpulse.db
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=super_secret_marketpulse_key_for_demo_purposes_12345
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend Startup
1. Open PowerShell and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   * **Windows**: `venv\Scripts\activate`
   * **macOS/Linux**: `source venv/bin/activate`
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI server (it will automatically initialize and seed SQLite tables if empty):
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Startup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development phase server:
   ```bash
   npm run dev
   ```
4. Run in production state (compiles bundle and serves the static assets):
   ```bash
   npm run build
   npm run start
   ```

### Root Workspace Shortcut Scripts
From the root workspace directory, you can run the following shortcut scripts:
* Run development server: `npm run dev`
* Build production state: `npm run build`
* Start production state server: `npm run start`

---

## 6. Demonstration Credentials
To log into the platform, utilize the following pre-seeded credentials:

| Account Type | Email Address | Password |
| :--- | :--- | :--- |
| **Executive** | `executive@marketpulse.demo` | `DemoPass123!` |
| **Analyst** | `analyst@marketpulse.demo` | `DemoPass123!` |
| **Reviewer** | `reviewer@marketpulse.demo` | `DemoPass123!` |
| **Admin** | `admin@marketpulse.demo` | `DemoPass123!` |

---

## 7. Complete API Endpoint List

### Authentication
* `POST /api/auth/register` - Create analyst login
* `POST /api/auth/login` - Verify credentials, returns JWT token
* `GET /api/auth/me` - Get logged-in user profile

### Dashboard Analytics
* `GET /api/dashboard/summary` - KPI strip figures
* `GET /api/dashboard/category-opportunity` - Revenue grouped by category
* `GET /api/dashboard/momentum` - Momentum averages per category
* `GET /api/dashboard/emerging-signals` - High growth / low footprint products
* `GET /api/dashboard/executive-insights` - Gemini synthesized overall observations
* `POST /api/dashboard/executive-insights/refresh` - Force call Gemini for fresh overview brief

### Market Explorer
* `GET /api/market/categories` - Fetch categories
* `GET /api/market/overview` - Coverage statistics
* `GET /api/market/ingredients` - Top hero ingredient frequencies
* `GET /api/market/claims` - Claims occurrences
* `GET /api/market/category/{category_id}` - Detailed metrics and product logs in category
* `POST /api/market/category/{category_id}/interpret` - In-drawer Gemini category analysis

### Products Catalog
* `GET /api/products` - Search, filter, and page products catalog list
* `GET /api/products/{product_id}` - Complete details, claims, ingredients, and attribution
* `GET /api/products/{product_id}/evidence` - Timelines representing claim lineages
* `POST /api/products/{product_id}/analyze-classification` - Perform Gemini classification re-evaluation

### Governance Review & Auditing (Reviewer/Admin Only)
* `GET /api/reviews` - Flagged review queue lists
* `GET /api/reviews/{review_id}` - Get review details
* `POST /api/reviews/{review_id}/approve` - Confirm current classification
* `POST /api/reviews/{review_id}/override` - Overrule AI category mapping, apply changes, log audit trail
* `POST /api/reviews/{review_id}/send-back` - Flag ingestion records for recount
* `GET /api/audit` - Searchable governance audit trail

### Ingestion Data
* `GET /api/sources` - Ingestion feeds listings
* `POST /api/sources/upload-csv` - File format validation and column headers check

### System
* `GET /health` - Light database status and Gemini API setup reporting

---

## 8. Deployment Configurations

### Render Web Service Deployment (Backend)
1. Add a new **Web Service** on Render linking to your backend repository.
2. Select runtime **Python 3.11** or python environment.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure environment variables in the Render settings dashboard matching `.env.example`.

### Static Frontend Deployment (Vite)
1. Build command: `npm run build`
2. Publish folder: `dist`
3. If using Netlify/Vercel/Render static site, ensure routing redirect rules (SPA rewrite) are defined for React Router:
   * **Netlify `_redirects`**: `/* /index.html 200`
   * **Vercel `vercel.json`**:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```

---

## 9. Prototype vs. Target Production Architecture

### Prototype Implementation
* **Language/Framework**: Single React client (ESM JS) and single Uvicorn FastAPI server.
* **Database**: Embedded SQLite. Eager relation loading for simplicity.
* **AI Ingestion**: Pre-extracted claim nodes and ingredient links mapped in seeds. Gemini used on-the-fly for interpretation.
* **Storage**: In-memory CSV uploads, mock packaging scanner placeholder containers.

### Target Production Pipeline
* **Auth**: Enterprise Single Sign-On (SSO) with Multi-Factor Authentication.
* **Database**: Enterprise SQL Cluster (PostgreSQL) + Vector Store.
* **Ingestion Pipeline**: Governed cron microservices scraping e-commerce sites, scheduling OCR/LLM ingestions.
* **Auditability**: Secure ledger audit trailing, alerts on classification drift, MLflow model checking.
