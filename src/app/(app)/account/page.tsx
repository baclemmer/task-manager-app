import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/account/change-password-form";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update the password you use to log in.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
