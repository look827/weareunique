'use server';

/**
 * @fileOverview An AI agent that analyzes leave request data and generates an insights report if statistically significant trends are detected.
 *
 * - generateInsightReport - A function that handles the generation of the insights report.
 * - GenerateInsightReportInput - The input type for the generateInsightReport function.
 * - GenerateInsightReportOutput - The return type for the generateInsightReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightReportInputSchema = z.object({
  leaveRequestData: z
    .string()
    .describe(
      'A stringified JSON array containing leave request data, each object must have fields such as userId, startDate, endDate, reason.'
    ),
});
export type GenerateInsightReportInput = z.infer<typeof GenerateInsightReportInputSchema>;

const GenerateInsightReportOutputSchema = z.object({
  report: z.string().describe('The generated insights report, if any.'),
});
export type GenerateInsightReportOutput = z.infer<typeof GenerateInsightReportOutputSchema>;

export async function generateInsightReport(
  input: GenerateInsightReportInput
): Promise<GenerateInsightReportOutput> {
  return generateInsightReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightReportPrompt',
  input: {schema: GenerateInsightReportInputSchema},
  output: {schema: GenerateInsightReportOutputSchema},
  prompt: `You are an AI assistant tasked with analyzing leave request data from a company called Unicube and generating a concise insights report if statistically significant trends are detected.

  Analyze the following leave request data (provided as a stringified JSON array). Each object in the array represents a single leave request and contains fields such as userId, startDate, endDate, and reason:

  {{leaveRequestData}}

  Your goal is to identify any patterns or anomalies that might be of interest to the company's management. Examples of such patterns include:

  - A significant increase or decrease in the overall number of leave requests compared to previous periods.
  - Specific departments or teams with unusually high or low leave request rates.
  - Certain times of the year (e.g., holidays, specific months) when leave requests spike.
  - Recurring reasons for leave requests that might indicate underlying issues (e.g., stress, burnout).
  - Conflicts in vacation schedules, specifically users from same team requesting vacation at the same time.
  - Frequency of absences for a given employee.

  If you identify one or more statistically significant trends, generate a report summarizing your findings. The report should be clear, concise, and actionable, highlighting the key patterns and their potential implications for the company.

  If, after analyzing the data, you do not find any statistically significant trends, respond with the string "No significant trends detected."
  Do not retain any user data when generating the report.
  Focus on providing useful insights for Unicube. Follow the tone and branding for green, gold and blue company.
`,
});

const generateInsightReportFlow = ai.defineFlow(
  {
    name: 'generateInsightReportFlow',
    inputSchema: GenerateInsightReportInputSchema,
    outputSchema: GenerateInsightReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

