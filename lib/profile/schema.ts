import { z } from "zod";

const IMAGE_SOURCE = /^(https?:\/\/|\/)[^\s]+$/i;

export const profileImageSchema = z.object({
  image: z
    .string()
    .trim()
    .min(1, "Enter an image URL")
    .max(2048, "Image URL is too long")
    .regex(IMAGE_SOURCE, "Enter a valid image URL"),
});

export type ProfileImageInput = z.infer<typeof profileImageSchema>;
