import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">"When you can't go alone, we'll go with you."</p>
        <BrandWordmark size="lg" />
        <p className="text-muted-foreground mt-6 mb-6 text-sm">Redirecting...</p>
        <Link href="/login" className="text-accent hover:underline text-sm">Go to Login</Link>
      </div>
    </div>
  );
}
