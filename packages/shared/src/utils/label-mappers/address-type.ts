/**
 * Get address type label in Portuguese
 * @param addressType - Address type value
 * @returns Portuguese label
 */
export function getAddressTypeLabel(addressType: string | null): string {
  if (!addressType) {
    return '';
  }
  const addressTypeMap: { [key: string]: string } = {
    RESIDENTIAL: 'Residencial',
    HOSPITAL: 'Hospital',
    NURSING_HOME: 'Casa de repouso',
    OTHER: 'Outro',
  };
  return addressTypeMap[addressType.toUpperCase()] || '';
}
