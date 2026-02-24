import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Get all users from Firestore using Admin SDK
    const usersSnapshot = await adminDb.collection("users").get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.displayName || data.email?.split("@")[0] || "Unknown",
        email: data.email || "",
        role: data.role || "user",
        joinedDate: data.createdAt?.toDate?.().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        status: data.status || "active",
        uid: data.uid || doc.id,
      };
    });

    console.log("Fetched users:", users.length);
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to fetch users", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
