"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { encryptFile, encryptPasskey, toBase64 } from "@/utils/encryption";
import { Rocket, Upload } from "@/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import axios from "axios";
import AnnouncementBar from "@/components/announcement-bar";
import HeroText from "@/components/text";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Constants for validation
const MIN_NAME_LENGTH = 10;
const MIN_KEY_LENGTH = 8;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadFile() {
  // State for drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);

  // State for file information
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileType, setFileType] = useState("");

  // State for form inputs
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [maxDownloads, setMaxDownloads] = useState(100000);

  // State for upload process
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState("");

  /**
   * Handles drag over event for the drop zone
   * @param {React.DragEvent} e - The drag event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handles drag leave event for the drop zone
   * @param {React.DragEvent} e - The drag event
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handles file drop event
   * @param {React.DragEvent} e - The drag event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length == 1) {
      handleFile(files[0]);
    } else if (files.length > 1) {
      toast.error(
        "Multiple files not supported. Please paste one file at a time."
      );
      return;
    }
  };

  /**
   * Handles file paste event
   * @param {React.ClipboardEvent} e - The paste event
   */
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (
        items[i].type.indexOf("image") !== -1 ||
        items[i].type.indexOf("file") !== -1
      ) {
        const file = items[i].getAsFile();
        if (file) {
          handleFile(file);
          break;
        }
      }
    }
  };

  /**
   * Handles file selection via input
   * @param {React.ChangeEvent} e - The change event from file input
   */
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  /**
   * Validates and processes the selected file
   * @param {File} file - The file to process
   */
  const handleFile = (file) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    console.log(file);

    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);
    setName(file.name);
  };

  /**
   * Handles the file upload process
   */
  const handleUpload = async () => {
    // Validate inputs
    if (!name || name.length < MIN_NAME_LENGTH) {
      toast.error(
        `Please enter a valid name (minimum ${MIN_NAME_LENGTH} characters)`
      );
      return;
    }

    if (!key || key.length < MIN_KEY_LENGTH) {
      toast.error(`Key must be at least ${MIN_KEY_LENGTH} characters long`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Encrypt the file
      const { encryptedFile, encryptedVerification, salt, iv, verificationIV } =
        await encryptFile(selectedFile, key);

      // Generate a safe file name
      const safeFileName = name.replace(/[^a-zA-Z0-9-_\.]/g, "_");
      const encryptedFileName = `${safeFileName}.enc`;

      // Get signed URL for upload
      const signedUrlResponse = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ encryptedFileName }),
      });

      if (!signedUrlResponse.ok) {
        const error = await signedUrlResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { signedUrl, path } = await signedUrlResponse.json();

      // Upload file using XMLHttpRequest to track progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 99; // Cap at 99%
            setUploadProgress(Math.round(progress));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload aborted"))
        );

        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(encryptedFile);
      });

      // Save metadata
      const metadataResponse = await fetch("/api/upload/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          encrypted_verification: toBase64(encryptedVerification),
          salt: toBase64(salt),
          iv: toBase64(iv),
          verification_IV: toBase64(verificationIV),
          file_path: path,
          expiry_days: expiryDays,
          max_downloads: maxDownloads,
        }),
      });

      if (!metadataResponse.ok) {
        const error = await metadataResponse.json();
        throw new Error(error.error || "Failed to save metadata");
      }

      // Set progress to 100% only after metadata is saved successfully
      setUploadProgress(100);

      // Generate and show share link
      const encryptedKey = encryptPasskey(key);
      const safeEncryptedKey = encodeURIComponent(encryptedKey);
      const safeName = encodeURIComponent(name);

      const generatedShareLink = `https://deaddrop.space/download?name=${safeName}&key=${safeEncryptedKey}`;
      setShareLink(generatedShareLink);
      setShowShareDialog(true);
    } catch (error) {
      toast.error("Upload failed: " + error.message);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Copies the share link to clipboard
   */
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <AnnouncementBar />

      {/* Header */}
      <Header page="upload" />

      {/* Main Content */}
      <main className="flex-grow mt-24 px-4 xl:px-32">
        <div className="flex flex-col items-center justify-between gap-20 xl:gap-28 max-w-[480px] m-auto lg:flex-row lg:max-w-none lg:h-[68vh]">
          {/* File Upload Section */}
          <div
            className={`flex lg:w-[50%] border-dashed-svg rounded-3xl p-5 m-auto w-full max-w-[440px] h-[480px] transition-colors duration-200 ${
              isDragging ? "bg-[#202020]" : "bg-[#101010]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
          >
            {!selectedFile ? (
              // Stage 1 - File Selection
              <div className="flex justify-center items-center w-full">
                <div className="flex flex-col items-center bg-transparent gap-5">
                  <div className="bg-transparent flex flex-col gap-3.5 items-center font-medium text-xl">
                    <Upload />
                    Drop the file
                  </div>
                  <div className="bg-transparent text-white/40">or</div>
                  <label
                    htmlFor="file"
                    className="w-[260px] bg-white text-black font-medium flex items-center justify-center text-lg h-12 rounded-md cursor-pointer hover:bg-white/90 transition-colors"
                  >
                    click to select
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    multiple={false}
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
              </div>
            ) : (
              // Stage 2 - File Upload Form
              <div className="flex w-full items-center flex-col pb-4 justify-between">
                <div className="w-full">
                  <h2 className="text-2xl text-white/90 text-center font-semibold">
                    UPLOAD
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
                        placeholder={`Minimum ${MIN_NAME_LENGTH} characters`}
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
                        placeholder={`Minimum ${MIN_KEY_LENGTH} characters`}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center  justify-between text-lg">
                    Delete after
                    <div>
                      <Select
                        value={expiryDays.toString()}
                        onValueChange={(value) =>
                          setExpiryDays(parseInt(value))
                        }
                      >
                        {" "}
                        <SelectTrigger className="w-[112px] cursor-pointer !bg-black">
                          <SelectValue placeholder="30 days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="15">15 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-lg">
                    Maximum downloads
                    <div>
                      <Select
                        value={maxDownloads.toString()}
                        onValueChange={(value) =>
                          setMaxDownloads(parseInt(value))
                        }
                      >
                        {" "}
                        <SelectTrigger className="w-[112px] cursor-pointer !bg-black">
                          <SelectValue placeholder="Unlimited downloads" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="1000">1000</SelectItem>
                          <SelectItem value="100000">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-md text-center relative overflow-hidden !bg-white/90 cursor-pointer  text-black h-12 items-center w-full flex justify-center group/modal-btn disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className={`h-full absolute left-0 rounded-md bg-green-400 transition-all duration-300`}
                  />
                  <span className="group-hover/modal-btn:translate-x-80 z-10  text-xl font-medium text-center transition duration-500">
                    {uploadProgress === 100
                      ? "Uploaded successfully"
                      : isUploading
                      ? `Uploading ${uploadProgress}%`
                      : "Upload"}
                  </span>
                  <div className="-translate-x-80 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                    <Rocket />
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Information Section */}
          <HeroText />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>File uploaded successfully!</DialogTitle>
            <DialogDescription>
              You can share this file with others
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" value={shareLink} readOnly />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3 cursor-pointer"
              onClick={copyShareLink}
            >
              <span className="sr-only">Copy</span>
              <Copy />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                className="cursor-pointer"
                variant="secondary"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
