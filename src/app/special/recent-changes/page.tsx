"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Filter, Calendar } from "lucide-react";
import ChangeManager from "@/components/articles/ChangeManager";

export default function RecentChangesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-normal">Recent Changes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track all recent changes across AfroWiki articles, reviews, and user activities
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Last 24 Hours</h3>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-normal">142</p>
            <p className="text-sm text-muted-foreground mt-1">Total changes</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Article Edits</h3>
              <Filter className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-normal">89</p>
            <p className="text-sm text-muted-foreground mt-1">Content updates</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">New Articles</h3>
              <Calendar className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-normal">12</p>
            <p className="text-sm text-muted-foreground mt-1">Created today</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-normal">23</p>
            <p className="text-sm text-muted-foreground mt-1">Contributing now</p>
          </div>
        </motion.div>

        {/* Recent Changes Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-xl font-medium mb-6">All Recent Changes</h2>
          <ChangeManager showFilters={true} />
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-medium mb-4">Understanding Recent Changes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Change Types</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <span className="text-green-400">New</span> - Article created</li>
                <li>• <span className="text-blue-400">Edit</span> - Content modified</li>
                <li>• <span className="text-yellow-400">Status</span> - Workflow changed</li>
                <li>• <span className="text-purple-400">Review</span> - Review activity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Change Indicators</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <span className="text-green-400">+</span> characters added</li>
                <li>• <span className="text-red-400">-</span> characters removed</li>
                <li>• <span className="text-gray-400">0</span> minor changes</li>
                <li>• Time stamps show when changes occurred</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}