
'use client';

import type { NextPage } from 'next';
import { useState, type ReactNode, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GenerateStudyPlanInputSchema, type GenerateStudyPlanInput, type GenerateStudyPlanOutput } from '../../../ai/schemas/study-plan-schemas';
import { generateStudyPlan } from '../../../ai/flows/generate-study-plan-flow';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { Loader2, Wand2, CheckCircle, AlertTriangle, ListChecks, BookOpen, Clock, Lightbulb } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../lib/auth';

const StudyPlanPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<GenerateStudyPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  // Check authentication on component mount
  useEffect(() => {
    let authCheckAttempts = 0;
    const maxAttempts = 3;
    
    async function checkAuth() {
      try {
        authCheckAttempts++;
        console.log(`[StudyPlanPage] Checking authentication (attempt ${authCheckAttempts})`);
        
        const user = await getCurrentUser();
        if (!user) {
          console.log("[StudyPlanPage] No user found in getCurrentUser response");
          
          // Try again if we haven't reached max attempts
          if (authCheckAttempts < maxAttempts) {
            console.log(`[StudyPlanPage] Retrying authentication check... (${authCheckAttempts}/${maxAttempts})`);
            setTimeout(checkAuth, 1000); // Wait 1 second before retrying
            return;
          }
          
          // Max attempts reached, redirect to login
          console.log("[StudyPlanPage] Max authentication attempts reached, redirecting to login");
          toast({
            title: "Authentication required",
            description: "Please log in to access the Study Plan page",
            variant: "destructive",
          });
          router.push('/login');
          return;
        }
        
        // If authentication is successful, mark auth as checked
        setAuthChecked(true);
        
        // Double check that role is a student, or reject
        const normalizedRole = user.role.toLowerCase();
        console.log(`[StudyPlanPage] User authenticated with role: ${user.role} (normalized: ${normalizedRole})`);
        
        if (normalizedRole !== 'student') {
          console.log("[StudyPlanPage] User is not a student, redirecting to dashboard");
          toast({
            title: "Access restricted",
            description: "Study plans are only available to students",
            variant: "destructive",
          });
          router.push('/dashboard');
          return;
        }
        
      } catch (error) {
        console.error("[StudyPlanPage] Error checking authentication:", error);
        
        // Try again if we haven't reached max attempts
        if (authCheckAttempts < maxAttempts) {
          console.log(`[StudyPlanPage] Retrying after error... (${authCheckAttempts}/${maxAttempts})`);
          setTimeout(checkAuth, 1000); // Wait 1 second before retrying
          return;
        }
        
        // Max attempts reached, redirect to login
        router.push('/login');
      }
    }
    
    checkAuth();
  }, [router, toast]);

  const form = useForm<GenerateStudyPlanInput>({
    resolver: zodResolver(GenerateStudyPlanInputSchema),
    defaultValues: {
      learningGoals: '',
      preferredLearningStyle: undefined, // Or a default like "visual"
      timeAvailablePerWeek: 5,
      currentKnowledge: '',
      subjectsOfInterest: '',
      durationInWeeks: 4,
    },
  });

  const onSubmit: SubmitHandler<GenerateStudyPlanInput> = async (data) => {
    setIsLoading(true);
    setStudyPlan(null);
    setError(null);
    try {
      const plan = await generateStudyPlan(data);
      setStudyPlan(plan);
      toast({
        title: 'Study Plan Generated!',
        description: 'Your personalized study plan is ready.',
        variant: 'default',
        duration: 5000,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while generating the plan.';
      setError(errorMessage);
      toast({
        title: 'Error Generating Plan',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const learningStyleOptions: { value: GenerateStudyPlanInput['preferredLearningStyle']; label: string }[] = [
    { value: 'visual', label: 'Visual (diagrams, charts, videos)' },
    { value: 'auditory', label: 'Auditory (lectures, discussions, audiobooks)' },
    { value: 'kinesthetic', label: 'Kinesthetic (hands-on activities, experiments)' },
    { value: 'reading_writing', label: 'Reading/Writing (notes, textbooks, articles)' },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Wand2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Create Your Personalized Study Plan</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Tell us about your goals and preferences, and our AI will craft a custom study plan just for you.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="learningGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are your main learning goals?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Pass the final Math exam, Learn basic Python for data analysis" {...field} rows={3} />
                      </FormControl>
                      <FormDescription>Be specific about what you want to achieve.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentKnowledge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe your current knowledge in these subjects.</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Beginner in French, know some algebra but struggle with calculus" {...field} rows={3} />
                      </FormControl>
                      <FormDescription>This helps tailor the plan to your starting point.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subjectsOfInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What subjects or topics do you want to focus on?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Algebra, Moroccan History, Introduction to Chemistry" {...field} />
                    </FormControl>
                    <FormDescription>List the main areas for your study plan. You can separate multiple subjects with commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="preferredLearningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Learning Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your preferred learning style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {learningStyleOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeAvailablePerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Available Per Week</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationInWeeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Duration (in weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 8" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate My Study Plan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Our AI is crafting your personalized plan...</p>
            <p className="text-sm text-muted-foreground">This might take a moment.</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Oops! Something went wrong.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">Please try adjusting your inputs or try again later.</p>
          </CardContent>
        </Card>
      )}

      {studyPlan && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-accent" />
                <div>
                    <CardTitle className="text-2xl font-bold text-accent-foreground">{studyPlan.planTitle}</CardTitle>
                    <CardDescription className="text-md">{studyPlan.introduction}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" /> Weekly Breakdown
              </h3>
              {studyPlan.weeklyBreakdown.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {studyPlan.weeklyBreakdown.map((week, index) => (
                    <AccordionItem value={`week-${index + 1}`} key={index}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Week {week.weekNumber}:</span>
                            <span className="font-normal text-muted-foreground text-sm truncate max-w-xs md:max-w-md lg:max-w-lg">
                                {week.focusTopics.join(', ') || 'General Focus'}
                            </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pl-2 text-muted-foreground">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Focus Topics:</h4>
                          <ul className="list-disc list-inside ml-4 space-y-0.5 text-sm">
                            {week.focusTopics.map((topic, i) => <li key={i}>{topic}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Learning Activities:</h4>
                          <ul className="list-disc list-inside ml-4 space-y-0.5 text-sm">
                            {week.learningActivities.map((activity, i) => <li key={i}>{activity}</li>)}
                          </ul>
                        </div>
                        <p className="text-sm flex items-center">
                            <Clock className="mr-1.5 h-4 w-4 text-primary/80" />
                            <strong>Estimated Time:</strong>&nbsp;{week.estimatedTime}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No weekly breakdown provided in the plan.</p>
              )}
            </div>

            {studyPlan.suggestedResources && studyPlan.suggestedResources.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" /> Suggested Resources
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground text-sm">
                  {studyPlan.suggestedResources.map((resource, index) => (
                    <li key={index}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}

            {studyPlan.motivationalTip && (
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Motivational Tip
                </h3>
                <p className="text-muted-foreground italic">"{studyPlan.motivationalTip}"</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
             <Button variant="outline" onClick={() => {
                 setStudyPlan(null); 
                 form.reset();
                 window.scrollTo({top:0, behavior: 'smooth'});
                 }}>
                Create Another Plan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default StudyPlanPage;
