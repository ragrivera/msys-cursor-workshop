import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { useCreateParticipant } from "../hooks/_useCreateParticipant";

const participantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type ParticipantFormData = z.infer<typeof participantSchema>;

interface ParticipantFormDialogProps {
  onSubmit?: (data: ParticipantFormData) => void;
}

export const ParticipantFormDialog: React.FC<ParticipantFormDialogProps> = ({
  onSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const createParticipant = useCreateParticipant();

  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleSubmit = async (data: ParticipantFormData) => {
    try {
      await createParticipant.mutateAsync(data);

      onSubmit?.(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation hook via toast
      console.error("Failed to create participant:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Participant
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter participant's full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="participant@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={createParticipant.isPending}
                className="gap-2"
              >
                {createParticipant.isPending ? (
                  <>Adding...</>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add Participant
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
