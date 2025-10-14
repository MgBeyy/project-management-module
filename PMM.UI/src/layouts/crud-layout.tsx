import { Outlet } from "react-router-dom";
import Header from "../features/dashboard/components/header";
import SideBar from "../features/dashboard/components/side-bar";

export default function CrudLayout() {
  return (
    <div className="bg-[#F5F5F5] w-full flex items-center justify-center">
      <div className="flex flex-1">
        <SideBar />
        <div className="h-full w-full flex flex-1 flex-col max-w-[calc(100vw-250px)]">
          <Header />
          <main className="rounded-md flex-1 mx-auto mt-2 bg-white border-[#EFEFEF] border-2">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
