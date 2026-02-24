import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
    if (!admin.apps.length) {
        // In a real production app, you would use a service account key JSON file
        // and set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
        // For local development or simple setups without strict keys configured yet:
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        } catch (error) {
            console.warn("Failed to initialize default admin credentials, attempting fallback initialization.", error);
            // Fallback: Initialize without credentials. 
            // This relies on the environment having appropriate defaults or the project 
            // rules allowing open writes during development. Ideally, the user provides a service account.
            admin.initializeApp();
        }
    }
    return admin;
};

export const adminApp = initializeFirebaseAdmin();
export const adminDb = adminApp.firestore();
