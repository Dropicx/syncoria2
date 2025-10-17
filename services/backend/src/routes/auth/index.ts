import { emailSchema } from "@/validators";
import { clerkClient } from "@call/auth/auth";
import { db } from "@call/db";
import { user as userTable } from "@call/db/schema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import { z } from "zod";
import type { ReqVariables } from "../../index.js";
import { createId } from "@paralleldrive/cuid2";
import { cache } from "@/lib/cache";
import { Webhook } from "svix";
import { env } from "../../config/env.js";

const authRouter = new Hono<{ Variables: ReqVariables }>();

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

authRouter.post(
  "/check-email",
  zValidator("json", emailSchema),
  async (c: Context) => {
    try {
      const { email } = await c.req.json<{ email: string }>();

      const existingUser = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, email.toLowerCase().trim()))
        .limit(1);

      return c.json({ exists: existingUser.length > 0 });
    } catch (error) {
      console.error("Error checking email:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// Clerk webhook for user synchronization
authRouter.post("/webhook", async (c: Context) => {
  try {
    const payload = await c.req.text();
    const headers = c.req.header();
    
    const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);
    const evt = webhook.verify(payload, {
      "svix-id": headers["svix-id"] || "",
      "svix-timestamp": headers["svix-timestamp"] || "",
      "svix-signature": headers["svix-signature"] || "",
    });

    const { type, data } = evt;

    if (type === "user.created") {
      const clerkUser = data;
      const userId = createId();
      
      await db.insert(userTable).values({
        id: userId,
        clerkId: clerkUser.id,
        name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || "User",
        email: clerkUser.email_addresses[0]?.email_address || "",
        emailVerified: clerkUser.email_addresses[0]?.verification?.status === "verified",
        image: clerkUser.image_url,
        createdAt: new Date(clerkUser.created_at),
        updatedAt: new Date(clerkUser.updated_at),
      });
    } else if (type === "user.updated") {
      const clerkUser = data;
      
      await db
        .update(userTable)
        .set({
          name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || "User",
          email: clerkUser.email_addresses[0]?.email_address || "",
          emailVerified: clerkUser.email_addresses[0]?.verification?.status === "verified",
          image: clerkUser.image_url,
          updatedAt: new Date(clerkUser.updated_at),
        })
        .where(eq(userTable.clerkId, clerkUser.id));
    } else if (type === "user.deleted") {
      const clerkUser = data;
      
      await db
        .delete(userTable)
        .where(eq(userTable.clerkId, clerkUser.id));
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: "Webhook failed" }, 500);
  }
});

authRouter.patch("/update-profile", async (c) => {
  const clerkUser = c.get("user");
  if (!clerkUser) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { message: result.error.errors[0]?.message || "Invalid input" },
        400
      );
    }

    const { name } = result.data;

    // Update user in Clerk
    await clerkClient.users.updateUser(clerkUser.id, {
      firstName: name.split(" ")[0] || "",
      lastName: name.split(" ").slice(1).join(" ") || "",
    });

    // Update user in database
    await db
      .update(userTable)
      .set({ name, updatedAt: new Date() })
      .where(eq(userTable.clerkId, clerkUser.id));

    // Invalidate user-related caches
    await cache.invalidateUserCache(clerkUser.id);

    return c.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("[PATCH /update-profile] Error:", err);
    return c.json({ message: "An unexpected error occurred" }, 500);
  }
});

// Handle profile image upload
authRouter.patch("/update-profile-image", async (c) => {
  const clerkUser = c.get("user");
  if (!clerkUser) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const formData = await c.req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return c.json({ message: "No image provided" }, 400);
    }

    // Validate file type
    if (!image.type.startsWith("image/")) {
      return c.json({ message: "File must be an image" }, 400);
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return c.json({ message: "Image size must be less than 5MB" }, 400);
    }

    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${image.type};base64,${base64}`;

    // Update user profile image in Clerk
    await clerkClient.users.updateUserProfileImage(clerkUser.id, {
      file: new File([buffer], image.name, { type: image.type }),
    });

    // Update user profile with the new image in database
    await db
      .update(userTable)
      .set({
        image: dataUrl,
        updatedAt: new Date(),
      })
      .where(eq(userTable.clerkId, clerkUser.id));

    // Invalidate user-related caches
    await cache.invalidateUserCache(clerkUser.id);

    return c.json({
      message: "Profile image updated successfully",
      image: dataUrl,
    });
  } catch (err) {
    console.error("[PATCH /update-profile-image] Error:", err);
    return c.json({ message: "An unexpected error occurred" }, 500);
  }
});

export default authRouter;
