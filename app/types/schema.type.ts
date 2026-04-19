import * as z from "zod";

export type Schema<T extends z.ZodTypeAny> = z.output<T>;
