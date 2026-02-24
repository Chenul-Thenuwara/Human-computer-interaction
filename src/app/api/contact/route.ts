import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Configure Nodemailer transporter
        // Users will need to set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.SMTP_USER || `"Prism Contact Form" <noreply@prism.com>`,
            to: process.env.CONTACT_EMAIL || "design@prism-furniture.com",
            replyTo: email,
            subject: subject || `New Contact from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h2>New Contact Request</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr />
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        // If no credentials exist (dev mode), just log it to prevent crashing
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("\n[DEV MODE] Captured Contact Email:");
            console.log(mailOptions);
            return NextResponse.json({ success: true, message: "Logged to console (SMTP not configured)" }, { status: 200 });
        }

        // Send actual email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);

        return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });

    } catch (error: any) {
        console.error("API Route Error sending email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
