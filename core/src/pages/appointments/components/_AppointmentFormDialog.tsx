import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAppointment } from "../hooks/_useCreateAppointment";
import { useArenasQuery } from "../../arenas/hooks/_useArenasQuery";
import { useAppointmentsQuery } from "../hooks/_useAppointmentsQuery";
import { useTournamentsQuery } from "../../tournaments/hooks/_useTournamentsQuery";
import {
  checkAppointmentConflicts,
  checkAppointmentTournamentConflicts,
  validateTimeOrder,
  validateNotInPast,
  validateMinimumDuration,
  validateMaximumDuration,
  formatConflictMessage,
} from "@/lib/time-validation";
import { extractValidationErrors, formatFormError } from "@/lib/error-handling";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";

const appointmentSchema = z
  .object({
    arena_id: z.string().min(1, "Arena is required"),
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      const timeValidation = validateTimeOrder(data.start_time, data.end_time);
      return timeValidation.isValid;
    },
    {
      message: "Start time must be before end time",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      const pastValidation = validateNotInPast(data.start_time, 15); // 15 minutes buffer
      return pastValidation.isValid;
    },
    {
      message: "Appointment must start at least 15 minutes from now",
      path: ["start_time"],
    }
  )
  .refine(
    (data) => {
      const minDurationValidation = validateMinimumDuration(
        data.start_time,
        data.end_time,
        15
      ); // 15 minutes minimum
      return minDurationValidation.isValid;
    },
    {
      message: "Appointment must be at least 15 minutes long",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      const maxDurationValidation = validateMaximumDuration(
        data.start_time,
        data.end_time,
        8
      ); // 8 hours maximum
      return maxDurationValidation.isValid;
    },
    {
      message: "Appointment cannot exceed 8 hours",
      path: ["end_time"],
    }
  );

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormDialogProps {
  onSubmit?: (data: AppointmentFormData) => void;
}

export const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  onSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const [conflictError, setConflictError] = React.useState<string>("");
  const [apiError, setApiError] = React.useState<string>("");
  const createMutation = useCreateAppointment();
  const { data: arenas = [], isLoading: arenasLoading } = useArenasQuery();
  const { data: appointments = [] } = useAppointmentsQuery();
  const { data: tournaments = [] } = useTournamentsQuery();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      arena_id: "",
      title: "",
      description: "",
      start_time: "",
      end_time: "",
    },
  });

  // Set default arena when arenas are loaded
  React.useEffect(() => {
    if (arenas.length > 0 && !form.getValues().arena_id) {
      form.setValue("arena_id", arenas[0].id.toString());
    }
  }, [arenas, form]);

  const handleFormSubmit = (data: AppointmentFormData) => {
    // Clear any previous errors
    setConflictError("");
    setApiError("");

    // Convert arena_id back to number for API
    const submitData = {
      ...data,
      arena_id: parseInt(data.arena_id),
    };

    // Check for conflicts with existing appointments
    const appointmentConflicts = checkAppointmentConflicts(
      submitData,
      appointments
    );

    // Check for conflicts with existing tournaments
    const tournamentConflicts = checkAppointmentTournamentConflicts(
      submitData,
      tournaments
    );

    // If there are conflicts, show error and don't submit
    if (appointmentConflicts.hasConflict || tournamentConflicts.hasConflict) {
      const conflictMessage = formatConflictMessage(
        appointmentConflicts.conflictingAppointments,
        tournamentConflicts.conflictingTournaments
      );
      setConflictError(conflictMessage);
      return;
    }

    createMutation.mutate(submitData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setConflictError("");
        setApiError("");
      },
      onError: (error: unknown) => {
        // Handle validation errors from the API
        const validationErrors = extractValidationErrors(error);

        // Set form field errors if we have specific field errors
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof AppointmentFormData, {
            type: "server",
            message,
          });
        });

        // If no specific field errors, show general API error
        if (Object.keys(validationErrors).length === 0) {
          const errorMessage = formatFormError(error, "CREATE_APPOINTMENT");
          setApiError(errorMessage);
        }
      },
    });

    // Also call the optional onSubmit prop if provided
    onSubmit?.(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-theme-orange hover:bg-theme-orange/90 text-theme-orange-foreground">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Appointment
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="arena_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Arena
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Tournament Finals" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
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
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time
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
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      End Time
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                disabled={createMutation.isPending}
                className="bg-theme-orange hover:bg-theme-orange/90 text-theme-orange-foreground"
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Appointment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
