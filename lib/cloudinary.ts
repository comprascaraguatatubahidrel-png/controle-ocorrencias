import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  folder: string = 'controle-ocorrencias'
): Promise<{ url: string; publicId: string; type: 'IMAGE' | 'PDF' }> {
  const isPdf = filename.toLowerCase().endsWith('.pdf')
  const resourceType = isPdf ? 'raw' : 'image'

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) reject(error)
        else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            type: isPdf ? 'PDF' : 'IMAGE',
          })
        }
      }
    )

    uploadStream.end(file)
  })
}

export async function deleteFromCloudinary(publicId: string, isPdf: boolean = false): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: isPdf ? 'raw' : 'image',
  })
}
