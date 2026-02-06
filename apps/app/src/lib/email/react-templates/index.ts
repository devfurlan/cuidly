// Auth templates
export {
  PasswordResetEmail,
  getPasswordResetEmailTemplate,
} from './auth';

// Subscription templates
export {
  WelcomeSubscriptionEmail,
  getWelcomeSubscriptionEmailTemplate,
  PaymentFailedEmail,
  getPaymentFailedEmailTemplate,
  TrialWelcomeEmail,
  getTrialWelcomeEmailTemplate,
  ReactivationEmail,
  getReactivationEmailTemplate,
  RenewalEmail,
  getRenewalEmailTemplate,
  PaymentReceiptEmail,
  getPaymentReceiptEmailTemplate,
} from './subscription';

// Cancellation templates
export {
  CancellationConfirmationEmail,
  getCancellationConfirmationEmailTemplate,
  Reminder5DaysEmail,
  getReminder5DaysEmailTemplate,
  Reminder1DayEmail,
  getReminder1DayEmailTemplate,
  CanceledEmail,
  getCanceledEmailTemplate,
  CanceledWithWinbackEmail,
  getCanceledWithWinbackEmailTemplate,
} from './cancellation';

// PIX templates
export {
  PixReminderEmail,
  getPixReminderEmailTemplate,
  PixExpiredEmail,
  getPixExpiredEmailTemplate,
} from './pix';

// Nanny templates
export {
  IncompleteProfileEmail,
  getIncompleteProfileEmailTemplate,
  CompatibleJobEmail,
  getCompatibleJobEmailTemplate,
} from './nanny';

// Family templates
export {
  NewApplicationEmail,
  getNewApplicationEmailTemplate,
} from './family';

// Types
export type { UserType, Benefit } from './data/benefits';
export { benefitsByUserType, benefits } from './data/benefits';
