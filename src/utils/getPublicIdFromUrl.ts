export default function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const publicIdWithFormat = parts[parts.length - 1];
  const publicId = publicIdWithFormat.split(".")[0]; // Remove file extension
  return publicId;
}
