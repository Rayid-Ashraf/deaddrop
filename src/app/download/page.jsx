"use client";

import { useState, useEffect } from "react";
import { Rocket } from "@/icons";
import { Toaster, toast } from "sonner";
import {
  verifyPasskey,
  decryptFile,
  fromBase64,
  decryptPasskey,
} from "@/utils/encryption";
import { useQueryState } from "nuqs";
import axios from "axios";
import AnnouncementBar from "@/components/announcement-bar";
import HeroText from "@/components/text";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function DownloadPage() {
  // Form state
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  // Download progress state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [queryName, setQueryName] = useQueryState("name");
  const [queryKey, setQueryKey] = useQueryState("key");

  /**
   * Handles the file download process
   */
  const handleDownload = async () => {
    // Validate inputs
    if (!name && !queryName) {
      toast.error("Please enter a name");
      return;
    }
    if (!key && !queryKey) {
      toast.error("Please enter a key");
      return;
    }

    setIsDownloading(true);
    setIsCompleted(false);

    try {
      // Start the download process
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || queryName,
          key: key || queryKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const data = await response.json();

      // Decrypt the file
      const { file_name, encrypted_data, salt, iv } = data;
      const encryptedBuffer = new Uint8Array(encrypted_data).buffer;
      const saltArray = new Uint8Array(salt);
      const ivArray = new Uint8Array(iv);

      const decryptedBlob = await decryptFile(
        encryptedBuffer,
        key || queryKey,
        saltArray,
        ivArray
      );

      // Create download link and trigger download
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file_name;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!");
      setIsCompleted(true);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(error.message || "An error occurred during download");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (queryName && queryKey) {
      const safeName = decodeURIComponent(queryName);
      const safeQueryKey = decodeURIComponent(queryKey);
      const decryptedKey = decryptPasskey(safeQueryKey);
      setName(safeName);
      setKey(decryptedKey);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <AnnouncementBar />

      {/* Header */}
      <Header page="download" />

      {/* Main Content */}
      <main className="flex-grow mt-24 px-4 xl:px-32">
        <div className="flex flex-col items-center justify-between gap-20 xl:gap-28 max-w-[480px] m-auto lg:flex-row lg:max-w-none lg:h-[68vh]">
          {/* Download Form Section */}
          <div className="flex lg:w-[50%] border-dashed-svg rounded-3xl p-5 m-auto w-full max-w-[440px] h-[480px] duration-200 bg-[#101010]">
            <div className="flex w-full items-center flex-col pb-7 justify-between">
              <div className="w-full">
                <h2 className="text-2xl text-white/90 text-center font-semibold">
                  Download
                </h2>
                <div className="w-full mt-10 flex flex-col gap-5">
                  <div className="flex flex-col w-full">
                    <label htmlFor="name" className="text-white/90">
                      Name
                    </label>
                    <input
                      className="h-12 rounded-lg border bg-black text-lg border-white/20 px-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter file name"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="key" className="text-white/90">
                      Password
                    </label>
                    <input
                      className="h-12 rounded-lg border bg-black text-lg border-white/20 px-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      id="key"
                      name="key"
                      type="password"
                      placeholder="Enter passkey"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-4 py-2 rounded-md text-center relative overflow-hidden cursor-pointer bg-white/90 text-black h-12 items-center w-full flex justify-center group/modal-btn disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="group-hover/modal-btn:translate-x-80 z-10 text-xl font-medium text-center transition duration-500">
                  {isCompleted
                    ? "Downloaded successfully"
                    : isDownloading
                    ? "Downloading..."
                    : "Download"}
                </span>
                <div className="-translate-x-80 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                  <Rocket />
                </div>
              </button>
            </div>
          </div>

          {/* Information Section */}
          <HeroText />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
