
'use server';
/**
 * @fileOverview A Genkit flow to generate personalized study plans for students.
 *
 * - generateStudyPlan - A function that creates a study plan based on student inputs.
 * - GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * - GenerateStudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '../genkit';
import type { GenerateStudyPlanInput, GenerateStudyPlanOutput } from '../schemas/study-plan-schemas';
import { GenerateStudyPlanInputSchema, GenerateStudyPlanOutputSchema } from '../schemas/study-plan-schemas';


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
