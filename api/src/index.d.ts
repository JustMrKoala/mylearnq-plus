export interface ClientOptions {
  /** Standaard https://app.mylearnq.com */
  baseUrl?: string;
  /** Cookie header van een ingelogde sessie. Nodig buiten de browser. */
  cookie?: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "student" | "coach" | "admin" | string;
  isActive: boolean;
  schoolId: number | null;
  [key: string]: unknown;
}

export type PhaseKey = "preparation" | "execution" | "evaluation" | "done";

export interface Phase {
  key: PhaseKey;
  label: string;
  startedOn: string | null;
  progress: number;
}

export interface SubQuestion {
  id: string;
  text: string;
  sourceId?: number;
}

export interface Challenge {
  challengeId: number;
  ownerId: number;
  title: string;
  pitch?: string;
  learningQuestion: string;
  collaborators: number[];
  creationDate: string;
  editDate: string;
  startPreparationDate: string;
  preparationProgress: number;
  startExecutionDate: string | null;
  executionProgress: number;
  startEvaluationDate: string | null;
  evaluationProgress: number;
  endChallengeDate: string | null;
  schoolYear: string;
  timeBudgetHours: number | null;
  perspectives: number[];
  subQuestions: SubQuestion[];
  worlds: number[];
  scheduledPresentationDate: string | null;
  [key: string]: unknown;
}

export interface ChallengeWithPhase extends Challenge {
  phase: Phase;
}

export interface CheckInItem {
  itemId: number;
  checkInId: number;
  challengeId: number | null;
  description: string;
  estimatedDuration: number | null;
  blockNumber: number | null;
  challengePhaseId: number | null;
  targetProgress: number | null;
  actualProgress: number | null;
  subjectId: number | null;
}

export interface CheckIn {
  checkInId: number;
  userId: number;
  date: string;
  status: "published" | "draft" | string;
  yesterdayReflection: string | null;
  learningsOrResults: string | null;
  helpOrObstacles: string | null;
  successCriteria: string | null;
  checkoutReflection: string | null;
  items: CheckInItem[];
}

export interface Question {
  key: string;
  label: string;
  required: boolean;
  order: number;
}

export interface Perspective {
  id: number;
  title: string;
  subject: string;
  color: string;
  icon: string;
  description: string;
  [key: string]: unknown;
}

export interface World {
  id: number;
  shortName: string;
  name: string;
  description: string;
  perspectives: Perspective[];
}

export interface CoreValueScore {
  coreValueId: number;
  title: string;
  subtitle: string;
  studentScore: number | null;
  coachScore: number | null;
  skillKeys: string[];
  responseCount: number;
}

export interface WorldShare {
  worldId: number;
  name: string;
  shortName: string;
  count: number;
  fraction: number;
}

export interface Session {
  sessionId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  sessionDate: string;
  sessionTime: string;
  maxParticipants: number;
  registrationCount: number;
  isRegistered: boolean;
  isPast: boolean;
  [key: string]: unknown;
}

export declare class MyLearnQError extends Error {
  status?: number;
}
export declare class MyLearnQAuthError extends MyLearnQError {
  location?: string;
}

export declare function decodeDevalue(arr: unknown[]): unknown;
export declare function challengePhase(c: Challenge): Phase;

export declare class MyLearnQ {
  constructor(options?: ClientOptions);
  baseUrl: string;
  route(path: string): Promise<Record<string, unknown>>;
  me(): Promise<User>;
  checkIns(userId?: number): Promise<{
    checkIns: CheckIn[];
    challenges: Challenge[];
    questions: Question[];
    plannedMinutesByChallenge: Record<string, number>;
    workBlocksPerDay: number;
    worlds: World[];
    metadata: Record<string, unknown>;
    raw: Record<string, unknown>;
  }>;
  challenges(userId?: number): Promise<{
    challenges: ChallengeWithPhase[];
    active: ChallengeWithPhase[];
    completed: ChallengeWithPhase[];
    openCount: number;
    maxOpen: number;
    collaborators: { userId: number; name: string; avatarUrl: string | null }[];
    worlds: World[];
    raw: Record<string, unknown>;
  }>;
  growth(userId?: number): Promise<{
    coreValues: CoreValueScore[];
    worldDistribution: { worlds: WorldShare[]; total: number; favorite: WorldShare | null; leastFavorite: WorldShare | null } | null;
    challengeCount: number | null;
    sessionAttendance: { attended: number; total: number } | null;
    latestEntry: unknown;
    coachNotes: unknown[];
    intro: { title: string; description: string } | null;
    raw: Record<string, unknown>;
  }>;
  notes(userId?: number): Promise<{ notes: Record<string, unknown>[]; raw: Record<string, unknown> }>;
  sessions(userId?: number): Promise<{ sessions: Session[]; reflectionQuestions: unknown[]; raw: Record<string, unknown> }>;
}

export default MyLearnQ;
