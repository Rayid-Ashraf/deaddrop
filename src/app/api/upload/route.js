import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabase";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const metadataStr = formData.get("metadata");

    // Validate required fields
    if (!file || !metadataStr) {
      return NextResponse.json(
        { error: "File and metadata are required" },
        { status: 400 }
      );
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataStr);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid metadata format" },
        { status: 400 }
      );
    }

    // Check if name already exists
    const { data: existingFiles, error: nameCheckError } = await supabase
      .from("metadata")
      .select("name")
      .eq("name", metadata.name);

    if (nameCheckError) {
      return NextResponse.json(
        { error: "Failed to check existing files" },
        { status: 500 }
      );
    }

    if (existingFiles && existingFiles.length > 0) {
      return NextResponse.json(
        { error: "A file with this name already exists" },
        { status: 409 }
      );
    }

    // Upload file to storage
    const safeName = metadata.name.replace(/[^a-zA-Z0-9-_\.]/g, "_");
    const fileName = `${safeName}.enc`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, file, {
        contentType: "application/octet-stream",
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("files").getPublicUrl(fileName);

    // Insert metadata into database
    const { data: metaData, error: metaError } = await supabase
      .from("metadata")
      .insert([
        {
          name: metadata.name,
          file_name: metadata.file_name,
          file_type: metadata.file_type,
          file_size: metadata.file_size,
          encrypted_verification: metadata.encrypted_verification,
          salt: metadata.salt,
          iv: metadata.iv,
          verification_IV: metadata.verification_IV,
          file_path: fileName,
          download_url: publicUrl,
          expiry_days: metadata.expiry_days,
          max_downloads: metadata.max_downloads,
          downloads: 0,
        },
      ]);

    if (metaError) {
      // If metadata insertion fails, delete the uploaded file
      await supabase.storage.from("files").remove([fileName]);
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        filePath: fileName,
        publicUrl,
        metadata: metaData?.[0] || {
          name: metadata.name,
          file_name: metadata.file_name,
          file_type: metadata.file_type,
          file_size: metadata.file_size,
          file_path: fileName,
          download_url: publicUrl,
          expiry_days: metadata.expiry_days,
          max_downloads: metadata.max_downloads,
          downloads: 0,
        },
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
