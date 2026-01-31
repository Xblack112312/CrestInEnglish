export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" | "video" | "raw",
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  form.append("upload_preset", "courses_unsigned");

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  return res.json();
}
