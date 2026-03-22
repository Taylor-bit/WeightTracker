import { WeeklyDataItem } from "./weeklyDataItem";

export type GoalProjectionResult =
  | { status: "goal-already-reached"; message: string }
  | { status: "not-enough-data"; message: string }
  | { status: "no-projection"; message: string }
  | {
      status: "ok";
      currentWeight: number;
      goalWeight: number;
      poundsRemaining: number;
      weeklyData: WeeklyDataItem[];
      weightedAverageWeeklyChange: number;
      weeksToGoal: number;
      projectedGoalDate: string;
    };
