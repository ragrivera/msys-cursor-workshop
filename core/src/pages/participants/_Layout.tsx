import React from "react";
import { format } from "date-fns";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  Trophy,
  Target,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipantFormDialog } from "./components/_ParticipantFormDialog";
import { useParticipantsQuery } from "./hooks/_useParticipantsQuery";

export default function ParticipantsLayout() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRank, setFilterRank] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const { data: participants = [], isLoading, error } = useParticipantsQuery();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Failed to load participants</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    // Note: Real API data doesn't have rank/status fields, so we'll filter by search only for now
    return matchesSearch;
  });

  const totalParticipants = participants.length;
  const activeParticipants = participants.length; // All participants are considered active for now
  const averageWinRate = 0; // Win rate calculation will be implemented when we have match data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Participants
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage tournament participants and track their performance
          </p>
        </div>
        <ParticipantFormDialog
          onSubmit={(data) => console.log("New participant:", data)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Participants
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalParticipants}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Players
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {activeParticipants}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Win Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageWinRate}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Matches
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {participants.length * 2} {/* Placeholder calculation */}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Ranks</option>
            <option value="Master">Master</option>
            <option value="Expert">Expert</option>
            <option value="Advanced">Advanced</option>
            <option value="Beginner">Beginner</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participants List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No participants found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterRank !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first participant to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Participant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Performance
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Last Updated
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-border hover:bg-accent/50"
                    >
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {participant.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Joined{" "}
                            {new Date(
                              participant.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            Performance data coming soon
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Match history will be tracked
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-muted-foreground">
                          {format(
                            new Date(participant.updated_at),
                            "MMM dd, yyyy"
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(participant.updated_at), "HH:mm")}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
