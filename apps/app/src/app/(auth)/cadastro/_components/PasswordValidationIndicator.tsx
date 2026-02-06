import { PiCheck, PiX } from 'react-icons/pi';

interface PasswordValidationIndicatorProps {
  isValid: boolean;
  label: string;
  /**
   * Use 'error' for critical validations (like password match)
   * Use 'default' for regular requirements
   */
  variant?: 'default' | 'error';
}

export function PasswordValidationIndicator({
  isValid,
  label,
  variant = 'default',
}: PasswordValidationIndicatorProps) {
  const invalidColor = variant === 'error' ? 'text-red-500' : 'text-gray-400';
  const invalidTextColor =
    variant === 'error' ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="flex items-center text-xs">
      {isValid ? (
        <PiCheck size={14} className="mr-1 text-green-500" />
      ) : (
        <PiX size={14} className={`mr-1 ${invalidColor}`} />
      )}
      <span className={isValid ? 'text-green-600' : invalidTextColor}>
        {label}
      </span>
    </div>
  );
}
