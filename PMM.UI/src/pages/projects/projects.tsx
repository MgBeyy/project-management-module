import ProjectsFilter from "@/features/projects/components/projects-filter";
import CrudModal from "@/features/projects/components/projects-crud-modal";
import CustomTable from "@/features/projects/components/projcets-table";

export default function Projects() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="bg-[#F1F5FF] rounded-2xl m-4 mb-0 flex justify-center">
        <ProjectsFilter />
      </div>
      <div className="m-4 flex items-center justify-between rounded-t-2xl bg-[#F1F5FF]">
        <CrudModal />
      </div>
      <CustomTable />
    </div>
  );
}
