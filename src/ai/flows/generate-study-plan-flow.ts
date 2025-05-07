
'use server';
/**
 * @fileOverview A Genkit flow to generate personalized study plans for students.
 *
 * - generateStudyPlan - A function that creates a study plan based on student inputs.
 * - GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * - GenerateStudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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


export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert academic advisor tasked with creating a personalized study plan for a student.
The student has provided the following information:
- Learning Goals: {{{learningGoals}}}
- Preferred Learning Style: {{{preferredLearningStyle}}}
- Time Available Per Week: {{{timeAvailablePerWeek}}} hours
- Current Knowledge: {{{currentKnowledge}}}
- Subjects/Topics of Interest: {{{subjectsOfInterest}}}
- Desired Plan Duration: {{{durationInWeeks}}} weeks

Based on this information, create a structured and actionable study plan. The plan should include:
1.  A 'planTitle' that is concise and motivating.
2.  An 'introduction' that briefly overviews the plan and acknowledges the student's goals.
3.  A 'weeklyBreakdown' array, with one entry for each week of the 'durationInWeeks'. Each weekly entry must contain:
    - 'weekNumber': The specific week number.
    - 'focusTopics': An array of strings listing the key topics for that week.
    - 'learningActivities': An array of strings detailing specific tasks (e.g., "Read Chapter X of Subject Y", "Complete 10 practice problems on Z", "Watch tutorial videos on A and B", "Work on project C").
    - 'estimatedTime': A string estimating the time commitment for the week's activities (e.g., "Approx. X hours", "X-Y hours").
4.  Optionally, a list of 'suggestedResources' (general types of resources, not specific links unless highly generic like "Khan Academy").
5.  Optionally, a 'motivationalTip' to encourage the student.

Ensure the plan is realistic given the time available and duration. Break down complex subjects into manageable weekly topics and activities.
Tailor suggestions to the preferred learning style where appropriate (e.g., for visual learners, suggest diagrams or videos; for kinesthetic, suggest hands-on projects).

You MUST structure your response as a JSON object adhering to the provided output schema.
The 'weeklyBreakdown' array MUST cover all weeks specified in 'durationInWeeks'.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate study plan. The AI model did not return a valid output.");
    }
    // Basic validation to ensure weeklyBreakdown matches durationInWeeks
    if (output.weeklyBreakdown && output.weeklyBreakdown.length !== input.durationInWeeks) {
        // This could be an indication the model didn't follow instructions perfectly.
        // For now, we'll log it. In a real app, might try to adjust or re-prompt.
        console.warn(`AI Warning: Generated weeklyBreakdown length (${output.weeklyBreakdown.length}) does not match requested durationInWeeks (${input.durationInWeeks}).`);
        // Potentially, truncate or pad the array, or just return as is.
        // For simplicity, returning as is. The UI might need to handle this.
    }
    return output;
  }
);
