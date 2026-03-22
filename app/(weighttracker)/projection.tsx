import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { getCurrentUser } from "@/database/database";
import { useAppStyles } from "@/hooks/useAppStyles";
import { getGoalProjection } from "@/utils/projection";

type ProjectionState = null | ReturnType<typeof getGoalProjection>;

function formatWeight(value: number) {
  return value.toFixed(1);
}

export default function ProjectionScreen() {
  const { styles, insets, theme } = useAppStyles();
  const [projection, setProjection] = useState<ProjectionState>(null);

  function loadProjection() {
    const currentUserId = getCurrentUser();

    if (!currentUserId) {
      setProjection({
        status: "not-enough-data",
        message: "No user selected",
      });
      return;
    }

    const result = getGoalProjection(currentUserId);
    setProjection(result);
  }

  useFocusEffect(
    useCallback(() => {
      loadProjection();
    }, []),
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 16 }]}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text style={styles.title}>Projection</Text>

        {!projection && (
          <Text style={styles.emptyText}>Loading projection...</Text>
        )}

        {projection?.status !== "ok" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Projection Status</Text>
            <Text style={styles.bodyText}>{projection?.message}</Text>
          </View>
        )}

        {projection?.status === "ok" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              <Text style={styles.bodyText}>
                Current Weight: {formatWeight(projection.currentWeight)}
              </Text>
              <Text style={styles.bodyText}>
                Goal Weight: {formatWeight(projection.goalWeight)}
              </Text>
              <Text style={styles.bodyText}>
                Pounds Remaining: {formatWeight(projection.poundsRemaining)}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Projection</Text>
              <Text style={styles.bodyText}>
                Average Weekly Change:{" "}
                {formatWeight(projection.weightedAverageWeeklyChange)}
              </Text>
              <Text style={styles.bodyText}>
                Weeks To Goal: {projection.weeksToGoal}
              </Text>
              <Text style={styles.bodyText}>
                Projected Goal Date: {projection.projectedGoalDate}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Weekly Averages</Text>

              {projection.weeklyData.map((week) => (
                <View
                  key={week.weekStartDate}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <Text style={styles.bodyText}>
                    {week.weekStartDate} to {week.weekEndDate}
                  </Text>
                  <Text
                    style={[
                      styles.bodyText,
                      { color: theme.secondaryText, marginTop: 4 },
                    ]}
                  >
                    Avg Weight: {formatWeight(week.averageWeight)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
