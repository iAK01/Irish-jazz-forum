import { withSerwist } from "@serwist/turbopack";

export default withSerwist({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
});
