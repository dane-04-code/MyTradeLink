/**
 * Job sheet domain logic — pure, framework-free. Reuses the shared business
 * details, AUD/date formatting and id helpers from the quote engine.
 *
 * A job sheet is the on-site record of a job: who, where, what was done, what
 * materials went in, hours on site, and a sign-off. Unlike a quote or invoice
 * it isn't about money — there are no prices or GST. It's the paperwork that
 * protects a tradie if a customer later disputes the work, and the record that
 * makes invoicing afterwards trivial.
 */

import {
  type BusinessDetails,
  formatDate,
  toISODate,
} from "./quote";

export type { BusinessDetails } from "./quote";
export {
  formatDate,
  toISODate,
  emptyBusiness,
} from "./quote";

/** A material/part used on the job. No price — this is a record, not a bill. */
export type Material = {
  /** Stable id for React keys / row removal. */
  id: string;
  description: string;
  /** Free-text quantity ("3", "2.5m", "1 box") — kept as a string. */
  qty: string;
};

/** Where the job is up to. Drives the coloured status pill on the sheet. */
export type JobStatus = "completed" | "in_progress" | "follow_up";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  follow_up: "Follow-up needed",
};

export type JobSheet = {
  business: BusinessDetails;
  /** Job reference, e.g. "JOB-20260613". Editable. */
  jobNumber: string;
  /** ISO date string (yyyy-mm-dd) the work was done. */
  jobDate: string;
  status: JobStatus;
  customerName: string;
  customerContact: string;
  siteAddress: string;
  /** What was done on site — free text. */
  workDone: string;
  materials: Material[];
  /** Hours on site, free text so "6.5" or "2 days" both work. */
  hours: string;
  /** Anything outstanding, warnings, or next visit notes. */
  followUp: string;
};

/** A default job number based on a date, e.g. "JOB-20260613". */
export function defaultJobNumber(today: Date): string {
  return `JOB-${toISODate(today).replace(/-/g, "")}`;
}

/** A fresh, empty material row with a unique id derived from a seed. */
export function emptyMaterial(seed: string): Material {
  return { id: seed, description: "", qty: "" };
}

/** Date formatting re-exported so the builder/PDF share one implementation. */
export { formatDate as formatJobDate };
