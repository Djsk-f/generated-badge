/**
 * Server Actions pour l'authentification.
 *
 * Gère l'inscription et la connexion via Supabase Auth.
 *
 * @module app/(auth)/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const AUTH_ERROR_MESSAGE = "Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.";

function isNetworkError(message: string): boolean {
  return /fetch failed|ECONNREFUSED|ETIMEDOUT|network|failed to fetch/i.test(message);
}

/**
 * Action de connexion.
 *
 * @param prevState - État précédent du formulaire (pour useActionState)
 * @param formData - Données du formulaire (email, password)
 */
export async function login(
  prevState: { error: string } | null,
  formData: FormData
) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { error: "Email et mot de passe requis" };
  }

  let supabase;
  try {
    supabase = await createServerClient();
  } catch {
    return { error: AUTH_ERROR_MESSAGE };
  }

  let result;
  try {
    result = await supabase.auth.signInWithPassword(data);
  } catch {
    return { error: AUTH_ERROR_MESSAGE };
  }

  const { error } = result;

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "Email ou mot de passe incorrect" };
    }
    return { error: isNetworkError(error.message) ? AUTH_ERROR_MESSAGE : error.message };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

/**
 * Action d'inscription.
 */
export async function signup(
  prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis" };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  let supabase;
  try {
    supabase = await createServerClient();
  } catch {
    return { error: AUTH_ERROR_MESSAGE };
  }

  let result;
  try {
    result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
      },
    });
  } catch {
    return { error: AUTH_ERROR_MESSAGE };
  }

  const { error } = result;

  if (error) {
    return { error: isNetworkError(error.message) ? AUTH_ERROR_MESSAGE : error.message };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
