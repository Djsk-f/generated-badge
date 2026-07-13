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
  const supabase = await createServerClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { error: "Email et mot de passe requis" };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect"
          : error.message,
    };
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
  const supabase = await createServerClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis" };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || "" },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
