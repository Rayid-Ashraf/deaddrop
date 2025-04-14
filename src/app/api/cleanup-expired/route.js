import { supabase } from "@/libs/supabase";

export async function GET(request) {
  const now = new Date();

  // 1. Fetch all files from "metadata" table
  const { data: files, error } = await supabase.from("metadata").select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const expiredFiles = files.filter((file) => {
    const createdAt = new Date(file.created_at);
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(createdAt.getDate() + file.expiry_days);
    return now > expiryDate;
  });

  for (const file of expiredFiles) {
    // 2. Delete from Supabase Storage (bucket: 'files')
    await supabase.storage.from("files").remove([file.file_path]);

    // 3. Delete metadata from "metadata" table
    await supabase.from("metadata").delete().eq("name", file.name);
  }

  return new Response(JSON.stringify({ deleted: expiredFiles.length }), {
    status: 200,
  });
}
