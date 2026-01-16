# 📊 Telegram Analyzer

> A fast, privacy-focused web app to visualize and analyze your Telegram chat history.

![Preact](https://img.shields.io/badge/Preact-333333?style=for-the-badge&logo=preact&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)

---

## 🚀 Access the App

The app is live and ready to use! No installation required.

**🔗 [Live Demo](https://sendemy.github.io/telegram-analyzer/)**

---

## ✨ Features

-   **🔒 Privacy First**: All processing happens in your browser. Your chat data is **never** uploaded to any server.
-   **📈 Interactive Timeline**: 
    -   Visualize message frequency over time (Day, Week, Month, Year, or All Time).
    -   Compare the total activity of the chat against the top 5 contributors using multi-line charts.
-   **🗣️ Most Used Words**:
    -   Advanced word frequency analysis.
    -   **Smart Filtering**: Automatically filters out boring Russian and English "stop words" (particles, prepositions, common verbs) to reveal the *real* vocabulary of the chat.
-   **👤 Detailed User Stats**:
    -   Analyze messages, word counts, symbol counts, and media usage (Stickers/GIFs).
    -   Activity Score & Word Density calculation.
-   **🎨 Responsive Design**: Beautiful UI built with SCSS and a custom Design System, optimized for desktop and mobile.

---

## 🛠️ Tech Stack

-   **Framework**: Preact (with Hooks)
-   **Language**: TypeScript
-   **Styling**: SCSS (Modular Architecture)
-   **Charts**: Chart.js (Line & Bar charts)
-   **Build Tool**: Vite
-   **Deployment**: GitHub Actions (CI/CD) & GitHub Pages

---

## 📱 How to Use

1.  **Export your Chat Data**:
    *   Open Telegram Desktop (Windows/Mac/Linux).
    *   Go to `Settings` > `Advanced` > `Export data...`.
    *   Select the specific chat(s) you want to analyze.
    *   Ensure you select **JSON** format.
    *   Wait for the download to finish (you will get a `result.json` file).

2.  **Analyze**:
    *   Go to the [Live Demo](https://sendemy.github.io/telegram-analyzer/).
    *   Drag and drop your `result.json` file into the upload box.
    *   Watch the magic happen!

---

## 💻 Local Development

Want to run it yourself or contribute? Here is how you set it up locally.

```bash
# Clone the repository
git clone https://github.com/sendemy/telegram-analyzer.git

# Navigate into the project
cd telegram-analyzer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📦 Build & Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions.

To deploy manually or set up your own CI/CD:

```bash
npm run build
```

The optimized build files will be generated in the `dist/` folder.

---

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ by [sendemy](https://github.com/sendemy)
