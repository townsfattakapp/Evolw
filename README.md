# EVOLW - Premium Technology Engineering

A modern, high-performance corporate website built for EVOLW, a technology engineering organization. The platform is designed with a "Premium Minimalist" aesthetic, focusing heavily on typography, physics-based motion design, and rigorous engineering standards to reflect the company's core principles.

## 🌟 Key Features

- **Premium Minimalist Design**: A hyper-clean aesthetic that relies on perfect spacing, high-contrast layouts, and a sophisticated Slate/Zinc neutral color palette.
- **Physics-Based Motion System**: Powered by Framer Motion, utilizing centralized, meticulously tuned spring physics for all interactions and page transitions (no generic CSS transitions).
- **First-Class Dark Mode**: Complete dark mode support across all components with automatic system preference detection and manual toggling, ensuring perfect contrast and readability in any theme.
- **Dynamic Content Context**: A React Context-based content management approach, allowing for easy updates to the copy across the site.
- **Responsive Architecture**: Fully responsive edge-to-edge layouts engineered to look perfect on mobile devices, tablets, and massive desktop displays.
- **Admin & Recruitment Portal**: Built-in features for managing careers, contacts, generating offer letters, and certificate PDFs.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Outfit](https://fonts.google.com/specimen/Outfit) (Display) & [Inter](https://fonts.google.com/specimen/Inter) (Body)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps:

### Prerequisites

Ensure you have Node.js (v18+) installed on your machine.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/townsfattakapp/Evolw.git
   ```
2. Navigate into the project directory
   ```bash
   cd Evolw
   ```
3. Install NPM packages
   ```bash
   npm install
   ```
4. Start the development server
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

## 📁 Project Structure

```
src/
├── assets/            # Static images and SVGs
├── components/        # Reusable UI components
│   ├── common/        # SEO, standard layout wrappers
│   ├── layout/        # Navbar, Footer
│   └── ui/            # Buttons, Sections, Containers
├── context/           # React Context (e.g., ContentContext)
├── data/              # JSON data for static site content
├── lib/               # Utilities and centralized motion variants
├── pages/             # Route-level components (Home, About, Services, etc.)
│   └── admin/         # Admin portal pages
├── index.css          # Global Tailwind tokens and base layers
└── main.tsx           # Application entry point
```

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the application for production.
- `npm run preview`: Bootstraps a local static web server to preview the production build.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---
*Designed & Engineered by the EVOLW Team.*
