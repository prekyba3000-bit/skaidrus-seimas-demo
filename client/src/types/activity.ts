/**
 * TypeScript type definitions for Activity Feed
 */

export type ActivityType =
  | "vote"
  | "comment"
  | "document"
  | "session"
  | "achievement";

export type VoteChoice = "for" | "against" | "abstain";

export interface BaseActivity {
  id: number;
  type: ActivityType;
  mpId: number;
  mpName: string;
  mpAvatar: string | null;
  mpParty: string;
  timestamp: string;
  metadata: Record<string, any>;
  isHighlighted: boolean;
  isNew: boolean;
  category: string;
}

export interface VoteActivityMetadata {
  billTitle: string;
  voteChoice: VoteChoice;
}

export interface CommentActivityMetadata {
  billTitle: string;
  commentPreview: string;
  commentFull: string;
  commentLength: number;
}

export interface DocumentActivityMetadata {
  documentTitle: string;
  documentType: string;
  fileSize: string;
}

export interface SessionActivityMetadata {
  sessionTitle: string;
  participationType: "attended" | "spoke" | "absent";
  duration: number; // in minutes
}

export interface AchievementActivityMetadata {
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic";
}

// Activity-specific types
export interface VoteActivity extends BaseActivity {
  type: "vote";
  metadata: VoteActivityMetadata;
}

export interface CommentActivity extends BaseActivity {
  type: "comment";
  metadata: CommentActivityMetadata;
}

export interface DocumentActivity extends BaseActivity {
  type: "document";
  metadata: DocumentActivityMetadata;
}

export interface SessionActivity extends BaseActivity {
  type: "session";
  metadata: SessionActivityMetadata;
}

export interface AchievementActivity extends BaseActivity {
  type: "achievement";
  metadata: AchievementActivityMetadata;
}

export type Activity =
  | VoteActivity
  | CommentActivity
  | DocumentActivity
  | SessionActivity
  | AchievementActivity;

export type ActivityStatus =
  | "voted"
  | "commented"
  | "uploaded"
  | "attended"
  | "achieved";
