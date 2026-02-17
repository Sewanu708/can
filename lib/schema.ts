import z from "zod";

export const schema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type RegisterSchema = z.infer<typeof schema>;

// Enums from backend/app/models.py
export enum DrillType {
  MATH = "math",
  VERBAL = "verbal",
  LOGIC = "logic",
  DATA_ANALYSIS = "data_analysis",
}

export enum TierType {
  TIER_ONE = "tier_one",
  TIER_TWO = "tier_two",
  TIER_THREE = "tier_three",
}

export enum Mode {
  STRICT = "strict",
  SEMI_STRICT = "semi_strict",
  FLEX = "flex",
}

export enum QuestionCategory {
    ARITHMETIC_BASIC = "arithmetic_basic",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    FRACTIONS_DECIMALS = "fractions_decimals",
    PERCENTAGES = "percentages",
    ESTIMATION = "estimation",
    NUMBER_SEQUENCES = "number_sequences",
    RATIOS_PROPORTIONS = "ratios_proportions",
    BASIC_ALGEBRA = "basic_algebra",
    SYNONYMS_ANTONYMS = "synonyms_antonyms",
    ANALOGIES = "analogies",
    ABSTRACT_REASONING = "abstract_reasoning",
    ODD_ONE_OUT = "odd_one_out",
    DATA_SUFFICIENCY = "data_sufficiency",
    READING_COMPREHENSION = "reading_comprehension",
    CRITICAL_REASONING = "critical_reasoning",
    CHART_INTERPRETATION = "chart_interpretation",
    WORD_PROBLEMS = "word_problems",
}


export const drillConfigSchema = z.object({
  numberOfQuestions: z.number().min(1, "Number of questions must be at least 1"),
  drillMode: z.enum(Mode),
  questionType: z.enum(DrillType),
  difficulty: z.enum(TierType).optional(),
  category: z.enum(QuestionCategory).optional(),
  totalTime: z.number().min(1, "Total time must be at least 1 minute").optional(),
  timePerQuestion: z.number().min(1, "Time per question must be at least 1 second").optional(),
}).superRefine((data, ctx) => {
  if (data.drillMode === Mode.SEMI_STRICT && !data.totalTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Total time is required for Semi-Strict mode",
      path: ["totalTime"],
    });
  }
  if (data.drillMode === Mode.STRICT && !data.timePerQuestion) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Time per question is required for Strict mode",
      path: ["timePerQuestion"],
    });
  }
});

export type DrillConfigSchema = z.infer<typeof drillConfigSchema>;