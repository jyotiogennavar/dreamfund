import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className="flex flex-col gap-4 items-center justify-center">
      <h1>Dreamfund</h1>
      <p>Build your dreams with deadlines </p>
    </div>
    <Button>
      <Link href="/login">Login</Link>
    </Button>
    </>
  );
}
