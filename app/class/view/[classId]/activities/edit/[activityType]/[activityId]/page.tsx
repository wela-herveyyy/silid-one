"use client";

import { useParams } from "next/navigation";
import { ActivityFormOrganism } from "@/components/organisms/ActivityFormOrganism";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { ActivityClassification } from "@/types/lms";

export default function EditActivityPage() {
  const { classId, activityType, activityId } = useParams<{
    classId: string;
    activityType: ActivityClassification;
    activityId: string;
  }>();
  const { activities } = useLmsSession();
  const existing = activities.find((a) => a.id === activityId);

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <ActivityFormOrganism
        classId={classId}
        activityType={existing?.type ?? activityType}
        existing={existing}
      />
    </ClassWorkspaceTemplate>
  );
}
