"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/icons";

export default function Header({ page }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <header
        className={`h-20 lg:h-20 xl:px-32 border-b  flex justify-between items-center px-4 lg:px-10 transition-all duration-500 ease-in-out ${
          isMenuOpen ? "border-white/0" : "border-white/30"
        }`}
      >
        <Link href="/" passHref>
          <div className="flex items-center gap-2">
            <Logo />
            <div className="font-bold text-xl leading-tight sm:text-3xl tracking-tight">
              DeadDrop
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between gap-12">
          <div className="flex items-center">
            <Link href="/">
              <div
                className={`pr-12 transition-all duration-300 ease-in-out hover:opacity-100 ${
                  page === "home" || page === "upload" || page == "download"
                    ? "opacity-100 font-medium"
                    : "opacity-70"
                }`}
              >
                Home
              </div>
            </Link>
            <Link href="/about">
              <div
                className={`pr-12 transition-all duration-300 ease-in-out hover:opacity-100 ${
                  page === "about"
                    ? "opacity-100 text-white font-medium"
                    : "opacity-80"
                }`}
              >
                About
              </div>
            </Link>
            {/* <Link href="./">
              <div
                className={`pr-12 transition-all duration-300 ease-in-out hover:opacity-100 ${
                  page === "articles" ? "opacity-100 font-medium" : "opacity-80"
                }`}
              >
                Articles
              </div>
            </Link> */}
          </div>

          {page == "upload" ? (
            <Link href="/download" passHref>
              <button className="bg-white/90 cursor-pointer h-10 rounded-md text-black w-40 font-medium text-lg flex items-center justify-center hover:bg-white transition-colors">
                Download file
              </button>
            </Link>
          ) : (
            <Link href="/" passHref>
              <button className="bg-white/90 cursor-pointer h-10 rounded-md text-black w-40 font-medium text-lg flex items-center justify-center hover:bg-white transition-colors">
                Upload file
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          {page == "upload" ? (
            <Link href="/download" passHref>
              <button className="bg-white/90 cursor-pointer h-10 rounded-md text-black w-32 font-medium  flex items-center justify-center hover:bg-white transition-colors mr-2">
                Download file
              </button>
            </Link>
          ) : (
            <Link href="/" passHref>
              <button className="bg-white/90 cursor-pointer h-10 rounded-md text-black w-32 font-medium  flex items-center justify-center hover:bg-white transition-colors mr-2">
                Upload file
              </button>
            </Link>
          )}
          <button
            onClick={toggleMenu}
            className="p-2 focus:outline-none transition-transform cursor-pointer duration-500 ease-in-out"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 transition-transform duration-500 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown with Smooth Transition */}
      <div
        className={`md:hidden bg-black/95 border-b border-white/30 overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col py-4 px-4">
          <Link href="/">
            <div
              className={`py-3 transition-all duration-300 ease-in-out hover:opacity-100 ${
                page === "home" || page === "upload" || page === "download"
                  ? "opacity-100 font-medium"
                  : "opacity-70"
              }`}
              onClick={toggleMenu}
            >
              Home
            </div>
          </Link>
          <Link href="/about">
            <div
              className={`py-3 transition-all duration-300 ease-in-out hover:opacity-100 ${
                page === "about"
                  ? "opacity-100 text-white font-medium"
                  : "opacity-80"
              }`}
              onClick={toggleMenu}
            >
              About
            </div>
          </Link>
          {/* <Link href="./">
            <div
              className={`py-3 transition-all duration-300 ease-in-out hover:opacity-100 ${
                page === "articles" ? "opacity-100 font-medium" : "opacity-80"
              }`}
              onClick={toggleMenu}
            >
              Articles
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
