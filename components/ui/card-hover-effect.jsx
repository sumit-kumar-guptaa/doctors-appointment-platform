import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";

export const HoverEffect = ({
  items,
  className
}) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10", className)}>
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}>
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-100/80 to-orange-100/80 dark:from-purple-900/20 dark:to-orange-900/20 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }} />
            )}
          </AnimatePresence>
          <Card>
            {item.step && (
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{item.icon}</div>
                <div className="text-xs font-medium text-purple-400 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                  {item.step}
                </div>
              </div>
            )}
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/20 group-hover:border-purple-400 dark:group-hover:border-purple-600 relative z-20 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/10",
        className
      )}>
      <div className="relative z-50">
        <div className="p-2">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children
}) => {
  return (
    <h4 className={cn("text-slate-900 dark:text-slate-100 font-bold tracking-wide mt-2 text-lg", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children
}) => {
  return (
    <p
      className={cn("mt-4 text-slate-600 dark:text-slate-300 tracking-wide leading-relaxed text-sm", className)}>
      {children}
    </p>
  );
};
