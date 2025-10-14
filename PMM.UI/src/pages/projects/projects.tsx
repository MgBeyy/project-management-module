import ProjectsFilter from "@/features/projects/components/projects-filter";
import CrudModal from "@/features/projects/components/projects-crud-modal";
import CustomTable from "@/features/projects/components/projcets-table";

export default function Projects() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="bg-[#F1F5FF] rounded-2xl m-4 mb-0 flex justify-center shrink-0">
        <ProjectsFilter />
      </div>

      <div className="m-4 flex items-center justify-between rounded-t-2xl bg-[#F1F5FF] shrink-0">
        <CrudModal />
      </div>

      <div className="flex-1 overflow-auto rounded-b-2xl m-4 mt-0 bg-white min-h-0">
        <CustomTable />
      </div>
    </div>
  );
}
