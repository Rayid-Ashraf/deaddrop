"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { encryptFile, toBase64 } from "@/utils/encryption";
import { supabase } from "@/libs/supabase";
import { NoSecurity, Rocket, Secure, Server, Upload } from "@/icons";
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

import axios from "axios";

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
    if (files.length > 0) {
      handleFile(files[0]);
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

    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);
    setName(file.name);
  };

  /**
   * Checks if a file with the given name already exists in the database
   * @param {string} name - The name to check
   * @returns {Promise<boolean>} - Whether the name exists
   */
  const checkNameExists = async (name) => {
    try {
      const { data, error } = await supabase
        .from("metadata")
        .select("name")
        .eq("name", name);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking if name exists:", error);
      throw error;
    }
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
      // Check if name already exists
      const nameExists = await checkNameExists(name);
      if (nameExists) {
        toast.error("A file with this name already exists.");
        setIsUploading(false);
        return;
      }

      // Encrypt the file
      const { encryptedFile, encryptedVerification, salt, iv, verificationIV } =
        await encryptFile(selectedFile, key);

      // Upload the encrypted file
      const uploadResult = await uploadFile(
        encryptedFile,
        "files",
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (!uploadResult.success) throw new Error(uploadResult.error);

      // Get public URL for the uploaded file
      const publicUrl = supabase.storage
        .from("files")
        .getPublicUrl(uploadResult.filePath).data?.publicUrl;

      // Insert file metadata into database
      const metaResult = await insertFileData(
        encryptedVerification,
        salt,
        iv,
        verificationIV,
        uploadResult.filePath,
        publicUrl
      );

      if (!metaResult.success) throw new Error(metaResult.error);

      // Generate and show share link
      const generatedShareLink = `https://updo.vercel.app/download?name=${name}&key=${key}`;
      setShareLink(generatedShareLink);
      setShowShareDialog(true);

      console.log("Upload complete:", uploadResult.filePath);
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

  /**
   * Inserts file metadata into the database
   * @param {Uint8Array} encryptedVerification - Verification data
   * @param {Uint8Array} salt - Encryption salt
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} verificationIV - Verification IV
   * @param {string} filePath - Path to the stored file
   * @param {string} downloadUrl - Public download URL
   * @returns {Promise<{success: boolean, error?: string, data?: any}>} - Result of the operation
   */
  const insertFileData = async (
    encryptedVerification,
    salt,
    iv,
    verificationIV,
    filePath,
    downloadUrl
  ) => {
    try {
      const { data, error } = await supabase.from("metadata").insert([
        {
          name: name,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          encrypted_verification: toBase64(encryptedVerification),
          salt: toBase64(salt),
          iv: toBase64(iv),
          verification_IV: toBase64(verificationIV),
          file_path: filePath,
          download_url: downloadUrl,
          expiry_days: expiryDays,
        },
      ]);

      if (error) {
        console.error("Error inserting file data:", error.message);
        return { success: false, error: error.message };
      }

      console.log("File data inserted successfully:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Uploads a file to Supabase storage with progress tracking
   * @param {File} file - The file to upload
   * @param {string} bucketName - The storage bucket name
   * @param {function} onProgress - Progress callback
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>} - Upload result
   */
  const uploadFile = async (file, bucketName, onProgress) => {
    try {
      const safeName = name.replace(/[^a-zA-Z0-9-_\.]/g, "_");
      const fileName = `${safeName}.enc`;

      // Check if file already exists in storage
      const { data: existingFiles, error: existingError } =
        await supabase.storage.from(bucketName).list("", { search: fileName });

      if (existingError) throw existingError;

      if (existingFiles?.some((f) => f.name === fileName)) {
        return {
          success: false,
          error: "A file with this name already exists in storage",
        };
      }

      // Get a signed upload URL from Supabase
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage.from(bucketName).createSignedUploadUrl(fileName);

      if (signedUrlError) throw signedUrlError;

      // Upload using axios with progress tracking
      await axios.put(signedUrlData.signedUrl, file, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
      });

      return { success: true, filePath: fileName };
    } catch (error) {
      console.error("Upload Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="h-16 lg:h-20 xl:px-32 border-b border-white/30 flex justify-between items-center px-4 lg:px-10">
        <div className="text-4xl font-bold tracking-tighter">UPDO</div>
        <a
          href="/download"
          className="bg-white/90 cursor-pointer h-10 rounded-md text-black w-40 font-medium text-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          Download file
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-grow my-24 px-6 xl:px-32">
        <div className="flex flex-col items-center justify-between gap-20 xl:gap-28 max-w-[480px] m-auto lg:flex-row lg:max-w-none lg:h-[68vh]">
          {/* File Upload Section */}
          <div
            className={`flex lg:w-[50%] border-dashed-svg rounded-3xl p-6 m-auto w-full max-w-[440px] h-[480px] transition-colors duration-200 ${
              isDragging ? "bg-[#202020]" : "bg-[#101010]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                        Key
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
                        <SelectTrigger className="w-[100px] cursor-pointer !bg-black">
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
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-md text-center relative overflow-hidden !bg-white/90 cursor-pointer  text-black h-12 items-center w-full flex justify-center group/modal-btn disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className={`h-full bg-green-400 absolute left-0 rounded-md transition-all duration-300`}
                  />
                  <span className="group-hover/modal-btn:translate-x-80 z-10  text-xl font-medium text-center transition duration-500">
                    {uploadProgress === 100
                      ? "Upload Complete"
                      : uploadProgress
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
          <div className="lg:w-[50%]">
            <h1 className="text-5xl font-bold leading-[50px] xl:leading-[64px]">
              Access your Files <br className="hidden xl:block" />
              Anytime, Anywhere
            </h1>
            <p className="text-white/90 mt-6">
              With Updo, securely upload your files to the cloud and access them
              easily from any device. Simply assign a name and key to your file,
              and retrieve it whenever needed by entering those details in your
              browser.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <Server />
                Upload file up to {MAX_FILE_SIZE_MB} MB for free
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
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col justify-between items-center xl:px-32 gap-1 pb-2 lg:flex-row lg:px-10">
        <div className="text-lg">
          Designed and developed by{" "}
          <a
            href="rayid.vercel.app"
            target="_blank"
            className="underline cursor-pointer hover:text-white/80 transition-colors"
          >
            Rayid
          </a>
        </div>
        <div className="text-lg">
          © {new Date().getFullYear()} Updo. All rights reserved.
        </div>
      </footer>

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
