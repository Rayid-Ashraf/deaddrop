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
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Handles the file download process
  const handleDownload = async () => {
    // Validate inputs
    if (!name) {
      toast.error("Please enter a name");
      return;
    }
    if (!key) {
      toast.error("Please enter a key");
      return;
    }

    setIsDownloading(true);
    setIsCompleted(false);
    setDownloadProgress(0);

    try {
      // Get signed URL and metadata
      const response = await fetch("/api/download/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const {
        signedUrl,
        file_name,
        encrypted_verification,
        salt,
        iv,
        verification_IV,
      } = await response.json();

      // Verify the key on client side
      const encryptedVerification = fromBase64(encrypted_verification);
      const saltArray = fromBase64(salt);
      const verificationIVArray = fromBase64(verification_IV);
      const ivArray = fromBase64(iv);

      const isValid = await verifyPasskey(
        key,
        saltArray,
        verificationIVArray,
        encryptedVerification
      );

      if (!isValid) {
        throw new Error("Invalid key provided");
      }

      // Update download count after successful verification
      const updateCountResponse = await fetch("/api/download/update-count", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
        }),
      });

      if (!updateCountResponse.ok) {
        const error = await updateCountResponse.json();
        throw new Error(error.error || "Failed to update download count");
      }

      // Download file using Fetch API with streaming
      const downloadResponse = await fetch(signedUrl);

      if (!downloadResponse.ok) {
        throw new Error("Download failed");
      }

      // Get the content length for progress tracking
      const contentLength = downloadResponse.headers.get("content-length");
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      // Create a TransformStream to track progress
      const progressStream = new TransformStream({
        transform(chunk, controller) {
          loaded += chunk.length;
          const progress = (loaded / total) * 99; // Cap at 99%
          setDownloadProgress(Math.round(progress));
          controller.enqueue(chunk);
        },
      });

      // Pipe the response through our progress tracking stream
      const stream = downloadResponse.body.pipeThrough(progressStream);

      // Read the stream into an ArrayBuffer
      const reader = stream.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const encryptedBuffer = await new Blob(chunks).arrayBuffer();

      // Decrypt the file
      const decryptedBlob = await decryptFile(
        encryptedBuffer,
        key,
        saltArray,
        ivArray
      );

      // Set progress to 100% after decryption is complete
      setDownloadProgress(100);

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
    // Parse URL fragment
    const hash = window.location.hash.substring(1); // Remove the # character
    const params = new URLSearchParams(hash);

    const nameParam = params.get("name");
    const keyParam = params.get("key");

    if (nameParam && keyParam) {
      const safeName = decodeURIComponent(nameParam);
      const safeKey = decodeURIComponent(keyParam);
      const decryptedKey = decryptPasskey(safeKey);
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
                <div
                  style={{ width: `${downloadProgress}%` }}
                  className={`h-full absolute left-0 rounded-md bg-green-400 transition-all duration-300`}
                />
                <span className="group-hover/modal-btn:translate-x-80 z-10 text-xl font-medium text-center transition duration-500">
                  {isCompleted
                    ? "Downloaded successfully"
                    : isDownloading
                    ? `Downloading ${downloadProgress}%`
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
