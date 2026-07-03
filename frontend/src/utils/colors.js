export const CATEGORY_COLORS = {
  "Sleep & Relaxation": "#4f46e5", // Indigo
  "Energy & Performance": "#f97316", // Orange
  "Immunity": "#22c55e", // Green
  "Gut Health": "#0d9488", // Teal
  "Cognitive Support": "#2563eb", // Blue
  "Stress & Mood": "#9333ea", // Purple
  "Beauty From Within": "#db2777", // Rose
  "Healthy Aging": "#475569" // Slate
};

export const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || "#64748b";
};

export const CATEGORY_SECONDARY_COLORS = {
  "Sleep & Relaxation": "#e0e7ff",
  "Energy & Performance": "#ffedd5",
  "Immunity": "#dcfce7",
  "Gut Health": "#ccfbf1",
  "Cognitive Support": "#dbeafe",
  "Stress & Mood": "#f3e8ff",
  "Beauty From Within": "#fce7f3",
  "Healthy Aging": "#f1f5f9"
};

export const getCategorySecondaryColor = (categoryName) => {
  return CATEGORY_SECONDARY_COLORS[categoryName] || "#f1f5f9";
};
