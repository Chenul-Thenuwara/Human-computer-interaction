import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, status } = body;

    if (!uid || !status) {
      return NextResponse.json(
        { error: "Missing required fields: uid and status" },
        { status: 400 }
      );
    }

    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    // Update user status in Firestore using Admin SDK
    await adminDb.collection("users").doc(uid).update({
      status,
    });

    return NextResponse.json(
      { success: true, message: "User status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
