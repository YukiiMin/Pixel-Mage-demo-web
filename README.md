# PixelMage - AI Tarot Platform

PixelMage is a modern AI-powered Tarot reading platform migrated to Next.js 16 App Router. It combines the mysticism of Tarot with cutting-edge technology, including NFC-linked physical decks and AI interpretation.

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- [pnpm](https://pnpm.io/installation)

### Installation

```sh
# 1. Clone the repository
git clone <your-repo-url>

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm next dev
```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS, Lucide React
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Graphics**: Recharts, Embla Carousel

## 📁 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components and business segments.
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility functions and shared motion variants.
- `src/stores`: Zustand session stores.
- `tool/`: Automation scripts (e.g., `fix-motion.ps1` for inserting `"use client"`).

## 🧪 Development Workflow

### Adding Client Components
When using `framer-motion` or React hooks, ensure the file starts with `"use client"`. You can use the provided script to automate this:
```powershell
./tool/fix-motion.ps1
```

### Build for Production
```sh
pnpm next build
```

## 📜 License
This project is for internal FU_Learning / EXE202 development.
