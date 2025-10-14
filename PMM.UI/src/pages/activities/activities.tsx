import ActivitiesCalendar from "@/features/activities/components/activities-calendar";

export default function Activities() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Etkinlikler
      </h1>

      <ActivitiesCalendar />
    </div>
  );
}
