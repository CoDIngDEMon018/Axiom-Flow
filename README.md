# Axiom Flow

> **Build AI workflows visually.** A pixel-perfect clone of Weavy.ai's workflow builder, powered by React Flow, Trigger.dev, and Google Gemini AI.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Trigger.dev](https://img.shields.io/badge/Trigger.dev-4.3-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?logo=tailwind-css)

---

## 🎯 Overview

**Axiom Flow** is a visual workflow builder that allows users to create complex AI-powered automation flows without writing code. It combines:

- **Drag-and-drop canvas** for intuitive workflow design using React Flow
- **6 powerful node types**: Text, Image Upload, Video Upload, LLM, Image Crop, and Frame Extraction
- **Parallel execution** of independent workflow branches
- **AI integration** via Google Gemini for multimodal understanding
- **Media processing** with FFmpeg (image cropping, video frame extraction)
- **Serverless execution** via Trigger.dev tasks
- **Full workflow history** with node-level execution details
- **Export/import workflows** as JSON for sharing and reuse

This is a **submission project** demonstrating professional full-stack engineering practices with type-safe APIs, proper state management, authentication, and seamless UX.

---

## ✨ Features

### Core Workflow Engine
- ✅ **Drag-and-drop canvas** with React Flow (dot grid, zoom, pan, MiniMap)
- ✅ **6 node types** with configurable inputs and outputs
- ✅ **Node connections** with animated purple edges
- ✅ **DAG validation** (prevents circular dependencies)
- ✅ **Parallel execution** of independent branches
- ✅ **Pulsating glow effect** on running nodes
- ✅ **Real-time status updates** during execution

### Node Types

| Node | Purpose | Key Features |
|------|---------|---|
| **Text** | Input text/prompts | Textarea, text output handle |
| **Upload Image** | Upload images via Transloadit | jpg/png/webp/gif, preview, drag-drop |
| **Upload Video** | Upload videos via Transloadit | mp4/mov/webm, player preview |
| **Run Any LLM** | Execute Google Gemini models | Model selector, multimodal (text+images), inline results |
| **Crop Image** | Crop images via FFmpeg | Configurable x/y/width/height %, Transloadit upload |
| **Extract Frame** | Extract frames from video | Timestamp/percentage support, FFmpeg + Transloadit |

### Workflow Management
- ✅ **Save/load workflows** to PostgreSQL
- ✅ **Workflow history** with execution scopes (full, selected, single node)
- ✅ **Node-level history** showing inputs, outputs, errors, duration
- ✅ **Export/import workflows** as JSON
- ✅ **Undo/redo** for canvas operations
- ✅ **Delete nodes** via menu or keyboard

### User Experience
- ✅ **Clerk authentication** with protected routes
- ✅ **Responsive design** (desktop, tablet, mobile)
- ✅ **Collapsible sidebars** for canvas focus
- ✅ **Keyboard shortcuts** (Ctrl+Z undo, Ctrl+Y redo, Delete node)
- ✅ **Context menus** for node operations

### Sample Workflow
A pre-built **"Product Marketing Kit Generator"** demonstrating:
- Parallel branch execution (image processing + video extraction)
- Input chaining across nodes
- Convergence point (LLM receiving outputs from both branches)
- Multi-modal LLM input (text + cropped image + extracted frame)

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** – React framework with App Router
- **React 19** – UI library
- **React Flow 11** – Visual workflow canvas
- **TypeScript 5** – Type safety
- **Tailwind CSS 4** – Styling
- **Zustand** – State management
- **Zod** – Schema validation
- **Lucide React** – Icon library
- **Sonner** – Toast notifications

### Backend & Services
- **Trigger.dev v4** – Serverless task orchestration
- **Google Generative AI SDK** – Gemini API integration
- **FFmpeg** – Media processing (cropping, frame extraction)
- **Transloadit** – File upload and media processing
- **Prisma ORM** – Database access
- **Clerk** – Authentication

### Database & Infrastructure
- **PostgreSQL** – Relational database (Supabase/Neon recommended)
- **Vercel** – Deployment platform

---

## 📦 Installation

### Prerequisites
- **Node.js 18+** and npm/yarn
- **PostgreSQL** database (Supabase, Neon, or local)
- API keys for: Clerk, Google AI, Trigger.dev, Transloadit

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/axiom-flow.git
cd axiom-flow/axiom-flow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in the `axiom-flow` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/axiom_flow"

# Trigger.dev
TRIGGER_API_KEY=tr_dev_xxxxx

# Google Generative AI (Gemini)
GOOGLE_API_KEY=AIza_xxxxx

# Transloadit File Upload
NEXT_PUBLIC_TRANSLOADIT_KEY=xxxxx
TRANSLOADIT_SECRET=xxxxx
NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID=xxxxx

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV=development
```

### 4. Database Setup

Initialize Prisma and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Create tables (runs migrations)
npx prisma migrate dev --name init

# Seed sample workflow (optional)
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 API Keys & Setup

### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com) → Sign up for free
2. Create a new application
3. Copy `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy `Secret Key` → `CLERK_SECRET_KEY`
5. Configure redirect URLs in Clerk dashboard:
   - Allowed redirect URLs: `http://localhost:3000` (dev), `https://yourdomain.com` (prod)
   - Post-sign-in URL: `/dashboard`
   - Post-sign-up URL: `/dashboard`

### Google Generative AI (Gemini)
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key" → Create a new API key
3. Copy key → `GOOGLE_API_KEY`
4. Free tier includes access to Gemini 1.5 Pro

### Trigger.dev
1. Sign up at [trigger.dev](https://trigger.dev)
2. Create a new project
3. Copy `Project Ref` (proj_xxxxx) → Update in `trigger.config.ts`
4. Copy `API Key` → `TRIGGER_API_KEY`
5. Connect your GitHub repo for deployments

### Transloadit (File Uploads)
1. Sign up at [transloadit.com](https://transloadit.com) (free tier available)
2. Create an API key: Settings → API & Auth Tokens
3. Copy `Auth Key` → `NEXT_PUBLIC_TRANSLOADIT_KEY`
4. Copy `Auth Secret` → `TRANSLOADIT_SECRET`
5. Create a **Transloadit Template** for file handling and copy ID → `NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID`

### PostgreSQL Database
**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Go to Settings → Database → Connection String
3. Copy PostgreSQL URI → `DATABASE_URL`

**Option B: Neon**
1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy connection string → `DATABASE_URL`

**Option C: Local PostgreSQL**
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15
createdb axiom_flow

# Linux (apt)
sudo apt install postgresql-15
sudo -u postgres createdb axiom_flow

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/axiom_flow"
```

---

## 📖 Project Structure

```
axiom-flow/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── run/                # POST /api/run - Execute workflow
│   │   │   ├── history/            # GET /api/history - Fetch run history
│   │   │   └── upload/             # POST /api/upload - Handle file uploads
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main workflow canvas
│   │   ├── layout.tsx              # Root layout with Clerk provider
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── nodes/                  # React Flow node components
│   │   │   ├── TextNode.tsx
│   │   │   ├── UploadImageNode.tsx
│   │   │   ├── UploadVideoNode.tsx
│   │   │   ├── LLMNode.tsx
│   │   │   ├── CropNode.tsx
│   │   │   ├── ExtractNode.tsx
│   │   │   └── NodeCard.tsx        # Reusable node container
│   │   ├── Header.tsx              # Top bar with Run Workflow button
│   │   ├── Sidebar.tsx             # Left sidebar with node palette
│   │   ├── WorkflowCanvas.tsx      # React Flow canvas
│   │   ├── HistorySidebar.tsx      # Right sidebar with run history
│   │   ├── FileUploader.tsx        # Uppy + Transloadit integration
│   │   └── providers/
│   │       └── ToastProvider.tsx   # Sonner toast setup
│   ├── lib/
│   │   ├── graph.ts                # DAG validation, topological sort
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── utils.ts                # Utility functions
│   │   └── validation.ts           # Zod schemas for API validation
│   ├── store/
│   │   └── store.ts                # Zustand global state
│   ├── trigger/                    # Trigger.dev tasks
│   │   ├── workflow.ts             # Main orchestration task
│   │   ├── llm.ts                  # LLM execution task
│   │   ├── crop.ts                 # Image cropping task
│   │   ├── extract.ts              # Frame extraction task
│   │   └── utils.ts                # uploadToTransloadit helper
│   └── middleware.ts               # Clerk authentication middleware
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migration history
│   └── seed.ts                     # Sample workflow seeder
├── public/
│   └── uploads/                    # Local file uploads (fallback)
├── .env.example                    # Environment variables template
├── trigger.config.ts               # Trigger.dev configuration
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🎮 Usage

### 1. Create a Workflow

1. Sign in with Clerk
2. Navigate to `/dashboard`
3. **Add nodes** by dragging from the left sidebar onto the canvas
4. **Connect nodes** by dragging from output handles → input handles
5. **Configure node parameters** (text input, crop %, timestamp, LLM model)

### 2. Run a Workflow

- **Full workflow**: Click "Run Workflow" button in header
- **Single node**: Right-click node → "Run This Node"
- **Selected nodes**: Shift+click to multi-select → "Run Selected"

### 3. View Results

- **Live execution**: Watch nodes pulse with glow effect during execution
- **Inline results**: LLM, crop, extract nodes display outputs directly
- **History sidebar**: All runs appear with timestamp and status
- **Expand run**: Click to see node-level inputs, outputs, errors, duration

### 4. Manage Workflows

- **Export workflow**: Header → Export button → Downloads JSON
- **Import workflow**: Header → Upload button → Select JSON file

### 5. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` or `Shift + Z` | Redo |
| `Delete` / `Backspace` | Delete selected node |

---

## 📡 API Endpoints

### POST `/api/run`

Execute a workflow.

**Request:**
```json
{
  "nodes": [{
    "id": "node-1",
    "type": "textNode",
    "position": { "x": 0, "y": 0 },
    "data": { "text": "Hello" }
  }],
  "edges": []
}
```

**Response:**
```json
{
  "success": true,
  "runId": "run_abc123",
  "traceId": "tr_def456"
}
```

### GET `/api/history`

Fetch workflow run history (latest 50).

### DELETE `/api/history?id=run_123`

Delete a specific run from history.

---

## 🔄 Trigger.dev Tasks

All node execution runs as Trigger.dev tasks for reliability.

### Task IDs

| Task | Purpose |
|------|---------|
| `execute-workflow` | Orchestrates full workflow execution |
| `llm-task` | Calls Google Gemini API with multimodal input |
| `crop-task` | Crops image via FFmpeg, uploads to Transloadit |
| `extract-task` | Extracts frame from video, uploads to Transloadit |

### Running Tasks Locally

```bash
# Start Trigger.dev development server
npx trigger.dev dev

# In another terminal, start Next.js dev server
npm run dev
```

---

## 📝 Sample Workflow

A pre-built workflow demonstrating all 6 node types with parallel execution:

### "Product Marketing Kit Generator"

**Execution Flow:**
1. **Branch A (Parallel)**: Upload image → Crop → LLM with prompts
2. **Branch B (Parallel)**: Upload video → Extract frame
3. **Convergence**: Final LLM receives outputs from both branches + prompts

**Result:** Tweet-length marketing post with vision understanding of product photo and demo frame.

Load with **"Load Sample"** button in header.

---

## 🧪 Testing Checklist

- [ ] **Auth**: Sign up, sign in, sign out flow
- [ ] **Nodes**: Add all 6 node types, drag on canvas
- [ ] **Connections**: Connect nodes, see animated edges
- [ ] **Uploads**: Image and video via Transloadit
- [ ] **Workflow run**: Full workflow, single node, selected nodes
- [ ] **Results**: See outputs on nodes and in history sidebar
- [ ] **History**: Expandable run entries, node-level details
- [ ] **Export/Import**: Export to JSON, import same file
- [ ] **Keyboard**: Undo/redo, delete node
- [ ] **Sample workflow**: Load sample, run both branches in parallel

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit: Axiom Flow"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repo
   - Set framework to "Next.js"
   - Configure environment variables (see list below)
   - Click "Deploy"

3. **Post-deployment**
   - Update `NEXT_PUBLIC_APP_URL` in Vercel settings to your deployed URL
   - Update Clerk redirect URLs to include your Vercel domain
   - Run Prisma migrate on production DB:
     ```bash
     npx prisma migrate deploy --skip-generate
     ```

### Environment Variables for Vercel

Set these in **Vercel Project Settings → Environment Variables**:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL=postgresql://user:pass@host:5432/dbname
TRIGGER_API_KEY=tr_prod_xxxxx
GOOGLE_API_KEY=AIza_xxxxx
NEXT_PUBLIC_TRANSLOADIT_KEY=xxxxx
TRANSLOADIT_SECRET=xxxxx
NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID=xxxxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Troubleshooting Vercel Deployment

**Issue: "Prisma has detected that this project was built on Vercel"**

✅ **Fixed**: The `package.json` includes a `postinstall` script that runs `prisma generate` automatically.

If you still encounter Prisma issues:
1. Verify `postinstall` script exists in `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
2. Check Vercel build logs for Prisma generation
3. Ensure `DATABASE_URL` is set in Vercel environment variables
4. Redeploy after adding environment variables

---

## 📋 Known Limitations

### TODO (Future Enhancements)
- [ ] **Workflow save/load UI** – API exists, UI dialogs needed
- [ ] **Multi-user collaboration** – Real-time editing
- [ ] **Custom nodes** – User-defined node types
- [ ] **Analytics** – Performance dashboards
- [ ] **Mobile app** – React Native version

### Known Issues
- Transloadit result parsing varies based on template configuration
- FFmpeg timeouts possible on very large video files (>500MB)

---

## 📚 Resources

- **React Flow**: https://reactflow.dev
- **Trigger.dev**: https://trigger.dev/docs
- **Clerk**: https://clerk.com/docs
- **Transloadit**: https://transloadit.com/docs
- **Google Gemini API**: https://ai.google.dev/docs
- **Prisma ORM**: https://www.prisma.io/docs

---

## ✅ Submission Checklist

- [x] Pixel-perfect Weavy.ai UI clone
- [x] Clerk authentication with protected routes
- [x] 6 fully functional node types
- [x] React Flow canvas with dot grid, zoom, pan, MiniMap
- [x] Animated purple edges
- [x] Pulsating glow on running nodes
- [x] DAG validation (no cycles)
- [x] Workflow history with node-level details
- [x] File uploads via Transloadit
- [x] FFmpeg crop and frame extraction
- [x] Google Gemini AI integration (multimodal)
- [x] All execution via Trigger.dev tasks
- [x] PostgreSQL database with Prisma ORM
- [x] Workflow export/import JSON
- [x] API routes with Zod validation
- [x] TypeScript throughout
- [x] Undo/redo support
- [x] Responsive design
- [x] Deployed on Vercel

---

## 🎯 Quick Start (TL;DR)

```bash
# Clone and install
git clone <repo> && cd axiom-flow/axiom-flow && npm install

# Setup env vars
cp .env.example .env.local
# Edit .env.local with your API keys

# Database
npx prisma migrate dev
npx prisma db seed

# Run dev server
npm run dev

# Start Trigger.dev (in another terminal)
npx trigger.dev dev

# Open http://localhost:3000 → Sign in → Create workflow → Run!
```

---

**Built with ❤️ for Galaxy.AI Submission | January 2026**
