import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// Inline cn utility
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link?: string;
    image?: string;
    date?: string;
    location?: string;
    category?: string;
    attending?: number;
    distance?: number;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-br from-orange-100 via-yellow-50 to-red-50 dark:from-orange-900/20 dark:via-yellow-900/20 dark:to-red-900/20 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            )}
            <div className="p-4">
              <CardTitle>{item.title}</CardTitle>
              {item.date && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {item.date}
                </div>
              )}
              {item.location && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.location}
                </div>
              )}
              {item.description && (
                <CardDescription>{item.description}</CardDescription>
              )}
              {item.category && (
                <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  {item.category}
                </span>
              )}
              {item.attending !== undefined && (
                <div className="mt-3 text-sm font-medium text-orange-600">
                  {item.attending} interested
                </div>
              )}
              {item.distance !== undefined && (
                <div className="mt-1 text-xs text-gray-500">
                  {item.distance.toFixed(1)} km away
                </div>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full overflow-hidden bg-white dark:bg-gray-900 border border-transparent group-hover:border-orange-300 dark:group-hover:border-orange-700 relative z-20 shadow-lg transition-all duration-300",
        className
      )}
    >
      <div className="relative z-50">
        <div>{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4
      className={cn(
        "text-gray-900 dark:text-gray-100 font-bold tracking-wide text-lg",
        className
      )}
    >
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-4 text-gray-600 dark:text-gray-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};