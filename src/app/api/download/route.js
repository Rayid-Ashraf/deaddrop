import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabase";
import { verifyPasskey, fromBase64 } from "@/utils/encryption";

export async function POST(request) {
  try {
    const { name, key } = await request.json();

    // Validate inputs
    if (!name || !key) {
      return NextResponse.json(
        { error: "Name and key are required" },
        { status: 400 }
      );
    }

    // Fetch file metadata
    const { data, error } = await supabase
      .from("metadata")
      .select(
        "file_name, encrypted_verification, salt, iv, verification_IV, download_url, max_downloads, downloads"
      )
      .eq("name", name)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "No file found with this name" },
        { status: 404 }
      );
    }

    const {
      file_name,
      encrypted_verification,
      salt,
      iv,
      verification_IV,
      download_url,
      max_downloads,
      downloads,
    } = data;

    // Convert base64 strings to Uint8Arrays
    const encryptedVerification = fromBase64(encrypted_verification);
    const saltArray = fromBase64(salt);
    const verificationIVArray = fromBase64(verification_IV);
    const ivArray = fromBase64(iv);

    // Verify the passkey
    const isValid = await verifyPasskey(
      key,
      saltArray,
      verificationIVArray,
      encryptedVerification
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid key provided" },
        { status: 401 }
      );
    }

    // Check download limits
    if (downloads >= max_downloads) {
      return NextResponse.json(
        {
          error:
            "This file has been permanently deleted as it exceeded the maximum number of allowed downloads.",
        },
        { status: 410 }
      );
    }

    // Update download count
    const updatedCount = downloads + 1;
    const { error: updateError } = await supabase
      .from("metadata")
      .update({ downloads: updatedCount })
      .eq("name", name);

    if (updateError) {
      console.error("Error updating downloads:", updateError);
    }

    // Download the file
    const response = await fetch(download_url);
    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const arrayBuffer = await response.arrayBuffer();
    const encryptedData = new Uint8Array(arrayBuffer);

    // Return the encrypted data
    return NextResponse.json({
      file_name,
      encrypted_data: Array.from(encryptedData),
      salt: Array.from(saltArray),
      iv: Array.from(ivArray),
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process download" },
      { status: 500 }
    );
  }
}
