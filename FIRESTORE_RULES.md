# Fixing "Missing or insufficient permissions"

The error you are seeing is because **Firestore Security Rules** are blocking the save operation. By default, Firebase denies all writes to the database.

You need to update your rules to allow authenticated users to save their designs.

## Step-by-Step Instructions

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (`furniture-visualization-app`).
3.  In the left sidebar, click on **Build** > **Firestore Database**.
4.  Click on the **Rules** tab at the top.
5.  **Copy and Paste** the following rules into the editor (replacing what is there):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own designs
    match /designs/{designId} {
      // Allow create if authenticated and userId matches
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Allow update/delete if authenticated and userId matches existing doc
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Allow read if authenticated and userId matches
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

6.  Click **Publish**.

Once published, wait a few seconds and try saving your design again. It should work!
