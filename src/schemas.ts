import { z } from "zod";

export const EventSchema = z.object({
  calendarId: z.string(),
  timeMin: z.string().optional(),
  timeMax: z.string().optional(),
  maxResults: z.number().optional(),
});

export const ListEventsResponseSchema = z.object({
  _meta: z.object({}).optional(),
  events: z.array(z.any()).optional(),
  nextPageToken: z.string().optional(),
  nextSyncToken: z.string().optional(),
});

export type ListEventsResponse = z.infer<typeof ListEventsResponseSchema>;
