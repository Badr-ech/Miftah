
import React from 'react';
import { z } from 'zod';

export const GenerateStudyPlanInputSchema = z.object({
  learningGoals: z
    .string()
    .min(10, { message: "Please describe your learning goals in at least 10 characters." })
    .max(500, { message: "Learning goals should not exceed 500 characters." })
    .describe("Student's primary learning objectives (e.g., 'Pass the final exam in Algebra', 'Learn basic Python programming for data analysis')."),
  preferredLearningStyle: z
    .enum(["visual", "auditory", "kinesthetic", "reading_writing"], { message: "Please select a preferred learning style." })
    .describe("Student's preferred way of learning (visual, auditory, kinesthetic, reading/writing)."),
  timeAvailablePerWeek: z
    .number({ invalid_type_error: "Please enter a valid number for hours per week." })
    .min(1, { message: "Please allocate at least 1 hour per week." })
    .max(40, { message: "Study time should not exceed 40 hours per week." })
    .describe("Hours per week student can dedicate to studying."),
  currentKnowledge: z
    .string()
    .min(10, { message: "Please describe your current knowledge in at least 10 characters." })
    .max(500, { message: "Current knowledge description should not exceed 500 characters." })
    .describe("Brief description of student's current understanding of the subjects (e.g., 'Beginner in French, know some basic vocabulary', 'Comfortable with basic algebra but struggle with calculus concepts')."),
  subjectsOfInterest: z
    .string()
    .min(3, { message: "Please list at least one subject or topic." })
    .max(200, { message: "Subjects of interest should not exceed 200 characters." })
    .describe("Comma-separated list of subjects or topics to focus on (e.g., 'Algebra, Geometry, Physics')."),
  durationInWeeks: z
    .number({ invalid_type_error: "Please enter a valid number of weeks." })
    .min(1, { message: "Duration must be at least 1 week." })
    .max(52, { message: "Duration cannot exceed 52 weeks." })
    .describe("Number of weeks for the study plan (e.g., 4, 8, 12)."),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

export const GenerateStudyPlanOutputSchema = z.object({
  planTitle: z.string().describe("A concise and motivating title for the study plan."),
  introduction: z.string().describe("A brief introductory message or overview of the plan, tailored to the student's goals."),
  weeklyBreakdown: z.array(z.object({
    weekNumber: z.number().describe("The week number in the plan."),
    focusTopics: z.array(z.string()).describe("Key topics or subjects to focus on during this week."),
    learningActivities: z.array(z.string()).describe("Specific learning activities, tasks, or exercises for the week."),
    estimatedTime: z.string().describe("Estimated time commitment for this week's tasks, e.g., '6-8 hours', 'approx. 10 hours'.")
  })).describe("A detailed breakdown of study activities for each week of the plan. This should cover the entire 'durationInWeeks' specified in the input."),
  suggestedResources: z.array(z.string()).optional().describe("Optional list of generally useful learning resources like websites, apps, or types of materials (e.g., 'Khan Academy for Math', 'Duolingo for French', 'Interactive coding platforms')."),
  motivationalTip: z.string().optional().describe("An encouraging tip or piece of advice for the student to stay on track.")
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;
