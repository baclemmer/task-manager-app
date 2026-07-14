import { createClient } from "@/lib/supabase/server";
import { getProfiles } from "@/lib/data/tasks";
import { addUser, removeUser } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user!.id)
    .single();

  if (!currentProfile?.is_admin) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          You don&apos;t have access to this page.
        </CardContent>
      </Card>
    );
  }

  const profiles = await getProfiles();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">Add or remove people who can access this workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addUser} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm">Full name</label>
              <Input name="fullName" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm">Email</label>
              <Input name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm">Temporary password</label>
              <Input name="password" type="text" minLength={6} required />
            </div>
            <Button type="submit">Add user</Button>
          </form>
          <p className="mt-2 text-sm text-muted-foreground">
            Share this password with them yourself (text, Slack, in person) — they can change it after
            logging in.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <div>
                  <p className="font-medium">{profile.full_name ?? profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                {profile.is_admin && <Badge variant="outline">Admin</Badge>}
                {profile.id === user!.id && <Badge variant="secondary">You</Badge>}
              </div>
              <form action={removeUser.bind(null, profile.id)}>
                <Button type="submit" variant="ghost" size="icon" disabled={profile.id === user!.id}>
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
