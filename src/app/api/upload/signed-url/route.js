import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabase";

export async function POST(request) {
  try {
    const { encryptedFileName } = await request.json();

    if (!encryptedFileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }

    // Generate a signed URL for upload
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUploadUrl(encryptedFileName);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
    });
  } catch (error) {
    console.error("Signed URL generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
