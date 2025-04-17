import React from "react";
import { Server, NoSecurity, Secure } from "@/icons";
export default function HeroText() {
  return (
    <div className="lg:w-[50%]">
      <h1 className="text-[40px] lg:text-5xl font-bold leading-[50px] xl:leading-[64px]">
        Share Files Securely <br className="hidden xl:block" />{" "}
        <span className="xl:hidden">— </span>
        No Signups, No Stress
      </h1>
      <p className="text-white/90 mt-6">
        Deaddrop lets you send files securely and anonymously. Just upload your
        file, give it a name, set a key, and share the name and key — or simply
        send a direct link. It’s that simple.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Server />
          Upload file up to 10 MB for free
        </div>
        <div className="flex items-center gap-2 text-xl font-semibold">
          <NoSecurity />
          No account required — just upload and share
        </div>
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Secure />
          End-to-end encryption for complete security
        </div>
      </div>
    </div>
  );
}
