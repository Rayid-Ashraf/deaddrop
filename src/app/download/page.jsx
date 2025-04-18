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
import { supabase } from "@/libs/supabase";
import { useQueryState } from "nuqs";
import axios from "axios";
import AnnouncementBar from "@/components/announcement-bar";
import HeroText from "@/components/text";
import Link from "next/link";

export default function DownloadPage() {
  // Form state
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  // Download progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [queryName, setQueryName] = useQueryState("name");
  const [queryKey, setQueryKey] = useQueryState("key");

  /**
   * Handles the file download process with progress tracking
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
    setStatusMessage("Verifying...");
    setUploadProgress(0);

    try {
      // Fetch file metadata from Supabase
      const { data, error } = await supabase
        .from("metadata")
        .select(
          "file_name, encrypted_verification, salt, iv, verification_IV, download_url"
        )
        .eq("name", name)
        .single();

      if (error || !data) {
        throw new Error("No file found with this name");
      }

      const {
        file_name,
        encrypted_verification,
        salt,
        iv,
        verification_IV,
        download_url,
      } = data;

      // Convert base64 strings to Uint8Arrays
      const encryptedVerification = fromBase64(encrypted_verification);
      const saltArray = fromBase64(salt);
      const verificationIVArray = fromBase64(verification_IV);
      const ivArray = fromBase64(iv);

      // Verify the passkey
      setStatusMessage("Verifying key...");
      const isValid = await verifyPasskey(
        key,
        saltArray,
        verificationIVArray,
        encryptedVerification
      );

      if (!isValid) {
        throw new Error("Invalid key provided");
      }

      // Download the encrypted file with progress tracking
      setStatusMessage("Downloading...");
      const response = await axios.get(download_url, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // Decrypt the file
      setStatusMessage("Decrypting...");
      setUploadProgress(95); // Indicate we're moving to decryption phase

      const encryptedBlob = response.data;
      const encryptedBuffer = await encryptedBlob.arrayBuffer();

      const decryptedBlob = await decryptFile(
        encryptedBuffer,
        key,
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

      // Finalize
      setStatusMessage("Download complete!");
      setUploadProgress(100);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(error.message || "An error occurred during download");
      setStatusMessage("");
      setUploadProgress(0);
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
      <header className="h-16 lg:h-20 xl:px-32 border-b border-white/30 flex justify-between items-center px-4 lg:px-10">
        <Link href="/" passHref>
          <div className="text-4xl font-bold cursor-pointer tracking-tighter">
            <div className="flex items-end">
              DeadDrop
              <span className="text-lg font-normal opacity-90 tracking-normal hidden sm:block">
                .space
              </span>
            </div>
          </div>
        </Link>
        <Link href="/" passHref>
          <button className="bg-white/90 cursor-pointer h-10 rounded-md text-black w-40 font-medium text-lg flex items-center justify-center hover:bg-white transition-colors">
            Upload file
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow my-24 px-4 xl:px-32">
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
                      Key
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
                  style={{ width: `${uploadProgress}%` }}
                  className={`h-full bg-green-400 absolute left-0 rounded-md transition-all duration-300`}
                />
                <span className="group-hover/modal-btn:translate-x-80 z-10 text-xl font-medium text-center transition duration-500">
                  {uploadProgress >= 100
                    ? "Download Complete"
                    : uploadProgress > 0
                    ? `${statusMessage} (${uploadProgress}%)`
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
      <footer className="flex flex-col justify-between items-center xl:px-32 gap-1 pb-2 lg:flex-row lg:px-10">
        <div className="text-lg">
          Designed and developed by{" "}
          <Link href="https://rayid.vercel.app" target="_blank" passHref>
            <span className="underline cursor-pointer hover:text-white/80 transition-colors">
              Rayid
            </span>
          </Link>
        </div>
        <div className="text-lg">
          © {new Date().getFullYear()} Deaddrop. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
