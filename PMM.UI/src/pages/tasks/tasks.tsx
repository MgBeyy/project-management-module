import TasksCrudModal from "@/components/tasks/tasks-crud-modal";
import TasksFilter from "@/components/tasks/tasks-filter";
import TasksCustomTable from "@/components/tasks/tasks-table";

export default function Tasks() {
  return (
    <div style={{ padding: "16px" }}>
      <div className="bg-[#F1F5FF] rounded-2xl mb-4 flex justify-center shrink-0">
        <TasksFilter />
      </div>
      <div className="flex items-center justify-between rounded-t-2xl bg-[#F1F5FF] shrink-0">
        <TasksCrudModal />
      </div>
      <TasksCustomTable />
    </div>
  );
}
