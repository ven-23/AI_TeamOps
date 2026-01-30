# AI TeamOps

<div align="center">
  <h3>An Intelligent Operational OS for High-Performance Teams</h3>
  <p>Track tasks, visualize productivity, and generate AI-powered insights from natural language logs.</p>
</div>

---

## 🚀 Overview

**AI TeamOps** is a comprehensive team management dashboard designed to streamline operational workflows. It leverages **Google Gemini AI** to transform unstructured natural language work logs into structured data, providing real-time analytics on team performance, burnout risk, and project velocity.

Built with a focus on aesthetics and usability, AI TeamOps offers a premium experience with dark mode support, fluid animations, and a responsive design.

## ✨ Key Features

- **🧠 AI-Powered Logging**: Simply type what you did (e.g., "Debugged the login API for 2 hours"), and the AI parses it into structured tasks with categories and durations.
- **📊 Interactive Dashboard**: Visualize workload distribution, completion rates, and trend analysis using interactive charts.
- **🛡️ Burnout Detection**: Monitors work patterns to identify potential burnout risks before they impact the team.
- **📝 Automated Reporting**: Generates professional weekly status reports and executive summaries with a single click.
- **bfs Career Coaching**: Provides personalized career growth insights and performance feedback for every team member.
- **🎨 Modern UI/UX**: Features a fully responsive interface with Dark/Light mode, glassmorphism effects, and circular avatars.
- **📅 Attendance Tracking**: Integrated check-in/check-out system with location and status tracking.
- **🤖 Mock AI Mode**: Works out-of-the-box even without an API key by simulating AI responses with realistic data.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (gemini-1.5-flash & gemini-1.5-pro)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Avatars**: [DiceBear](https://www.dicebear.com/)

## 📂 Project Structure

The project follows a clean and standard directory structure:

```
ai-teamops/
├── public/                 # Static assets (favicon)
├── src/
│   ├── components/         # Reusable UI components (Dashboard, TaskTracker, etc.)
│   ├── lib/                # Utilities and Services (Gemini AI, Constants)
│   ├── types/              # TypeScript Type Definitions
│   ├── App.tsx             # Main Application Component
│   ├── index.css           # Global Styles & Tailwind Directives
│   └── index.tsx           # Entry Point
├── .env.local              # Environment Variables
├── index.html              # HTML Template
├── package.json            # Dependencies & Scripts
└── vite.config.ts          # Vite Configuration
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-teamops.git
   cd ai-teamops
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   > **Note:** If no API key is provided, the app will automatically run in **Mock Mode**, allowing you to explore all features with simulated data.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view the app.

## 🧪 Building for Production

To create an optimized production build:

```bash
npm run build
```
The output will be in the `dist/` directory, ready for deployment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
