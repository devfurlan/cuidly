export type ParticipantType = 'nanny' | 'family';

export type Participant = {
  id: string;
  joinedAt: Date;
  nanny: {
    id: number;
    name: string;
    emailAddress: string;
    photoUrl: string | null;
  } | null;
  family: {
    id: number;
    name: string;
    emailAddress: string;
    photoUrl: string | null;
  } | null;
};

export type Conversation = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: Participant[];
  messages: {
    id: string;
    body: string;
    createdAt: Date;
    senderNannyId: number | null;
    senderFamilyId: number | null;
  }[];
  _count: {
    messages: number;
  };
};

export type Message = {
  id: string;
  conversationId: string;
  senderNannyId: number | null;
  senderFamilyId: number | null;
  body: string;
  isRead: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
  senderNanny: {
    id: number;
    name: string;
    emailAddress: string;
    photoUrl: string | null;
  } | null;
  senderFamily: {
    id: number;
    name: string;
    emailAddress: string;
    photoUrl: string | null;
  } | null;
};

export const PARTICIPANT_TYPE_LABELS: Record<ParticipantType, string> = {
  nanny: 'Babá',
  family: 'Família',
};
