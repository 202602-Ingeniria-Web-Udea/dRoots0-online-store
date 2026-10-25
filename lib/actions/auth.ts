"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type AuthState = { error?: string } | undefined;

export async function authenticate(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/home",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password." };
      }
      return { error: "Unable to sign in. Please try again." };
    }

    // Redirects are implemented as thrown errors; let Next.js handle them.
    throw error;
  }
}
