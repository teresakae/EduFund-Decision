# 🎓 Educational Fund Allocation DSS - Papua Pegunungan (AHP-TOPSIS)

A Decision Support System (DSS) for determining priority allocation of educational infrastructure funding in Papua Pegunungan Province using integrated **Analytic Hierarchy Process (AHP)** and **TOPSIS** methods.

🔗 **Access Application:** [edu-fund-decision.vercel.app](https://edu-fund-decision.vercel.app/)

## 📌 Background

Papua Pegunungan Province faces complex educational infrastructure disparities due to extreme geographical factors. With limited budgets, an objective decision-making mechanism is needed to ensure funding is allocated precisely to districts requiring urgent intervention.

## 🛠️ Methodology

The system operates in two main stages:

1. **Analytic Hierarchy Process (AHP):** Used to calculate relative importance weights of criteria through pairwise comparison matrices.
2. **TOPSIS:** Generates district rankings based on the closest distance from the positive ideal solution and the farthest distance from the negative ideal solution.

## 📊 Evaluation Criteria

There are 4 main criteria used (Academic Year 2022/2023 Data):

- **C1: Classroom Condition (Cost):** Percentage of damaged classrooms.
- **C2: Libraries (Benefit):** Number of school libraries in good condition.
- **C3: Electricity Access (Cost):** Percentage of schools without electricity access.
- **C4: Computer Access (Benefit):** Percentage of schools with computer facilities.

## 🚀 Application Setup Guide

### 1. Environment Preparation (Setup)

**Clone or Download Repository:**
```bash
git clone <repository-url>
cd edufund-decision
```

**Ensure Node.js is Installed:**
This application requires Node.js version 16 or newer. Check version with:
```bash
node --version
```

### 2. Install Dependencies

Run this command to install all required libraries:
```bash
npm install
```

### 3. Run Application (Development Mode)

To run the application in development mode:
```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:5173`.

### 4. Build for Production

To create a production build (as deployed on Vercel):
```bash
npm run build
```

Build files will be saved in the `dist/` folder.

### 5. Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## 🏗️ Project Structure

```
edufund-decision/
├── public/               # Static assets
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styling (Tailwind)
│   └── App.css          # Additional styling
├── index.html           # HTML template
├── package.json         # Dependencies & scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

## 📝 Key Features

- **4-Step Interactive Wizard**: Criteria setup → AHP weighting → Data input → Ranking results.
- **Visual Pairwise Comparison**: Intuitive slider interface with 1-5 scale for criteria comparison.
- **Integrated District Database**: 8 Papua Pegunungan districts with real data (can be added/edited).
- **Custom Districts**: Add new districts with manual data entry.
- **Calculation Transparency**: Displays AHP weights and TOPSIS scores in detail.
- **Ranking Visualization**: Color-coded result cards based on priority level (Red = Top Priority).
- **Responsive Design**: Optimized for desktop and mobile devices.

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Vercel** - Hosting & deployment

## 📱 How to Use the Application

1. **Step 1 - Criteria Setup**: Define name, description, and type (Benefit/Cost) for each criterion.
2. **Step 2 - AHP Weighting**: Compare importance levels between criteria using sliders.
3. **Step 3 - Data Input**: Enter infrastructure values for each district (or select from database).
4. **Step 4 - View Results**: The system will display funding allocation priority rankings with strategic recommendations.

## 🎯 Result Interpretation

- **Low Preference Score (Ci)** = District closer to worst condition → **High Priority**
- **High Preference Score (Ci)** = District closer to best condition → **Low Priority**

The district ranked #1 is the one most in need of immediate funding allocation.

## 📄 Disclaimer

Developed as a final project for Decision Support Systems (SIP 117), this application demonstrates a working proof of concept for AHP-TOPSIS implementation in educational policy planning. Its modular design provides substantial room for further development, including database integration, expanded functionality, and adaptation to other decision-making contexts.
