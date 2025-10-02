import CrudModal from "../features/crud-modal/components/crud-modal";
import CustomTable from "../features/table/components/custom-table";

export default function Projects() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="h-1/3 bg-[#F1F5FF] rounded-2xl m-4 mb-0"></div>
      <div className="m-4 flex items-center justify-between rounded-t-2xl bg-[#F1F5FF]">
        <CrudModal />
      </div>
      <CustomTable />
    </div>
  );
}
