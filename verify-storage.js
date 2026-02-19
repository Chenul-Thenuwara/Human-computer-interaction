const fs = require('fs');
const path = require('path');
const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL } = require("firebase/storage");
const { getAuth, signInAnonymously } = require("firebase/auth");

// Load .env manually
try {
    const envPath = path.resolve(__dirname, '.env');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log("Could not load .env file, relying on process.env");
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

const modelPath = 'models/leather-chair.glb';

async function verify() {
    console.log(`Attempting to sign in anonymously...`);
    try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously.");
    } catch (e) {
        console.warn("Failed to sign in anonymously (might be disabled in console):", e.message);
        console.log("Proceeding without auth...");
    }

    console.log(`Attempting to resolve URL for: ${modelPath}`);
    const storageRef = ref(storage, modelPath);

    try {
        const url = await getDownloadURL(storageRef);
        console.log(`Success! Resolved URL: ${url}`);
        process.exit(0);
    } catch (error) {
        console.error("Error resolving URL:", error.code, error.message);
        process.exit(1);
    }
}

verify();
