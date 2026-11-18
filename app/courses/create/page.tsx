"use client";

import { CourseFormOrganism } from "@/components/organisms/CourseFormOrganism";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";

export default function CreateCoursePage() {
  return (
    <DashboardTemplate>
      <CourseFormOrganism />
    </DashboardTemplate>
  );
}
