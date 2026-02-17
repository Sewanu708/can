"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DrillConfigSchema,
  drillConfigSchema,
  DrillType,
  Mode,
  TierType,
  QuestionCategory,
} from "@/lib/schema";

interface DrillConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DrillConfigSchema) => void;
}

export default function DrillConfigModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: DrillConfigModalProps) {
  const form = useForm<DrillConfigSchema>({
    resolver: zodResolver(drillConfigSchema),
    defaultValues: {
      numberOfQuestions: 10,
      drillMode: Mode.FLEX,
      questionType: DrillType.MATH,
      difficulty: undefined, // Optional
      category: undefined, // Optional
      totalTime: undefined, // Conditional
      timePerQuestion: undefined, // Conditional
    },
  });

  const selectedMode = form.watch("drillMode");

  const handleSubmit = (data: DrillConfigSchema) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure New Drill</DialogTitle>
          <DialogDescription>
            Set up your drill parameters before you start.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drillMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drill Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a drill mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {Object.values(Mode).map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedMode === Mode.SEMI_STRICT && (
              <FormField
                control={form.control}
                name="totalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set the total time for the entire drill.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedMode === Mode.STRICT && (
              <FormField
                control={form.control}
                name="timePerQuestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Per Question (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const time = e.target.value;
                          form.setValue('timePerQuestion',Number(time))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the time limit for each question.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {Object.values(DrillType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {Object.values(TierType).map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {tier
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {Object.values(QuestionCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-6">
              Start Drill
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
