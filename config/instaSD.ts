// For each mode, define both the endpoint and the corresponding auth token
export const instaSDConfig = {
  text: {
    endpoint: process.env.NEXT_PUBLIC_INSTASD_TEXT_ENDPOINT ?? '',
    authToken: process.env.NEXT_PUBLIC_INSTASD_TEXT_AUTH_TOKEN ?? '',
  },
  image: {
    endpoint: process.env.NEXT_PUBLIC_INSTASD_IMAGE_ENDPOINT ?? '',
    authToken: process.env.NEXT_PUBLIC_INSTASD_IMAGE_AUTH_TOKEN ?? '',
  },
  clothing: {
    endpoint: process.env.NEXT_PUBLIC_INSTASD_CLOTHING_ENDPOINT ?? '',
    authToken: process.env.NEXT_PUBLIC_INSTASD_CLOTHING_AUTH_TOKEN ?? '',
  },
  upscale: {
    endpoint: process.env.NEXT_PUBLIC_INSTASD_UPSCALE_ENDPOINT ?? '',
    authToken: process.env.NEXT_PUBLIC_INSTASD_UPSCALE_AUTH_TOKEN ?? '',
  },
  fix: {
    endpoint: process.env.NEXT_PUBLIC_INSTASD_FIXIMAGE_ENDPOINT ?? '',
    authToken: process.env.NEXT_PUBLIC_INSTASD_FIXIMAGE_AUTH_TOKEN ?? '',
  },
  playground: {
    endpoint: process.env.NEXT_PUBLIC_INSTASD_PLAYGROUND_ENDPOINT ?? '',
    authToken: process.env.NEXT_PUBLIC_INSTASD_PLAYGROUND_AUTH_TOKEN ?? '',
  },
};
