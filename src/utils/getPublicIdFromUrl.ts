export default function getPublicIdFromUrl(url: string): string {
  const regex = /\/image\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1]; // Return the captured public_id
  }

  return "";
}
