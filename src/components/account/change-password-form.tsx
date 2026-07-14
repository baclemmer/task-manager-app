"use client";

import { useActionState } from "react";
import { changePassword, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = { error: null };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {!state.error && state !== initialState && (
        <p className="text-sm text-green-600">Password updated.</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Update password"}
      </Button>
    </form>
  );
}
