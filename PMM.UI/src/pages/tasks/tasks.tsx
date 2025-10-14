import TasksCrudModal from "@/features/tasks/components/tasks-crud-modal";
import TasksFilter from "@/features/tasks/components/tasks-filter";
import TasksCustomTable from "@/features/tasks/components/tasks-table";

export default function Tasks() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Görevler
      </h1>

      <TasksFilter />

      <TasksCrudModal />

      <TasksCustomTable />
    </div>
  );
}
