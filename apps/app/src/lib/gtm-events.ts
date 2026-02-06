import { sendGTMEvent } from '@next/third-parties/google';

export const GTM_EVENTS = {
  NANNY_REGISTRATION: 'nanny_registration_complete',
  FAMILY_REGISTRATION: 'family_registration_complete',
  SUBSCRIPTION_CREATED: 'subscription_created',
  JOB_CREATED: 'job_created',
  APPLICATION_SENT: 'application_sent',
  COOKIE_CONSENT_ACCEPTED: 'cookie_consent_accepted',
  COOKIE_CONSENT_DECLINED: 'cookie_consent_declined',
} as const;

export function trackNannyRegistration() {
  sendGTMEvent({ event: GTM_EVENTS.NANNY_REGISTRATION });
}

export function trackFamilyRegistration() {
  sendGTMEvent({ event: GTM_EVENTS.FAMILY_REGISTRATION });
}

export function trackSubscriptionCreated(plan: string) {
  sendGTMEvent({
    event: GTM_EVENTS.SUBSCRIPTION_CREATED,
    plan,
  });
}

export function trackJobCreated(jobId: number) {
  sendGTMEvent({
    event: GTM_EVENTS.JOB_CREATED,
    jobId,
  });
}

export function trackApplicationSent(jobId: number) {
  sendGTMEvent({
    event: GTM_EVENTS.APPLICATION_SENT,
    jobId,
  });
}

export function trackCookieConsentAccepted() {
  sendGTMEvent({ event: GTM_EVENTS.COOKIE_CONSENT_ACCEPTED });
}

export function trackCookieConsentDeclined() {
  sendGTMEvent({ event: GTM_EVENTS.COOKIE_CONSENT_DECLINED });
}
