import { z } from "zod";

export const EventSchema = z.object({
  calendarId: z.string(),
  timeMin: z.string().optional(),
  timeMax: z.string().optional(),
  maxResults: z.number().optional(),
});
