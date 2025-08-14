import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTournament } from "../hooks/_useCreateTournament";
import { useArenasQuery } from "../../arenas/hooks/_useArenasQuery";
import { useTournamentsQuery } from "../hooks/_useTournamentsQuery";
import { useAppointmentsQuery } from "../../appointments/hooks/_useAppointmentsQuery";
import {
  checkTournamentConflicts,
  checkTournamentAppointmentConflicts,
  validateTimeOrder,
  validateNotInPast,
  validateMinimumDuration,
  validateMaximumDuration,
  formatConflictMessage,
} from "@/lib/time-validation";
import { extractValidationErrors, formatFormError } from "@/lib/error-handling";
import { Plus, Trophy, Calendar, Users, MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tournamentSchema = z
  .object({
    name: z
      .string()
      .min(2, "Tournament name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    arena_id: z.string().min(1, "Arena is required"),
    max_participants: z
      .number()
      .min(2, "Must allow at least 2 participants")
      .max(1000, "Cannot exceed 1000 participants"),
    format: z.enum(["single-elimination", "double-elimination", "round-robin"]),
    prize: z
      .string()
      .max(200, "Prize description must be less than 200 characters")
      .optional(),
  })
  .refine(
    (data) => {
      const timeValidation = validateTimeOrder(data.start_date, data.end_date);
      return timeValidation.isValid;
    },
    {
      message: "Start date must be before end date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      const pastValidation = validateNotInPast(data.start_date, 60); // 1 hour buffer for tournaments
      return pastValidation.isValid;
    },
    {
      message: "Tournament must start at least 1 hour from now",
      path: ["start_date"],
    }
  )
  .refine(
    (data) => {
      const minDurationValidation = validateMinimumDuration(
        data.start_date,
        data.end_date,
        60
      ); // 1 hour minimum
      return minDurationValidation.isValid;
    },
    {
      message: "Tournament must be at least 1 hour long",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      const maxDurationValidation = validateMaximumDuration(
        data.start_date,
        data.end_date,
        168
      ); // 7 days maximum
      return maxDurationValidation.isValid;
    },
    {
      message: "Tournament cannot exceed 7 days",
      path: ["end_date"],
    }
  );

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface TournamentFormDialogProps {
  onSubmit?: (data: TournamentFormData) => void;
}

export const TournamentFormDialog: React.FC<TournamentFormDialogProps> = ({
  onSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const [conflictError, setConflictError] = React.useState<string>("");
  const [apiError, setApiError] = React.useState<string>("");
  const createTournament = useCreateTournament();
  const { data: arenas = [], isLoading: arenasLoading } = useArenasQuery();
  const { data: tournaments = [] } = useTournamentsQuery();
  const { data: appointments = [] } = useAppointmentsQuery();

  const form = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16), // 1 week from now
      end_date: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
      )
        .toISOString()
        .slice(0, 16), // 4 hours later
      arena_id: "",
      max_participants: 16,
      format: "single-elimination",
      prize: "",
    },
  });

  // Set default arena when arenas are loaded
  React.useEffect(() => {
    if (arenas.length > 0 && !form.getValues().arena_id) {
      form.setValue("arena_id", arenas[0].id.toString());
    }
  }, [arenas, form]);

  const handleSubmit = async (data: TournamentFormData) => {
    // Clear any previous errors
    setConflictError("");
    setApiError("");

    // Convert arena_id back to number for API
    const submitData = {
      ...data,
      arena_id: parseInt(data.arena_id),
    };

    // Check for conflicts with existing tournaments
    const tournamentConflicts = checkTournamentConflicts(
      submitData,
      tournaments
    );

    // Check for conflicts with existing appointments
    const appointmentConflicts = checkTournamentAppointmentConflicts(
      submitData,
      appointments
    );

    // If there are conflicts, show error and don't submit
    if (tournamentConflicts.hasConflict || appointmentConflicts.hasConflict) {
      const conflictMessage = formatConflictMessage(
        appointmentConflicts.conflictingAppointments,
        tournamentConflicts.conflictingTournaments
      );
      setConflictError(conflictMessage);
      return;
    }

    try {
      await createTournament.mutateAsync(submitData);

      onSubmit?.(data);
      setOpen(false);
      form.reset();
      setConflictError("");
      setApiError("");
    } catch (error) {
      // Handle validation errors from the API
      const validationErrors = extractValidationErrors(error);

      // Set form field errors if we have specific field errors
      Object.entries(validationErrors).forEach(([field, message]) => {
        form.setError(field as keyof TournamentFormData, {
          type: "server",
          message,
        });
      });

      // If no specific field errors, show general API error
      if (Object.keys(validationErrors).length === 0) {
        const errorMessage = formatFormError(error, "CREATE_TOURNAMENT");
        setApiError(errorMessage);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-theme-purple hover:bg-theme-purple/90 text-theme-purple-foreground">
          <Plus className="h-4 w-4" />
          Create Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Create New Tournament
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.log("Tournament form validation errors:", errors);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tournament Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Championship 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tournament description..."
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date & Time
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date & Time
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="arena_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Arena
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Arena" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {arenasLoading ? (
                          <SelectItem value="" disabled>
                            Loading arenas...
                          </SelectItem>
                        ) : arenas.length > 0 ? (
                          arenas.map((arena) => (
                            <SelectItem
                              key={arena.id}
                              value={arena.id.toString()}
                            >
                              {arena.name} (Capacity: {arena.capacity})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No arenas available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Max Participants
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="16"
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 16;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Format</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single-elimination">
                          Single Elimination
                        </SelectItem>
                        <SelectItem value="double-elimination">
                          Double Elimination
                        </SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="$500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(conflictError || apiError) && (
              <div className="space-y-2">
                {conflictError && (
                  <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                    <div className="flex">
                      <div className="text-sm text-destructive">
                        <strong>Time Conflict:</strong> {conflictError}
                      </div>
                    </div>
                  </div>
                )}
                {apiError && (
                  <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                    <div className="flex">
                      <div className="text-sm text-destructive">
                        <strong>Error:</strong> {apiError}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-theme-purple hover:bg-theme-purple/90 text-theme-purple-foreground"
              >
                <Plus className="h-4 w-4" />
                Create Tournament
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
