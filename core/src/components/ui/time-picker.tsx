import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";

/**
 * Time utility functions
 */

// Convert "HH:mm" string to minutes since midnight
export const toMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight to "HH:mm" string
export const fromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

// Check if minutes value aligns with step
export const isAligned = (minutes: number, step: number): boolean => {
  return minutes % step === 0;
};

// Round down to nearest step alignment
export const alignDown = (minutes: number, step: number): number => {
  return Math.floor(minutes / step) * step;
};

// Clamp minutes value between min and max bounds
export const clamp = (minutes: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, minutes));
};

// Generate array of eligible time values in minutes
export const getEligibleTimes = (
  minTime?: string,
  maxTime?: string,
  step: number = 1
): number[] => {
  const minMinutes = minTime ? toMinutes(minTime) : 0;
  const maxMinutes = maxTime ? toMinutes(maxTime) : 1439; // 23:59

  const times: number[] = [];

  // Find first aligned time >= minMinutes
  let current = alignDown(minMinutes, step);
  if (current < minMinutes) {
    current += step;
  }

  // Generate all aligned times within range
  while (current <= maxMinutes) {
    times.push(current);
    current += step;
  }

  return times;
};

// Get current time in minutes since midnight
export const getCurrentMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Parse various human-friendly time strings into a strict 24-hour HH:MM format
export const parseTimeInput = (raw: string): string | null => {
  const input = raw.trim().toLowerCase();
  if (!input) return null;

  // Special keywords
  if (input === "noon" || input === "12noon" || input.includes("noon"))
    return "12:00";
  if (input === "midnight" || input.includes("midnight")) return "00:00";

  // Handle variations of noon
  if (input.match(/12\s*n+$/)) return "12:00";

  // Clean up the input - remove common words and normalize spacing
  let cleanInput = input
    .replace(/\b(in the|at|around|about|approximately)\s+/g, "")
    .replace(
      /\b(morning|afternoon|evening|night|dawn|dusk|o'clock|clock|oclock)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  // Handle "in the morning/afternoon/evening/night" context
  const isMorning =
    input.includes("morning") || input.includes("dawn") || input.includes("am");
  const isEvening =
    input.includes("evening") ||
    input.includes("night") ||
    input.includes("pm");
  const isAfternoon = input.includes("afternoon") || input.includes("pm");

  // Match patterns like 7, 07, 7pm, 7:15pm, 19:30, 1930, 07:45, etc.
  const match = cleanInput.match(
    /^([0-9]{1,2})(?::?\s*([0-9]{2}))?\s*(am|pm|a|p|n+)?$/
  );
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  let minutes = match[2] ? parseInt(match[2], 10) : 0;
  let period = match[3];

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (minutes > 59) return null;
  if (hours > 24) return null;

  // Handle various period indicators
  if (period) {
    // Handle "nn", "nnn", etc. as noon indicators
    if (period.match(/^n+$/)) {
      if (hours === 12) return "12:00";
      return null; // Only 12nn makes sense
    }

    // Handle single letters
    if (period === "a") period = "am";
    if (period === "p") period = "pm";

    if (period === "am" || period === "pm") {
      if (hours === 12) {
        hours = period === "am" ? 0 : 12;
      } else {
        hours = period === "pm" ? hours + 12 : hours;
      }
    }
  } else {
    // No explicit period, but we have contextual clues
    if (hours >= 1 && hours <= 11) {
      if (isEvening || isAfternoon) {
        hours += 12;
      } else if (isMorning) {
        // Keep as is (AM)
      } else {
        // Default behavior for ambiguous times
        // 1-6: assume PM unless explicitly morning context
        // 7-11: assume AM unless explicitly evening context
        if (hours >= 1 && hours <= 6) {
          hours += 12; // Default to PM for 1-6
        }
        // 7-11 default to AM
      }
    } else if (hours === 12) {
      if (isMorning) {
        hours = 0; // 12 in the morning = midnight
      }
      // 12 without context defaults to noon
    }
  }

  if (hours > 23) return null;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Format time for display based on format preference
export const formatTimeForDisplay = (
  timeString: string,
  format: "12" | "24" = "24"
): string => {
  if (!timeString) return "";

  if (format === "24") {
    return timeString;
  }

  const [hours, minutes] = timeString.split(":");
  const hour24 = parseInt(hours, 10);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
};

export interface TimePickerProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  format?: "12" | "24";
  min?: string;
  max?: string;
  step?: number;
  showNowButton?: boolean;
  className?: string;
  error?: boolean;
}

// Hook for managing TimePicker state
const useTimePicker = ({
  value,
  onChange,
  format = "24",
  min,
  max,
  step = 1,
  showNowButton = false,
}: {
  value: string;
  onChange: (value: string) => void;
  format?: "12" | "24";
  min?: string;
  max?: string;
  step?: number;
  showNowButton?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputFilter, setInputFilter] = useState("");

  // Parse current value to minutes for internal calculations
  const currentMinutes = useMemo(() => {
    return value ? toMinutes(value) : null;
  }, [value]);

  // Generate eligible times for dropdown
  const eligibleTimes = useMemo(() => {
    return getEligibleTimes(min, max, step);
  }, [min, max, step]);

  // Filter eligible times based on input
  const filteredTimes = useMemo(() => {
    if (!inputFilter.trim()) {
      return eligibleTimes;
    }

    const filterText = inputFilter.toLowerCase().trim();

    return eligibleTimes.filter((minutes) => {
      const timeString = fromMinutes(minutes);
      const displayTime = formatTimeForDisplay(timeString, format);

      // Match against both 24-hour and display format
      return (
        timeString.includes(filterText) ||
        displayTime.toLowerCase().includes(filterText) ||
        timeString.startsWith(filterText) ||
        displayTime.toLowerCase().startsWith(filterText)
      );
    });
  }, [eligibleTimes, inputFilter, format]);

  // Format current value for display
  const displayValue = useMemo(() => {
    return formatTimeForDisplay(value, format);
  }, [value, format]);

  // Check if "Now" button should be enabled
  const isNowButtonEnabled = useMemo(() => {
    if (!showNowButton) return false;

    const nowMinutes = getCurrentMinutes();
    const minMinutes = min ? toMinutes(min) : 0;
    const maxMinutes = max ? toMinutes(max) : 1439;

    return nowMinutes >= minMinutes && nowMinutes <= maxMinutes;
  }, [showNowButton, min, max]);

  // Handle dropdown toggle
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Handle time selection from dropdown
  const handleTimeSelect = useCallback(
    (minutes: number) => {
      const timeString = fromMinutes(minutes);
      onChange(timeString);
      setInputFilter("");
      setIsOpen(false);
    },
    [onChange]
  );

  // Handle "Now" button click
  const handleNowClick = useCallback(() => {
    const nowMinutes = getCurrentMinutes();
    const minMinutes = min ? toMinutes(min) : 0;
    const maxMinutes = max ? toMinutes(max) : 1439;

    // Clamp and align current time
    const clampedMinutes = clamp(nowMinutes, minMinutes, maxMinutes);
    const alignedMinutes = alignDown(clampedMinutes, step);

    const timeString = fromMinutes(alignedMinutes);
    onChange(timeString);

    setInputFilter("");
    setIsOpen(false);
  }, [min, max, step, onChange]);

  // Handle manual text input validation
  const validateInput = useCallback(
    (inputValue: string) => {
      if (!inputValue.trim()) {
        onChange("");
        return "";
      }

      const parsed = parseTimeInput(inputValue);
      if (!parsed) {
        return null; // Invalid input
      }

      const parsedMinutes = toMinutes(parsed);
      const minMinutes = min ? toMinutes(min) : 0;
      const maxMinutes = max ? toMinutes(max) : 1439;

      // Clamp to bounds
      const clampedMinutes = clamp(parsedMinutes, minMinutes, maxMinutes);

      // Align to step (round down)
      const alignedMinutes = alignDown(clampedMinutes, step);

      const finalTimeString = fromMinutes(alignedMinutes);
      onChange(finalTimeString);

      return formatTimeForDisplay(finalTimeString, format);
    },
    [min, max, step, format, onChange]
  );

  // Close dropdown when clicking outside
  const closeDropdown = useCallback(() => {
    if (isOpen) {
      setInputFilter("");
      setIsOpen(false);
    }
  }, [isOpen]);

  return {
    isOpen,
    currentMinutes,
    eligibleTimes: filteredTimes,
    displayValue,
    isNowButtonEnabled,
    inputFilter,
    toggleDropdown,
    closeDropdown,
    handleTimeSelect,
    handleNowClick,
    validateInput,
    setInputFilter,
  };
};

// Hook for handling click outside
const useOnClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
};

export const TimePicker: React.FC<TimePickerProps> = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = "--:--",
  format = "24",
  min,
  max,
  step = 1,
  showNowButton = false,
  className,
  error = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const {
    isOpen,
    currentMinutes,
    eligibleTimes,
    displayValue,
    isNowButtonEnabled,
    inputFilter,
    toggleDropdown,
    closeDropdown,
    handleTimeSelect,
    handleNowClick,
    validateInput,
    setInputFilter,
  } = useTimePicker({
    value,
    onChange,
    format,
    min,
    max,
    step,
    showNowButton,
  });

  useOnClickOutside(ref, closeDropdown);

  // Keep local input in sync with display value or filter
  useEffect(() => {
    if (inputFilter) {
      setInputValue(inputFilter);
    } else {
      setInputValue(displayValue || "");
    }
  }, [displayValue, inputFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setInputFilter(newValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const result = validateInput(inputValue);
      if (result !== null) {
        setInputValue(result);
      } else if (inputValue.trim() === "") {
        setInputValue("");
      } else {
        // Revert to current display value on invalid input
        setInputValue(displayValue || "");
      }
      setInputFilter("");
    }
  };

  const handleInputBlur = () => {
    const result = validateInput(inputValue);
    if (result !== null) {
      setInputValue(result);
    } else if (inputValue.trim() === "") {
      setInputValue("");
    } else {
      // Revert to current display value on invalid input
      setInputValue(displayValue || "");
    }
    setInputFilter("");
  };

  const handleToggleClick = () => {
    if (disabled) return;
    toggleDropdown();
  };

  // Generate display options for the dropdown
  const timeOptions = useMemo(() => {
    return eligibleTimes.map((minutes) => ({
      minutes,
      timeString: fromMinutes(minutes),
      displayText: formatTimeForDisplay(fromMinutes(minutes), format),
      isSelected: currentMinutes === minutes,
    }));
  }, [eligibleTimes, currentMinutes, format]);

  // Calculate what "Now" would be if clicked
  const nowDisplayText = useMemo(() => {
    if (!showNowButton) return "";

    const nowMinutes = getCurrentMinutes();
    const minMinutes = min ? toMinutes(min) : 0;
    const maxMinutes = max ? toMinutes(max) : 1439;

    const clampedMinutes = clamp(nowMinutes, minMinutes, maxMinutes);
    const alignedMinutes = alignDown(clampedMinutes, step);

    return formatTimeForDisplay(fromMinutes(alignedMinutes), format);
  }, [showNowButton, min, max, step, format]);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          ref={inputRef}
          id={id || name}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className={cn(
            "pl-10 pr-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleClick}
          disabled={disabled}
          className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {/* Time options */}
          <div className="max-h-48 overflow-y-auto p-1">
            {timeOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No matching times found
              </div>
            ) : (
              timeOptions.map((option) => (
                <Button
                  key={option.minutes}
                  type="button"
                  variant="ghost"
                  onClick={() => handleTimeSelect(option.minutes)}
                  className={cn(
                    "w-full justify-start font-normal",
                    option.isSelected && "bg-accent text-accent-foreground"
                  )}
                >
                  {option.displayText}
                </Button>
              ))
            )}
          </div>

          {/* Now button */}
          {showNowButton && (
            <>
              <div className="border-t mx-1" />
              <div className="p-1">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNowClick}
                  disabled={!isNowButtonEnabled}
                  className="w-full"
                  size="sm"
                >
                  Now {nowDisplayText && `(${nowDisplayText})`}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
