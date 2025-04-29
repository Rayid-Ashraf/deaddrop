import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col mt-20 lg:mt-24 justify-between items-center text-white/60 xl:px-32 gap-1 pb-2 lg:flex-row lg:px-10">
      <div className="text-lg">
        Designed and developed by{" "}
        <Link href="https://rayid.vercel.app" target="_blank" passHref>
          <span className="underline cursor-pointer hover:text-white transition-colors">
            Rayid
          </span>
        </Link>
      </div>
      <div className="text-lg">
        © {new Date().getFullYear()} Deaddrop. All rights reserved.
      </div>
    </footer>
  );
}
