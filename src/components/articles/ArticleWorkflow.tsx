"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  Archive,
  Star,
  TrendingUp,
  Lock,
  Unlock,
  History
} from "lucide-react";

interface ArticleWorkflowProps {
  articleId: string;
  currentStatus: string;
  qualityGrade?: string;
  protectionLevel?: string;
  isArchived?: boolean;
  featured?: boolean;
  onStatusChange?: (newStatus: string) => void;
  onQualityChange?: (newGrade: string) => void;
  onProtectionChange?: (newLevel: string) => void;
  onArchiveToggle?: () => void;
  onFeatureToggle?: () => void;
  isAdmin?: boolean;
}

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/30",
    description: "Article is being written"
  },
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
    description: "Awaiting initial review"
  },
  technical_review: {
    label: "Technical Review",
    icon: AlertCircle,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    description: "Under technical evaluation"
  },
  editorial_review: {
    label: "Editorial Review",
    icon: Eye,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    description: "Being edited for quality"
  },
  final_review: {
    label: "Final Review",
    icon: CheckCircle,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    borderColor: "border-indigo-500/30",
    description: "Final approval pending"
  },
  changes_requested: {
    label: "Changes Requested",
    icon: AlertCircle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
    description: "Author needs to make changes"
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
    description: "Ready for publication"
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
    description: "Does not meet standards"
  },
  published: {
    label: "Published",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    description: "Live on the platform"
  },
  archived: {
    label: "Archived",
    icon: Archive,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/30",
    description: "No longer active"
  }
};

const qualityGrades = {
  stub: {
    label: "Stub",
    icon: FileText,
    color: "text-gray-400",
    description: "Very short, needs expansion"
  },
  start: {
    label: "Start",
    icon: TrendingUp,
    color: "text-blue-400",
    description: "Has basic information"
  },
  b: {
    label: "B-Class",
    icon: Star,
    color: "text-purple-400",
    description: "Good coverage and quality"
  },
  ga: {
    label: "Good Article",
    icon: Star,
    color: "text-green-400",
    description: "Well-written and comprehensive"
  },
  fa: {
    label: "Featured Article",
    icon: Star,
    color: "text-yellow-400",
    description: "Exemplary quality"
  }
};

const protectionLevels = {
  none: {
    label: "No Protection",
    icon: Unlock,
    color: "text-gray-400",
    description: "Anyone can edit"
  },
  semi: {
    label: "Semi-Protected",
    icon: Shield,
    color: "text-yellow-400",
    description: "New users cannot edit"
  },
  full: {
    label: "Fully Protected",
    icon: Lock,
    color: "text-red-400",
    description: "Only admins can edit"
  }
};

export default function ArticleWorkflow({
  articleId,
  currentStatus,
  qualityGrade = "stub",
  protectionLevel = "none",
  isArchived = false,
  featured = false,
  onStatusChange,
  onQualityChange,
  onProtectionChange,
  onArchiveToggle,
  onFeatureToggle,
  isAdmin = false
}: ArticleWorkflowProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showProtectionMenu, setShowProtectionMenu] = useState(false);

  const currentStatusConfig = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.draft;
  const currentQualityConfig = qualityGrades[qualityGrade as keyof typeof qualityGrades] || qualityGrades.stub;
  const currentProtectionConfig = protectionLevels[protectionLevel as keyof typeof protectionLevels] || protectionLevels.none;
  const StatusIcon = currentStatusConfig.icon;
  const QualityIcon = currentQualityConfig.icon;
  const ProtectionIcon = currentProtectionConfig.icon;

  // Define allowed status transitions
  const allowedTransitions: Record<string, string[]> = {
    draft: ["pending_review"],
    pending_review: ["technical_review", "editorial_review", "changes_requested", "rejected"],
    technical_review: ["editorial_review", "changes_requested", "rejected"],
    editorial_review: ["final_review", "changes_requested", "rejected"],
    final_review: ["approved", "changes_requested", "rejected"],
    changes_requested: ["pending_review"],
    approved: ["published"],
    published: ["archived"],
    rejected: ["draft"],
    archived: ["draft"]
  };

  const availableTransitions = allowedTransitions[currentStatus] || [];

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h3 className="text-lg font-medium mb-4">Article Status & Metadata</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Status</p>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={!isAdmin || availableTransitions.length === 0}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${currentStatusConfig.bgColor} ${currentStatusConfig.borderColor} ${
                  isAdmin && availableTransitions.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60"
                }`}
              >
                <StatusIcon className={`h-5 w-5 ${currentStatusConfig.color}`} />
                <div className="flex-1 text-left">
                  <p className="font-medium">{currentStatusConfig.label}</p>
                  <p className="text-xs text-muted-foreground">{currentStatusConfig.description}</p>
                </div>
              </button>
              
              {showStatusMenu && isAdmin && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {availableTransitions.map((status) => {
                    const config = statusConfig[status as keyof typeof statusConfig];
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          onStatusChange?.(status);
                          setShowStatusMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quality Grade */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quality Grade</p>
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                disabled={!isAdmin}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-secondary/20 border-secondary/30 ${
                  isAdmin ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60"
                }`}
              >
                <QualityIcon className={`h-5 w-5 ${currentQualityConfig.color}`} />
                <div className="flex-1 text-left">
                  <p className="font-medium">{currentQualityConfig.label}</p>
                  <p className="text-xs text-muted-foreground">{currentQualityConfig.description}</p>
                </div>
              </button>
              
              {showQualityMenu && isAdmin && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {Object.entries(qualityGrades).map(([grade, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={grade}
                        onClick={() => {
                          onQualityChange?.(grade);
                          setShowQualityMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Protection Level */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Protection Level</p>
            <div className="relative">
              <button
                onClick={() => setShowProtectionMenu(!showProtectionMenu)}
                disabled={!isAdmin}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-secondary/20 border-secondary/30 ${
                  isAdmin ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60"
                }`}
              >
                <ProtectionIcon className={`h-5 w-5 ${currentProtectionConfig.color}`} />
                <div className="flex-1 text-left">
                  <p className="font-medium">{currentProtectionConfig.label}</p>
                  <p className="text-xs text-muted-foreground">{currentProtectionConfig.description}</p>
                </div>
              </button>
              
              {showProtectionMenu && isAdmin && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {Object.entries(protectionLevels).map(([level, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          onProtectionChange?.(level);
                          setShowProtectionMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Special Flags */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Special Flags</p>
            <div className="flex gap-2">
              <button
                onClick={onFeatureToggle}
                disabled={!isAdmin}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  featured 
                    ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" 
                    : "bg-secondary/20 border-secondary/30 text-secondary-foreground"
                } ${isAdmin ? "hover:opacity-80" : "cursor-not-allowed opacity-60"}`}
              >
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Featured</span>
              </button>
              
              <button
                onClick={onArchiveToggle}
                disabled={!isAdmin}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  isArchived 
                    ? "bg-gray-500/20 border-gray-500/30 text-gray-400" 
                    : "bg-secondary/20 border-secondary/30 text-secondary-foreground"
                } ${isAdmin ? "hover:opacity-80" : "cursor-not-allowed opacity-60"}`}
              >
                <Archive className="h-4 w-4" />
                <span className="text-sm font-medium">Archived</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status History Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Status History</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
            <div className="flex-1">
              <p className="font-medium">Current: {currentStatusConfig.label}</p>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <div className="w-2 h-2 rounded-full bg-muted mt-2"></div>
            <div className="flex-1">
              <p className="font-medium">Previous statuses will appear here</p>
              <p className="text-sm text-muted-foreground">With timestamps and user info</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}