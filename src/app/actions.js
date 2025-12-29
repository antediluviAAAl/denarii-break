"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// 1. Helper: Create a Supabase client that can read your cookies
function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) {}, 
        remove(name, options) {},
      },
    }
  );
}

// 2. Helper: Upload a single file to ImgBB
async function uploadToImgBB(file) {
  if (!file || file.size === 0) return null;

  const formData = new FormData();
  formData.append("image", file);
  
  // Note: Ensure IMGBB_API_KEY is in your .env.local file
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data.success) throw new Error("ImgBB Upload Failed: " + (data.error?.message || "Unknown error"));
  
  return {
    url: data.data.url,
    medium: data.data.medium?.url,
    thumb: data.data.thumb?.url,
    delete_url: data.data.delete_url
  };
}

// 3. The Main Action
export async function addCoinToCollection(formData) {
  const supabase = createClient();

  // A. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: Please log in first." };
  }

  const coinId = formData.get("coin_id");
  const obverseFile = formData.get("obverse");
  const reverseFile = formData.get("reverse");

  try {
    // B. Upload Images to ImgBB (Parallel)
    const [obverseData, reverseData] = await Promise.all([
      uploadToImgBB(obverseFile),
      uploadToImgBB(reverseFile),
    ]);

    // C. Insert into DB (User ID is auto-handled by RLS default)
    const { error } = await supabase
      .from("d_coins_owned")
      .upsert({
        coin_id: coinId,
        user_id: user.id, // Explicitly link to you
        url_obverse: obverseData?.url || null,
        medium_url_obverse: obverseData?.medium || obverseData?.url || null,
        thumb_url_obverse: obverseData?.thumb || obverseData?.url || null,
        delete_url_obverse: obverseData?.delete_url || null,

        url_reverse: reverseData?.url || null,
        medium_url_reverse: reverseData?.medium || reverseData?.url || null,
        thumb_url_reverse: reverseData?.thumb || reverseData?.url || null,
        delete_url_reverse: reverseData?.delete_url || null,
      });

    if (error) throw new Error(error.message);

    // D. Refresh the UI
    revalidatePath("/"); 
    return { success: true, message: "Coin successfully added to vault." };

  } catch (err) {
    console.error("Server Action Error:", err);
    return { success: false, error: err.message };
  }
}