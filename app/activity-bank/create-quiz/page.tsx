"use client";

import { ActivityFormOrganism } from "@/components/organisms/ActivityFormOrganism";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";

export default function BankCreateQuizPage() {
  return (
    <DashboardTemplate>
      <div className="space-y-4">
        <ActivityFormOrganism classId="cls-1" activityType="quiz" />
      </div>
    </DashboardTemplate>
  );
}
