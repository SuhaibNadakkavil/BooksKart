import cloudinary from "../config/cloudinary.js";

export const deleteCloudinaryImage = async (imageUrl) => {

  if (!imageUrl) return;

  try {

    const urlParts = imageUrl.split("/");
    const filename = urlParts.pop();
    const publicId = filename.split(".")[0];

    const folder = urlParts.slice(-2).join("/");

    const fullPublicId = `${folder}/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);

  } catch (err) {
    console.error("Cloudinary delete failed:", err);
  }

};