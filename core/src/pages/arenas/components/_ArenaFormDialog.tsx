import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MapPin } from "lucide-react";

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
import { useCreateArena } from "../hooks/_useCreateArena";

const arenaSchema = z.object({
  name: z.string().min(2, "Arena name must be at least 2 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  location: z.string().optional(),
});

type ArenaFormData = z.infer<typeof arenaSchema>;

interface ArenaFormDialogProps {
  onSubmit?: (data: ArenaFormData) => void;
}

export const ArenaFormDialog: React.FC<ArenaFormDialogProps> = ({
  onSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const createArena = useCreateArena();

  const form = useForm<ArenaFormData>({
    resolver: zodResolver(arenaSchema),
    defaultValues: {
      name: "",
      capacity: 16,
      location: "",
    },
  });

  const handleSubmit = async (data: ArenaFormData) => {
    console.log("Arena form submitted with data:", data);
    try {
      const result = await createArena.mutateAsync(data);
      console.log("Arena creation result:", result);

      onSubmit?.(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation hook via toast
      console.error("Failed to create arena:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Arena
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Create New Arena
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.log("Arena form validation errors:", errors);
            })}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arena Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter arena name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter maximum capacity"
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 16; // Default to 16 if invalid
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter arena location" {...field} />
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
                className="gap-2"
                disabled={createArena.isPending}
              >
                {createArena.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Arena
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
