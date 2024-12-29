import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { api } from "../services/api";

interface TimeSlotsProps {
  date: Date;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  duration: number;
}

export function TimeSlots({
  date,
  selectedTime,
  onSelectTime,
  duration,
}: TimeSlotsProps) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookedSlots = async () => {
      setLoading(true);
      try {
        const appointments = await api.getAppointments(
          date.toISOString().split("T")[0]
        );
        const slots = appointments.flatMap(
          (apt: {
            time: { split: (arg0: string) => [any, any] };
            duration: number;
          }) => {
            const slots = [];
            const [hours, minutes] = apt.time.split(":");
            const startTime = new Date(date);
            startTime.setHours(parseInt(hours));
            startTime.setMinutes(parseInt(minutes));

            const slotsCount = Math.ceil(apt.duration / 30);

            for (let i = 0; i < slotsCount; i++) {
              const slotTime = new Date(startTime);
              slotTime.setMinutes(startTime.getMinutes() + i * 30);
              slots.push(
                slotTime.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              );
            }
            return slots;
          }
        );
        setBookedSlots(slots);
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookedSlots();
  }, [date]);

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 9;
    let minutes = 0;

    while (hour < 18) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      const slotsNeeded = Math.ceil(duration / 30);

      const isAvailable = !isTimeSlotBooked(timeString, slotsNeeded);

      slots.push({
        time: timeString,
        available: isAvailable,
      });

      minutes += 30;
      if (minutes === 60) {
        minutes = 0;
        hour += 1;
      }
    }
    return slots;
  };

  const isTimeSlotBooked = (
    startTime: string,
    slotsNeeded: number
  ): boolean => {
    for (let i = 0; i < slotsNeeded; i++) {
      const [hours, minutes] = startTime.split(":");
      const slotTime = new Date(date);
      slotTime.setHours(parseInt(hours));
      slotTime.setMinutes(parseInt(minutes) + i * 30);

      const timeString = slotTime.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (bookedSlots.includes(timeString)) {
        return true;
      }
    }
    return false;
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        bounce: 0.3,
      },
    }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-4"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Horarios disponibles para el{" "}
        {format(date, "EEEE d 'de' MMMM", { locale: es })}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((slot, index) => (
          <motion.button
            key={slot.time}
            variants={itemVariants}
            custom={index}
            disabled={!slot.available}
            onClick={() => slot.available && onSelectTime(slot.time)}
            className={`p-2 rounded-md text-sm font-medium transition-colors
              ${
                slot.available
                  ? selectedTime === slot.time
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            whileHover={slot.available ? { scale: 1.05 } : {}}
            whileTap={slot.available ? { scale: 0.95 } : {}}
          >
            {slot.time}
          </motion.button>
        ))}
      </div>
      {timeSlots.every((slot) => !slot.available) && (
        <p className="text-red-600 mt-4 text-center">
          No hay horarios disponibles para este día
        </p>
      )}
    </motion.div>
  );
}
