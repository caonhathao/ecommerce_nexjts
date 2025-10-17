import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface RatingProps {
  value: number; // ví dụ: 4.3, 3.5, ...
  max?: number; // số sao tối đa, mặc định là 5
}

export const RatingStars = ({ value, max = 5 }: RatingProps) => {
  // Làm tròn đến 0.5 gần nhất
  const rounded = Math.round(value * 2) / 2;

  const stars = Array.from({ length: max }, (_, i) => {
    const starValue = i + 1;
    if (starValue <= rounded)
      return <FaStar key={i} className="text-yellow-400" size={10} />;
    if (starValue - 0.5 === rounded)
      return <FaStarHalfAlt key={i} className="text-yellow-400" size={10} />;
    return <FaRegStar key={i} className="text-gray-300" size={10} />;
  });

  return <div className="flex items-center gap-1">{stars}</div>;
};
