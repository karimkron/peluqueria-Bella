import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Review } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        transition: { type: "spring", stiffness: 300 },
      }}
      className="bg-white rounded-xl shadow-lg p-6 flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.4,
          duration: 1,
        },
      }}
      viewport={{ once: true }}
    >
      <div className="flex items-center mb-4">
        <img
          src={review.photoUrl}
          alt={review.author}
          className="w-12 h-12 rounded-full object-cover mr-4"
          onError={(e) => {
            (
              e.target as HTMLImageElement
            ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              review.author
            )}&background=random&color=fff&size=150`;
          }}
        />
        <div>
          <h4 className="font-semibold text-gray-900">{review.author}</h4>
          <p className="text-sm text-gray-500">
            {format(new Date(review.date), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      </div>
      <div className="flex mb-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < review.rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="text-gray-600 flex-grow">{review.content}</p>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <img
          src="/google-maps-logo.png"
          alt="Google Maps"
          className="w-4 h-4 mr-2"
        />
        Reseña de Google Maps
      </div>
    </motion.div>
  );
}
