import { Outlet } from "react-router-dom";
import SideBar from "../dashboard/side-bar";
import Header from "../dashboard/header";
import { useSidebarStore } from "@/store/zustand/sidebarStore";

export default function AppLayout() {
  const { collapsed } = useSidebarStore();

  return (
    <div className="bg-[#F5F5F5] w-full h-screen flex items-center justify-center">
      <div className="flex h-full flex-1">
        <SideBar />
        <div className="h-full w-full flex flex-col">
          <Header />
          <main className="rounded-md flex-1 mx-auto mt-5 bg-white border-[#EFEFEF] border-2 w-full" style={{ maxWidth: collapsed ? 'calc(100vw - 100px)' : 'calc(100vw - 270px)' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
