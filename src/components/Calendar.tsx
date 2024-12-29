import React from "react";
import { DayPicker } from "react-day-picker";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import "react-day-picker/dist/style.css";

interface CalendarProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const today = startOfToday();
  const thirtyDaysFromNow = addDays(today, 30);

  const disabledDays = {
    before: today,
    after: thirtyDaysFromNow,
  };

  const calendarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <motion.div
      variants={calendarVariants}
      initial="hidden"
      animate="visible"
      className="p-4 bg-white rounded-lg shadow"
    >
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        disabled={disabledDays}
        locale={es}
        modifiers={{
          available: (date) =>
            !isBefore(date, today) && !isBefore(thirtyDaysFromNow, date),
        }}
        modifiersStyles={{
          available: { color: "#7C3AED" },
        }}
        styles={{
          caption: { color: "#374151" },
          head_cell: { color: "#6B7280" },
        }}
      />
    </motion.div>
  );
}
