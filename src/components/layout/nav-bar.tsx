import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/attention", label: "Attention" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/account", label: "Account" },
];

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  const links = isAdmin ? [...LINKS, { href: "/team", label: "Team" }] : LINKS;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <span className="font-semibold">Task Manager</span>
          <div className="flex items-center gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground">{user.email}</span>}
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
