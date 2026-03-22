import {
  getAllWeightEntriesAscending,
  getProjectionCache,
  getUserCurrentWeight,
  getUserGoalWeight,
  saveProjectionCache,
} from "@/database/database";
import { GoalProjectionResult } from "@/models/goalProjectionResult";
import { WeeklyDataItem } from "@/models/weeklyDataItem";
import { WeightEntry } from "@/models/weightEntry";
import {
  formatLocalDate,
  getWeekEnd,
  getWeekStart,
  parseLocalDate,
} from "./dateHelper";

// Groups raw weight entries into weeks and calculates weekly averages
function buildWeeklyData(weightRecords: WeightEntry[]): WeeklyDataItem[] {
  const grouped = new Map<string, number[]>();

  // Group all entries by their week start date
  for (const record of weightRecords) {
    const date = parseLocalDate(record.entry_date);
    const weekStart = formatLocalDate(getWeekStart(date));

    if (!grouped.has(weekStart)) {
      grouped.set(weekStart, []);
    }

    grouped.get(weekStart)!.push(record.weight);
  }

  const weeklyData: WeeklyDataItem[] = [];

  // Convert grouped weights into averaged weekly data
  for (const [weekStartDate, weights] of grouped.entries()) {
    const weekStart = parseLocalDate(weekStartDate);
    const weekEndDate = formatLocalDate(getWeekEnd(weekStart));

    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const averageWeight = total / weights.length;

    weeklyData.push({
      weekStartDate,
      weekEndDate,
      averageWeight,
    });
  }

  // Make sure weeks are in chronological order
  weeklyData.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));

  return weeklyData;
}

export function getGoalProjection(userId: number): GoalProjectionResult {
  const currentWeight = getUserCurrentWeight(userId);
  const goalWeight = getUserGoalWeight(userId);

  // If we don't have enough basic info, stop early
  if (currentWeight == null || goalWeight == null) {
    return {
      status: "not-enough-data",
      message: "Not enough data to project goal date",
    };
  }

  const poundsRemaining = currentWeight - goalWeight;

  // If already at or past goal, no projection needed
  if (poundsRemaining <= 0) {
    return {
      status: "goal-already-reached",
      message: "Goal already reached",
    };
  }

  const today = formatLocalDate(new Date());

  const cachedSummary = getProjectionCache(userId);

  let weeklyData: WeeklyDataItem[];

  // If we already built this today, reuse it instead of recalculating
  if (cachedSummary?.last_aggregated_date === today) {
    weeklyData = JSON.parse(cachedSummary.weekly_data_json) as WeeklyDataItem[];
  } else {
    // Otherwise rebuild from raw data
    const weightRecords = getAllWeightEntriesAscending(userId);
    weeklyData = buildWeeklyData(weightRecords);

    // Save result to cache so we don't recompute constantly
    saveProjectionCache(userId, today, JSON.stringify(weeklyData));
  }

  // Need at least 2 weeks to calculate change
  if (weeklyData.length < 2) {
    return {
      status: "not-enough-data",
      message: "Not enough data to project goal date",
    };
  }

  const weeklyChanges: number[] = [];

  // Calculate week-to-week changes
  for (let i = 1; i < weeklyData.length; i++) {
    const previousWeek = weeklyData[i - 1];
    const currentWeek = weeklyData[i];

    const weeklyChange = previousWeek.averageWeight - currentWeek.averageWeight;

    weeklyChanges.push(weeklyChange);
  }

  // Take last 4 weeks (or fewer if not available)
  const recentChanges = weeklyChanges.slice(-4);

  let totalWeightedChange = 0;
  let totalWeights = 0;
  let weightValue = recentChanges.length;

  // Apply simple weighting (more recent weeks matter more)
  for (const change of recentChanges) {
    totalWeightedChange += change * weightValue;
    totalWeights += weightValue;
    weightValue -= 1;
  }

  const weightedAverageChange = totalWeightedChange / totalWeights;

  // If trend isn't moving toward goal, we can't project
  if (weightedAverageChange <= 0) {
    return {
      status: "no-projection",
      message: "No projected goal date available",
    };
  }

  // Estimate how many weeks are needed to reach goal
  const weeksToGoal = Math.ceil(poundsRemaining / weightedAverageChange);

  // Use the last known week as the baseline for projection
  const lastWeekEndDate = parseLocalDate(
    weeklyData[weeklyData.length - 1].weekEndDate,
  );

  const projectedGoalDate = new Date(lastWeekEndDate);
  projectedGoalDate.setDate(projectedGoalDate.getDate() + weeksToGoal * 7);

  return {
    status: "ok",
    currentWeight,
    goalWeight,
    poundsRemaining,
    weeklyData,
    weightedAverageWeeklyChange: weightedAverageChange,
    weeksToGoal,
    projectedGoalDate: formatLocalDate(projectedGoalDate),
  };
}
