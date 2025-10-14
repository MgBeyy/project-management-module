import { Outlet } from "react-router-dom";
import Header from "../features/dashboard/components/header";
import SideBar from "../features/dashboard/components/side-bar";
// import Test from "../pages/projects";

export default function AppLayout() {
  return (
    <div className="bg-[#F5F5F5] w-full h-screen flex items-center justify-center">
      <div className="flex h-full flex-1">
        <SideBar />
        <div className="h-full w-full flex flex-col max-w-[calc(100vw-250px)]">
          <Header />
          <main className="rounded-md overflow-hidden flex-1 mx-auto mt-5 bg-white border-[#EFEFEF] border-2 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
