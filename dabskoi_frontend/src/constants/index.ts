export const API_URL =
  typeof window === "undefined"
    ? process.env.API_BASE_URL_INTERNAL || "http://backend:3001"
    : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
export const IMAGE_PLACEHOLDER = "/images/placeholder.png";
