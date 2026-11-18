"use client";

import { useParams } from "next/navigation";
import { ActivityFormOrganism } from "@/components/organisms/ActivityFormOrganism";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import type { ActivityClassification } from "@/types/lms";

export default function CreateActivityPage() {
  const { classId, activityType } = useParams<{
    classId: string;
    activityType: ActivityClassification;
  }>();

  const normalizedType: ActivityClassification =
    activityType === "assignment" ||
    activityType === "material" ||
    (activityType as string) === "materials"
      ? activityType === "assignment"
        ? "assignment"
        : "material"
      : "quiz";

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <ActivityFormOrganism classId={classId} activityType={normalizedType} />
    </ClassWorkspaceTemplate>
  );
}
