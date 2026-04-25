# FinSight - AI-Powered Finance Tracker

FinSight is a modern, full-stack personal finance tracking application designed to help users manage their money smarter. It features a sleek dark-themed UI, interactive data visualizations, and an integrated AI Chat Assistant that provides personalized financial insights.

![FinSight Hero Image](./client/src/assets/hero.png) *(Note: Add a screenshot of your dashboard here if available)*

## ✨ Features

* **User Authentication:** Secure signup and login system to protect your financial data.
* **Interactive Dashboard:** Beautiful data visualizations to track expenses, income, and overall financial health.
* **Budget Management:** Easily create, track, and manage monthly budgets across various categories.
* **AI Financial Assistant:** Integrated chat interface powered by AI (Anthropic) to give you tailored financial advice and insights based on your spending.
* **Transaction Uploads:** Seamlessly upload and categorize your transaction files.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Vite
* Tailwind CSS (v4)
* Recharts (Data Visualizations)

**Backend:**
* Node.js
* Express.js
* Prisma ORM
* SQLite Database (Dev)
* Multer (File Uploads)
* Anthropic API (AI Integration)

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Backend Setup

Open a terminal and navigate to the `server` directory:

```bash
cd server
```

Install the dependencies:
```bash
npm install
```

Set up your environment variables:
1. Rename `.env.example` to `.env`.
2. Open `.env` and fill in your secrets:
   * `JWT_SECRET="your-secret-key"`
   * `ANTHROPIC_API_KEY="your-anthropic-api-key"` (Required for the AI chat)

Initialize the database:
```bash
npx prisma db push
```

Start the backend server:
```bash
npm run dev
```
*(The server will start on http://localhost:5000)*

### 2. Frontend Setup

Open a **new** terminal window and navigate to the `client` directory:

```bash
cd client
```

Install the dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*(The React app will start on http://localhost:5173)*

## 📂 Project Structure

```text
Finsight/
├── client/           # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard, Login, Budgets, etc.
│   │   ├── services/    # API calling logic
│   │   └── ...
├── server/           # Express Backend
│   ├── prisma/       # Database schema and SQLite db
│   ├── src/
│   │   ├── routes/      # API endpoints (auth, ai, budgets, etc.)
│   │   ├── middleware/  # Auth protection
│   │   └── ...
└── .gitignore        # Root gitignore to protect sensitive files
```

## 📜 License
This project is open-source and available under the MIT License.
