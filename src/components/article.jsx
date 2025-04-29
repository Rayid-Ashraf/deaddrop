import Link from "next/link";
import React from "react";

export default function Article({ id, title, date }) {
  return (
    <Link href={`http://localhost:3000/article/${id}`} passHref>
      <div className=" flex justify-between flex-col md:flex-row gap-2 text-xl mt-6 border-b-2 border-dashed cursor-pointer hover:border-white/60 hover-transition  border-white/20 pb-2">
        <div className="opacity-95">{title}</div>
        <div className="opacity-50 text-nowrap">{date}</div>
      </div>
    </Link>
  );
}
