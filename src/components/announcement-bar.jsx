"use client";

import { use, useState } from "react";

export default function AnnouncementBar() {
  const [show, setShow] = useState(false);
  return (
    <div
      className={`bg-white/80 text-black  px-4 py-6  items-center justify-between gap-4  ${
        show ? "flex" : "hidden"
      }`}
    >
      <div>
        <span className="text-lg font-medium">Note:</span> All files uploaded
        before <span className="font-semibold">15/04/2025</span> have been
        permanently deleted. We sincerely apologize for any inconvenience this
        may cause.
      </div>
      <div>
        <button
          onClick={() => setShow(false)}
          className="text-black text-xl font-bold px-2 cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  );
}
