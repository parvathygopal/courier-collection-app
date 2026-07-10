import { api } from "../lib/axios";

export const publicTrackingService = {
  getPublicPackage: async (trackingId: string, captchaToken: string) => {
    const response = await api.get(`/public/track/${trackingId}`, {
      headers: {
        "X-Captcha-Token": captchaToken,
      },
    });

    return response.data.data;
  },
};
