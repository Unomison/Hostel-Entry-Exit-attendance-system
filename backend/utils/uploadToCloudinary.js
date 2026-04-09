const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload a base64 image string to Cloudinary
// Returns { url, publicId }
const uploadBase64Image = async (base64String, folder = 'hostel-students') => {
  return new Promise((resolve, reject) => {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          // Crop to square, focus on face, resize to 400x400
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(new Error('Cloudinary upload failed: ' + error.message));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Delete an image from Cloudinary by its public ID
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
  }
};

module.exports = { uploadBase64Image, deleteImage };