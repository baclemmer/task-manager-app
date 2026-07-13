import { NavBar } from "@/components/layout/nav-bar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4">{children}</main>
      <Toaster />
    </div>
  );
}
