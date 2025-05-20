import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabase";

export async function POST(request) {
  try {
    const metadata = await request.json();

    // Validate required fields
    if (!metadata || !metadata.name || !metadata.file_path) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
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

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("files").getPublicUrl(metadata.file_path);

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
          file_path: metadata.file_path,
          download_url: publicUrl,
          expiry_days: metadata.expiry_days,
          max_downloads: metadata.max_downloads,
          downloads: 0,
        },
      ]);

    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: metaData?.[0],
    });
  } catch (error) {
    console.error("Metadata save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save metadata" },
      { status: 500 }
    );
  }
}
