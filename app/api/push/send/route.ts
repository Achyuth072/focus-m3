import { createClient } from "@/lib/supabase/server";
import { webpush } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
      throw new Error("VAPID configuration missing");
    }

    const { userId, title, body, data } = await request.json();
    const targetUserId = userId || currentUser.id;

    const { data: subData, error: subError } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", targetUserId)
      .single();

    if (subError || !subData) {
      return NextResponse.json(
        { error: "User not subscribed or subscription not found" },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: title || "Kanso",
      body: body || "New notification",
      data: data || {},
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await webpush.sendNotification(subData.subscription as any, payload);
    } catch (error: unknown) {
      console.error("Web Push Error:", error);

      const pushError = error as { statusCode?: number };

      // If the subscription is no longer valid, remove it from the database
      if (pushError.statusCode === 410 || pushError.statusCode === 404) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", targetUserId);

        return NextResponse.json(
          { error: "Subscription expired and has been removed" },
          { status: 410 }
        );
      }

      return NextResponse.json(
        { error: "Failed to send push notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Internal Server Error:", error);

    let message = "Internal Server Error";
    if (
      error instanceof Error &&
      error.message === "VAPID configuration missing"
    ) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
