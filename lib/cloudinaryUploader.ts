import { createHash } from "crypto";


function slugify(value: string) {

    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
}



export default async function uploadToCloudinary(file: File, slug: string, folderName = "destinations") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("cloudinary env vars missing");

    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `moroccool/${folderName}/${slugify(slug)}`


    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = createHash("sha1").update(signaturePayload).digest("hex")

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('folder', folder)
    formData.append('signature', signature)

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    )

    if (!response.ok) {
        const message = await response.text()
        throw new Error(`Cloudinary upload failed: ${message}`)
    }
    const result = await response.json();
    return result.secure_url as string
}