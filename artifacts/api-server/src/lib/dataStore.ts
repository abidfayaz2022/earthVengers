import usersCsv from "../data/users.csv";
import campaignsCsv from "../data/campaigns.csv";
import enrollmentsCsv from "../data/enrollments.csv";
import completionLogsCsv from "../data/completion_logs.csv";
import fundraisersCsv from "../data/fundraisers.csv";
import goalsCsv from "../data/goals.csv";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  points: number;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface CampaignRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  pointsReward: number;
  frequency: string;
  imageUrl: string | null;
  enrolledCount: number;
  createdAt: Date;
}

export interface EnrollmentRecord {
  id: number;
  userId: number;
  campaignId: number;
  completions: number;
  lastCompletedAt: Date | null;
  createdAt: Date;
}

export interface CompletionLogRecord {
  id: number;
  userId: number;
  campaignId: number;
  category: string;
  pointsEarned: number;
  completedAt: Date;
}

export interface FundraiserRecord {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  imageUrl: string | null;
  deadline: Date;
  createdAt: Date;
}

export interface DonationRecord {
  id: number;
  fundraiserId: number;
  amount: number;
  donorName: string;
  message: string | null;
  createdAt: Date;
}

export interface GoalRecord {
  id: number;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  color: string;
  icon: string;
  createdAt: Date;
}

type CsvRow = Record<string, string>;

// Small RFC 4180 parser so the supplied CSV snapshots are bundled directly
// into the server and no database or runtime file access is required.
function parseCsv(input: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const character = input[i];
    if (quoted) {
      if (character === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...values] = rows;
  if (!headers) return [];
  return values
    .filter((valuesRow) => valuesRow.some(Boolean))
    .map((valuesRow) =>
      Object.fromEntries(headers.map((header, index) => [header, valuesRow[index] ?? ""])),
    );
}

function asNumber(value: string): number {
  return Number(value);
}

function asDate(value: string): Date {
  const normalized = value.replace(/^"|"$/g, "");
  const date = new Date(normalized);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid CSV date: ${value}`);
  return date;
}

function optionalDate(value: string): Date | null {
  return value ? asDate(value) : null;
}

export const dataStore = {
  users: parseCsv(usersCsv).map<UserRecord>((row) => ({
    id: asNumber(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    points: asNumber(row.points),
    avatarUrl: row.avatar_url || null,
    createdAt: asDate(row.created_at),
  })),
  campaigns: parseCsv(campaignsCsv).map<CampaignRecord>((row) => ({
    id: asNumber(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    pointsReward: asNumber(row.points_reward),
    frequency: row.frequency,
    imageUrl: row.image_url || null,
    enrolledCount: asNumber(row.enrolled_count),
    createdAt: asDate(row.created_at),
  })),
  enrollments: parseCsv(enrollmentsCsv).map<EnrollmentRecord>((row) => ({
    id: asNumber(row.id),
    userId: asNumber(row.user_id),
    campaignId: asNumber(row.campaign_id),
    completions: asNumber(row.completions),
    lastCompletedAt: optionalDate(row.last_completed_at),
    createdAt: asDate(row.created_at),
  })),
  completionLogs: parseCsv(completionLogsCsv).map<CompletionLogRecord>((row) => ({
    id: asNumber(row.id),
    userId: asNumber(row.user_id),
    campaignId: asNumber(row.campaign_id),
    category: row.category,
    pointsEarned: asNumber(row.points_earned),
    completedAt: asDate(row.completed_at),
  })),
  fundraisers: parseCsv(fundraisersCsv).map<FundraiserRecord>((row) => ({
    id: asNumber(row.id),
    title: row.title,
    description: row.description,
    goalAmount: asNumber(row.goal_amount),
    raisedAmount: asNumber(row.raised_amount),
    donorCount: asNumber(row.donor_count),
    imageUrl: row.image_url || null,
    deadline: asDate(row.deadline),
    createdAt: asDate(row.created_at),
  })),
  goals: parseCsv(goalsCsv).map<GoalRecord>((row) => ({
    id: asNumber(row.id),
    title: row.title,
    description: row.description,
    targetValue: asNumber(row.target_value),
    currentValue: asNumber(row.current_value),
    unit: row.unit,
    color: row.color,
    icon: row.icon,
    createdAt: asDate(row.created_at),
  })),
  donations: [] as DonationRecord[],
};

export function nextId(records: Array<{ id: number }>): number {
  return records.reduce((highest, record) => Math.max(highest, record.id), 0) + 1;
}
