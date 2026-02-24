import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return NextResponse.json(
        { error: "Missing required fields: uid and role" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'user'" },
        { status: 400 }
      );
    }

    // Update user role in Firestore using Admin SDK
    await adminDb.collection("users").doc(uid).update({
      role,
    });

    return NextResponse.json(
      { success: true, message: "User role updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
