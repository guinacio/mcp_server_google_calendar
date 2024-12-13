import { z } from "zod";

export const CredentialsSchema = z.object({
  type: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  refresh_token: z.string(),
});

export const CredentialsFileSchema = z.object({
  installed: CredentialsSchema.optional(),
  web: CredentialsSchema.optional(),
})

export type Credentials = z.infer<typeof CredentialsSchema>;
export type CredentialsFile = z.infer<typeof CredentialsFileSchema>;
