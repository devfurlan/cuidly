// Slug utilities
export * from './utils/slug';

// CSS class utilities
export { cn } from './utils/cn';

// String utilities
export {
  capitalizeFirstLetter,
  formatName,
  getInitials,
  getFirstAndLastName,
  abbreviateName,
  removeAccents,
} from './utils/string';

// Number utilities
export {
  formatNumberWithDots,
  calculateProfitPercentage,
} from './utils/number';

// Date utilities
export {
  calculateAge,
  convertToBrasiliaDateTime,
  formatToReadableDate,
  parseDateToBR,
  parseDateToLocal,
  type DateFormatType,
} from './utils/date';

// Document utilities
export {
  formatCpf,
  formatPhoneNumber,
  maskAlphanumeric,
  applyDocumentMask,
  formatPixKeyForDatabase,
  formatPixKeyForDisplay,
} from './utils/document';

// Geo utilities
export { calculateDistanceBetweenCoordinates } from './utils/geo';

// Label mappers
export {
  getGenderLabel,
  getAddressTypeLabel,
  getExperienceYearsLabel,
  getGenderedTerm,
  EXPERIENCE_YEARS_OPTIONS,
} from './utils/label-mappers';
