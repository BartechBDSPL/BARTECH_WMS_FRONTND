import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose items-center text-muted-foreground text-left flex">
          Built and maintained by{" "}
          <Link
            href="https://bartechdata.net"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 ml-1"
          >
            Bartech Data System Pvt. Ltd.
          <Image 
            alt="bartech-logo" 
            src="/images/bartech.png" 
            width={60} 
            height={25} 
            className="ml-2 inline-block dark:bg-white"
          />
          </Link>
        </p>
      </div>
    </div>
  );
}
