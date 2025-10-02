import { Outlet } from "react-router-dom";
import Header from "../features/dashboard/components/header";
import SideBar from "../features/dashboard/components/side-bar";

export default function AppLayout() {
  return (
    <div className="bg-[#F5F5F5] h-screen w-full flex items-center justify-center">
      <div className="w-[98%] h-[95%] flex">
        <SideBar />
        <div className="h-full w-full flex flex-col justify-between">
          <Header />
          <main className="rounded-md overflow-hidden flex-1 w-[98%] mx-auto mt-5 bg-white border-[#EFEFEF] border-2">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
