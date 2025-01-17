// For each mode, define both the endpoint and the corresponding auth token
export const instaSDConfig = {
    text: {
      endpoint: process.env.NEXT_PUBLIC_INSTASD_TEXT_ENDPOINT ?? "",
      authToken: process.env.NEXT_PUBLIC_INSTASD_TEXT_AUTH_TOKEN ?? "",
    },
    image: {
      endpoint: process.env.NEXT_PUBLIC_INSTASD_IMAGE_ENDPOINT ?? "",
      authToken: process.env.NEXT_PUBLIC_INSTASD_IMAGE_AUTH_TOKEN ?? "",
    },
  };