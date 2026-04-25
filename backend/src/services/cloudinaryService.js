const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        type: "upload", // 🔥 ensures public delivery
        access_mode: "public", // 🔥 makes it accessible
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function destroyAsset(publicId) {
  if (!publicId) {
    return;
  }

  const resourceTypes = ["image", "raw", "video"];

  for (const resourceType of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: resourceType,
      });

      if (result?.result === "ok" || result?.result === "not found") {
        return result;
      }
    } catch (error) {
      if (resourceType === resourceTypes[resourceTypes.length - 1]) {
        throw error;
      }
    }
  }

  return null;
}

module.exports = { uploadBuffer, destroyAsset };
