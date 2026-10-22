const FIFTEEN_MINUTES = 15 * 60 * 1000;

/** [bucket, requests, window] per IP for the steps after the password. */
export const SECOND_STEP_LIMIT = ["admin-second-step", 20, FIFTEEN_MINUTES] as const;
export const APPROVAL_START_LIMIT = ["admin-approval", 5, FIFTEEN_MINUTES] as const;
export const APPROVAL_CHECK_LIMIT = ["admin-approval-check", 300, FIFTEEN_MINUTES] as const;
