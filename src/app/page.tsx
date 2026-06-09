import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">WITHH</h1>
        <p className="text-muted-foreground mb-6">Redirecting...</p>
        <Link href="/login" className="text-accent hover:underline">Go to Login</Link>
      </div>
    </div>
  );
}
