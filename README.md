# OmniChat

OmniChat is a "MacOS native-like" application that unifies your messaging experience. It aggregates **Slack**, **Discord**, and **Telegram** into a single, sleek interface, allowing you to switch between services seamlessly without cluttering your desktop with multiple windows.

Beyond just aggregation, OmniChat integrates a powerful **AI Assistant** powered by Google's **Gemini 2.5 Flash Lite**, offering advanced features like in-context message refinement and a dedicated chat interface.

## Features

### 1. Unified Messaging Interface
- **All-in-One**: Access Slack, Discord, and Telegram from a single window.
- **Sidebar Navigation**: Switch between services instantly with a click.
- **Session Persistence**: Stay logged in across app restarts.

### 2. "Slick" Native UI
- **Glassmorphism**: Modern, translucent design with blur effects that feels right at home on macOS.
- **Dark Mode**: Deep dark theme (`bg-gray-950`) for reduced eye strain.
- **Smooth Animations**: Polished transitions and hover effects.

### 3. Advanced AI Integration (Gemini)
- **General Chat**: A dedicated AI Assistant panel powered by **Gemini 2.5 Flash Lite** for high-speed queries and assistance.
- **"Refine with AI"**: Right-click on any text input in your messaging apps to instantly polish, fix grammar, or rewrite your message using AI.
- **Secure**: Your API keys are stored locally on your device.

### 4. Smart Notifications
- **Unified Badges**: See unread counts for all services directly in the sidebar.
- **Advanced Polling**: Intelligent detection ensures accurate unread counts for Telegram, even when the window title doesn't update.

## Technical Stack

- **Electron**: Desktop shell.
- **React**: UI and component management.
- **TypeScript**: Type-safe development.
- **Tailwind CSS v4**: Modern, utility-first styling.
- **Vite**: Lightning-fast build tool.

## Getting Started

### Prerequisites
- Node.js installed.
- A Google Gemini API Key (get one from Google AI Studio).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/demirelo/omnichat.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## About

OmniChat was built to solve the fragmentation of modern communication. By bringing your most essential chat tools under one roof and augmenting them with AI, it streamlines your workflow and keeps you focused.

---
*Built with ❤️ by the OmniChat Team*
