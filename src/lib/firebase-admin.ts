import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
    if (!admin.apps.length) {
        // Try to load service account credentials from environment variables first
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : undefined;

        try {
            admin.initializeApp({
                credential: serviceAccount
                    ? admin.credential.cert(serviceAccount)
                    : admin.credential.applicationDefault(),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } catch (error) {
            console.warn("Failed to initialize default admin credentials, attempting fallback initialization.", error);
            // Fallback: Initialize without credentials. 
            // This relies on the environment having appropriate defaults.
            admin.initializeApp();
        }
    }
    return admin;
};

export const adminApp = initializeFirebaseAdmin();
export const adminDb = adminApp.firestore();
export const adminAuth = adminApp.auth();
export { admin };
