/* src/app/actions.js */
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper: Upload a single file to ImgBB
async function uploadToImgBB(file) {
  if (!file || file.size === 0) return null;

  const formData = new FormData();
  formData.append("image", file);
  
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

export async function addCoinToCollection(formData) {
  // 1. Initialize Cookies & Supabase
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Context might be read-only in Server Actions
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Context might be read-only in Server Actions
          }
        },
      },
    }
  );

  // 2. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: Please log in first." };
  }

  // 3. Extract Data
  const coinId = formData.get("coin_id");
  const obverseFile = formData.get("obverse");
  const reverseFile = formData.get("reverse");
  const pathObverse = formData.get("path_obverse");
  const pathReverse = formData.get("path_reverse");

  // 4. Validate
  if (!obverseFile || obverseFile.size === 0) return { success: false, error: "Obverse image is required." };
  if (!reverseFile || reverseFile.size === 0) return { success: false, error: "Reverse image is required." };
  if (!pathObverse) return { success: false, error: "Original Path (Obverse) is required." };
  if (!pathReverse) return { success: false, error: "Original Path (Reverse) is required." };

  try {
    // 5. Upload to ImgBB
    const [obverseData, reverseData] = await Promise.all([
      uploadToImgBB(obverseFile),
      uploadToImgBB(reverseFile),
    ]);

    // 6. Insert into DB
    const { error } = await supabase
      .from("d_coins_owned")
      .upsert({
        coin_id: coinId,
        user_id: user.id,
        url_obverse: obverseData?.url,
        medium_url_obverse: obverseData?.medium || obverseData?.url,
        thumb_url_obverse: obverseData?.thumb || obverseData?.url,
        delete_url_obverse: obverseData?.delete_url,
        original_path_obverse: pathObverse.trim(),
        url_reverse: reverseData?.url,
        medium_url_reverse: reverseData?.medium || reverseData?.url,
        thumb_url_reverse: reverseData?.thumb || reverseData?.url,
        delete_url_reverse: reverseData?.delete_url,
        original_path_reverse: pathReverse.trim(),
      });

    if (error) throw new Error(error.message);

    revalidatePath("/"); 
    return { success: true, message: "Coin successfully added to vault." };

  } catch (err) {
    console.error("Server Action Error:", err);
    return { success: false, error: err.message };
  }
}