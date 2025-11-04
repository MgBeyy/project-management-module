import ActivitiesCalendar from "@/components/activities/activities-calendar";
import { ActivityFilter } from "@/components/activities/activity-filter";

export default function Activities() {
  return (
    <div style={{ padding: "12px" }}>
      <ActivityFilter />
      <ActivitiesCalendar />
    </div>
  );
}
