import TasksCrudModal from "@/components/tasks/tasks-crud-modal";
import TasksFilter from "@/components/tasks/tasks-filter";
import TasksCustomTable from "@/components/tasks/tasks-table";

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
