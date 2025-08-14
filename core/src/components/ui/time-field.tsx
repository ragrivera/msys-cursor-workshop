import React from "react";
import { TimePicker, type TimePickerProps } from "./time-picker";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

export interface TimeFieldProps extends Omit<TimePickerProps, "error"> {
  label?: string;
  description?: string;
  error?: boolean;
}

export const TimeField: React.FC<TimeFieldProps> = ({
  label,
  description,
  error,
  ...timePickerProps
}) => {
  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <TimePicker {...timePickerProps} error={error} />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};

export default TimeField;
