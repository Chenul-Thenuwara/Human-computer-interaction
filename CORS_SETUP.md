# Setting up CORS for Firebase Storage

The "Failed to fetch" error you are seeing is due to **Cross-Origin Resource Sharing (CORS)**. By default, Firebase Storage blocks requests from web browsers unless you explicitly allow them.

Since your 3D models are now loaded from `firebasestorage.googleapis.com` by your app running on `localhost` (or another domain), the browser blocks the request for security reasons.

## How to Fix It

You need to apply the `cors.json` configuration I created to your Firebase Storage bucket.

### Option 1: Google Cloud Console (Web Interface)
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project: `furniture-visualization-app`.
3.  Activate **Cloud Shell** (icon in top right).
4.  Upload the `cors.json` file to Cloud Shell (or create it: `nano cors.json` and paste the content).
5.  Run this command in Cloud Shell:
    ```bash
    gsutil cors set cors.json gs://furniture-visualization-app.firebasestorage.app
    ```

### Option 2: Install `gsutil` Locally
1.  Targeting Windows, install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2.  Run `gcloud init` to login.
3.  Run the command from your project root:
    ```cmd
    gsutil cors set cors.json gs://furniture-visualization-app.firebasestorage.app
    ```

### Why is this necessary?
The browser's security model prevents your web page from reading data (like 3D models) from another domain unless that domain says "It's okay!" via CORS headers. Setting this configuration tells Firebase Storage to send those headers.
