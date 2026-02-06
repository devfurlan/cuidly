export interface ChildData {
  id?: number;
  tempId?: string;
  name?: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string | null;
  expectedBirthDate: string | null;
  carePriorities: string[];
  hasSpecialNeeds: boolean;
  specialNeedsTypes: string[];
  specialNeedsDescription?: string; // deprecated - kept for backward compatibility
  unborn: boolean;
}

export interface ChildrenSectionQuestionProps {
  value: ChildData[];
  onChange: (children: ChildData[]) => void;
  minChildren?: number;
  maxChildren?: number;
  showValidation?: boolean;
  error?: string | null;
}
