import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Search className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="max-w-[500px] text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved
          or deleted, or you might have mistyped the URL.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="javascript:history.back()">
            Go Back
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
