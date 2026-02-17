# Firebase Custom SMTP Setup (Gmail)

## Requirements:

- Firebase Blaze (pay-as-you-go) plan
- Gmail account with App Password
- Firebase Cloud Functions

## Step 1: Enable Firebase Cloud Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

## Step 2: Install Nodemailer in Functions

```bash
cd functions
npm install nodemailer
```

## Step 3: Set Gmail App Password

1. Go to Google Account: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Generate App Password:
   - Search "App passwords"
   - Select "Mail" and generate
   - Copy the 16-character password

## Step 4: Configure Firebase Functions

Store credentials:

```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
```

## Step 5: Create Cloud Function (functions/index.ts)

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

export const sendPasswordResetEmail = functions.auth
  .user()
  .onCreate(async (user) => {
    const resetLink = `https://your-app.com/reset?email=${user.email}`;

    const mailOptions = {
      from: `Prism Designer <${functions.config().gmail.email}>`,
      to: user.email,
      subject: "Reset Your Password - Prism Designer",
      html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
  });
```

## Step 6: Deploy

```bash
firebase deploy --only functions
```

## Cost Estimate:

- Cloud Functions: ~$0.40 per million invocations
- First 2 million invocations/month are free

## Simpler Alternative (Recommended):

Use Firebase's built-in email delivery - it's free, reliable, and requires zero code:

1. Firebase Console → Authentication → Templates
2. Customize email templates
3. Done!
