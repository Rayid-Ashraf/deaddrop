import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabase";

export async function POST(request) {
  try {
    const { name } = await request.json();

    // Validate inputs
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Fetch file metadata
    const { data, error } = await supabase
      .from("metadata")
      .select(
        "file_name, encrypted_verification, salt, iv, verification_IV, file_path, max_downloads, downloads"
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
      file_path,
      max_downloads,
      downloads,
    } = data;

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

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from("files").createSignedUrl(file_path, 60); // URL expires in 60 seconds

    if (signedUrlError) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      file_name,
      encrypted_verification,
      salt,
      iv,
      verification_IV,
    });
  } catch (error) {
    console.error("Signed URL generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
