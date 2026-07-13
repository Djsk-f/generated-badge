"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { login, signup } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { INPUT_CLASSES } from "@/components/ui/input";

type Tab = "login" | "signup";

export function AuthModal({
  open,
  onClose,
  defaultTab = "login",
}: {
  open: boolean;
  onClose: () => void;
  defaultTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">

          {/* Close */}
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Dialog.Close>

          {/* Header */}
          <div className="px-8 pt-8 pb-0 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--gradient-primary)" }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Dialog.Title className="text-xl font-semibold text-gray-900 tracking-tight">
              {tab === "login" ? "Bienvenue" : "Créer un compte"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mt-1.5">
              {tab === "login"
                ? "Connectez-vous pour continuer"
                : "Commencez à générer des badges"}
            </Dialog.Description>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mt-6 mb-0 bg-gray-100/80 rounded-lg p-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                tab === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                tab === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          {/* Forms */}
          <div className="p-8">
            {tab === "login" ? <LoginForm /> : <SignupForm />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="modal-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={INPUT_CLASSES}
          placeholder="vous@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          id="modal-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={INPUT_CLASSES}
          placeholder="••••••••"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        fullWidth
        loading={isPending}
        className="mt-2"
      >
        Se connecter
      </Button>
    </form>
  );
}

function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="modal-fullname" className="block text-sm font-medium text-gray-700">
          Nom complet
        </label>
        <input
          id="modal-fullname"
          name="full_name"
          type="text"
          autoComplete="name"
          className={INPUT_CLASSES}
          placeholder="Jean Dupont"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="modal-signup-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="modal-signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={INPUT_CLASSES}
          placeholder="vous@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="modal-signup-password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          id="modal-signup-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          className={INPUT_CLASSES}
          placeholder="6 caractères minimum"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        fullWidth
        loading={isPending}
        className="mt-2"
      >
        Créer mon compte
      </Button>
    </form>
  );
}
