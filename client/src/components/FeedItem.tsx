import { motion } from "framer-motion";
import { useState } from "react";
import { StatusBadge, type ActivityStatus } from "./StatusBadge";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/activity";
import {
  ThumbsUp,
  ThumbsDown,
  Ban,
  MessageSquare,
  FileText,
  Users,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FeedItemProps {
  activity: any; // Will be properly typed from tRPC
  isNew?: boolean;
  className?: string;
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const newItemVariants = {
  initial: {
    opacity: 0,
    x: -50,
    backgroundColor: "rgba(0, 240, 255, 0.2)",
  },
  animate: {
    opacity: 1,
    x: 0,
    backgroundColor: "rgba(0, 240, 255, 0)",
    transition: {
      duration: 0.6,
      backgroundColor: { duration: 2, delay: 0.5 },
    },
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "ką tik";
  if (diffMins < 60) return `prieš ${diffMins} min.`;
  if (diffHours < 24) return `prieš ${diffHours} val.`;
  if (diffDays < 7) return `prieš ${diffDays} d.`;
  return past.toLocaleDateString("lt-LT");
}

export function FeedItem({ activity, isNew = false, className }: FeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mp = activity.mp;
  const activityData = activity.activity;
  const bill = activity.bill;

  if (!mp || !activityData) return null;

  const renderContent = () => {
    const metadata = activityData.metadata;

    switch (activityData.type) {
      case "vote":
        const voteIcon =
          metadata.voteChoice === "for" ? (
            <ThumbsUp className="h-4 w-4 text-emerald-400" />
          ) : metadata.voteChoice === "against" ? (
            <ThumbsDown className="h-4 w-4 text-rose-400" />
          ) : (
            <Ban className="h-4 w-4 text-gray-400" />
          );

        const voteText =
          metadata.voteChoice === "for"
            ? "už"
            : metadata.voteChoice === "against"
              ? "prieš"
              : "susilaikė";

        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {voteIcon}
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  Balsavo <span className="font-semibold">{voteText}</span> įstatymo projektą
                </p>
                {bill && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                    {bill.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "comment":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">Komentuoja įstatymo projektą</p>
                {bill && (
                  <p className="mt-1 text-sm text-gray-400">{bill.title}</p>
                )}
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    {isExpanded ? metadata.commentFull : metadata.commentPreview}
                  </p>
                  {metadata.commentLength > 60 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-1 flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" /> Suskleisti
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> Skaityti daugiau
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">Įkėlė dokumentą</p>
                <p className="mt-1 text-sm font-medium text-gray-200">
                  {metadata.documentTitle}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {metadata.documentType} • {metadata.fileSize}
                </p>
              </div>
            </div>
          </div>
        );

      case "session":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  Dalyvavo posėdyje{" "}
                  {metadata.participationType === "spoke" && (
                    <span className="font-semibold">(kalbėjo)</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-400">{metadata.sessionTitle}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Trukmė: {metadata.duration} min.
                </p>
              </div>
            </div>
          </div>
        );

      case "achievement":
        const rarityColors = {
          common: "text-gray-400",
          rare: "text-blue-400",
          epic: "text-purple-400",
        };

        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Trophy
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  rarityColors[metadata.rarity as keyof typeof rarityColors]
                )}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-200">
                  {metadata.title}
                </p>
                <p className="mt-1 text-sm text-gray-400">{metadata.description}</p>
                <p className="mt-1 text-xs text-gray-500 uppercase tracking-wide">
                  {metadata.rarity}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStatusFromType = (type: string): ActivityStatus => {
    switch (type) {
      case "vote":
        return "voted";
      case "comment":
        return "commented";
      case "document":
        return "uploaded";
      case "session":
        return "attended";
      case "achievement":
        return "achieved";
      default:
        return "voted";
    }
  };

  const variants = isNew ? newItemVariants : itemVariants;

  return (
    <motion.div
      variants={variants}
      initial={isNew ? "initial" : "hidden"}
      animate={isNew ? "animate" : "visible"}
      className={cn(
        "group relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
        "bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-black/20",
        "hover:bg-white/10 hover:border-white/20",
        activityData.isHighlighted && "ring-2 ring-cyan-500/50",
        className
      )}
    >
      {/* New indicator dot */}
      {activityData.isNew && (
        <div className="absolute top-4 right-4">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </div>
      )}

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* MP Avatar */}
            <div className="relative flex-shrink-0">
              {mp.photoUrl ? (
                <img
                  src={mp.photoUrl}
                  alt={mp.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-2 ring-white/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-300">
                    {mp.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* MP Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">
                {mp.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{mp.party}</p>
            </div>
          </div>

          {/* Status Badge and Time */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <StatusBadge status={getStatusFromType(activityData.type)} size="sm" />
            <time className="text-xs text-gray-500">
              {formatRelativeTime(activityData.createdAt)}
            </time>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </motion.div>
  );
}
