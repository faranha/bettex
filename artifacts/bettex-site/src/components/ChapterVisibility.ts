import { createContext } from 'react';

/** Keep chapter content/index mounted, but do not measure charts in hidden chapters. */
export const ChapterVisibility = createContext(true);
