import { z } from 'zod';

// Basic schemas for reusable components
const DateTimeSchema = z.object({
  dateTime: z.string().describe('RFC3339 timestamp'),
  timeZone: z.string().optional(),
});

const AttendeeSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  optional: z.boolean().optional(),
  responseStatus: z
    .enum(['needsAction', 'declined', 'tentative', 'accepted'])
    .optional(),
  comment: z.string().optional(),
  additionalGuests: z.number().int().min(0).optional(),
});

const AttachmentSchema = z.object({
  fileId: z.string(),
  fileUrl: z.string().optional(),
  title: z.string().optional(),
  mimeType: z.string().optional(),
});

const ReminderOverrideSchema = z.object({
  method: z.enum(['email', 'popup']),
  minutes: z.number().int(),
});

const ConferenceDataSchema = z.object({
  createRequest: z
    .object({
      requestId: z.string(),
      conferenceSolutionKey: z.object({
        type: z.string(),
      }),
    })
    .optional(),
});

// Main event creation schema
export const CreateEventSchema = z.object({
  calendarId: z.string().describe('Calendar ID or "primary"'),
  event: z.object({
    summary: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    colorId: z.string().optional(),
    start: DateTimeSchema,
    end: DateTimeSchema,
    recurrence: z.array(z.string()).optional(),
    attendees: z.array(AttendeeSchema).optional(),
    attachments: z.array(AttachmentSchema).max(25).optional(),
    reminders: z
      .object({
        useDefault: z.boolean().optional(),
        overrides: z.array(ReminderOverrideSchema).optional(),
      })
      .optional(),
    visibility: z
      .enum(['default', 'public', 'private', 'confidential'])
      .optional(),
    transparency: z.enum(['opaque', 'transparent']).optional(),
    conferenceData: ConferenceDataSchema.optional(),
  }),
});

// List events schema
export const ListEventsSchema = z.object({
  calendarId: z.string(),
  timeMin: z.string().optional(),
  timeMax: z.string().optional(),
  maxResults: z.number().int().positive().optional(),
  singleEvents: z.boolean().optional(),
  orderBy: z.enum(['startTime', 'updated']).optional(),
});

// Type inference helpers
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type ListEventsInput = z.infer<typeof ListEventsSchema>;
