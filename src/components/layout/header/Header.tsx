import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4 ">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/img/Logo_Scolitrack.svg"
            alt="logo"
            width={50}
            height={50}
          />
          <p className="text-4xl font-bold">
            Scoli<span className="text-accent">Track</span>
          </p>
        </Link>
      </div>
    </header>
  );
}
