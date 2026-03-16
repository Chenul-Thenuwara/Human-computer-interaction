# Furniture Visualization App 🪑✨

A modern, immersive web application built with **Next.js** and **Three.js** that empowers users to design and visualize spaces via interactive 2D floor plans and 3D furniture placement.

## 🚀 Features

*   **Interactive 2D Floor Planning**: Design your room layouts, place walls, and organize spaces with an intuitive drag-and-drop interface.
*   **3D Furniture Visualization**: View your designs in 3D using React Three Fiber. Select, place, and rotate furniture in real-time.
*   **Authentication & Roles**: Secure login, signup, and password recovery, powered by Firebase Authentication. Support for distinct Admin, Designer, and User roles.
*   **Persistent Storage**: Save designs and access your gallery anytime. Cloud storage and database management via Firebase (Firestore & Storage).
*   **Modern UI**: Beautiful, accessible, and responsive interface built with Tailwind CSS v4, Radix UI primitives, and Framer Motion animations.
*   **Email Notifications**: Integrated email system using Nodemailer for important alerts and user communications.

## 💻 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) 16, [React](https://reactjs.org/) 19
*   **3D Rendering**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
*   **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
*   **Backend & DB**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, Admin SDK)
*   **Drag and Drop**: React DnD

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Version 18.x or 20.x recommended)
*   npm, yarn, pnpm, or bun

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Chenul-Thenuwara/Human-computer-interaction.git
    cd Human-computer-interaction
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install / pnpm install
    ```

3.  **Environment Variables:**
    Copy the `.env.example` file to create your own `.env` file:
    ```bash
    cp .env.example .env.local
    ```
    Ensure you fill in your specific Firebase project configuration:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Firebase Security Rules:**
    Make sure your Firestore rules are correctly set. Review `FIRESTORE_RULES.md` in this repository for detailed instructions on configuring secure access.

5.  **SMTP Configuration (Optional):**
    If you're testing email features, reference the `FIREBASE_SMTP_SETUP.md` document for instructions on setting up Nodemailer.

## 🏃‍♂️ Running the Development Server

Start the application locally:

```bash
npm run dev
# or yarn dev / pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will auto-update as you edit the files in `src/app`.

## 📁 Project Structure

*   `/src/app`: Contains Next.js App Router pages (e.g., dashboard, design, gallery, admin).
*   `/src/components`: Reusable UI components, 2D/3D design tools (`design/Furniture3D.tsx`, `design/Layout2D.tsx`), and layout wrappers.
*   `/src/lib`: Utility functions and Firebase configuration.
*   `/src/types`: TypeScript definitions.
*   `/public`: Static assets like 3D models and images.
*   `/scripts`: Utility scripts for project maintenance (e.g., migrating furniture).

## 📄 Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the app for production.
*   `npm run start`: Runs the built production app.
*   `npm run lint`: Runs ESLint to find and fix problems in the code.

## 🤝 Contributing

Contributions are welcome! Please format your code, adhere to ESLint rules, and verify changes locally before opening a pull request.
