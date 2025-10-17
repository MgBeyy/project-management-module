import { Outlet } from "react-router-dom";
import SideBar from "../dashboard/side-bar";
import Header from "../dashboard/header";

// import Test from "../pages/projects";

export default function AppLayout() {
  return (
    <div className="bg-[#F5F5F5] w-full h-screen flex items-center justify-center">
      <div className="flex h-full flex-1">
        <SideBar />
        <div className="h-full w-full flex flex-col max-w-[calc(100vw-250px)]">
          <Header />
          <main className="rounded-md flex-1 mx-auto mt-5 bg-white border-[#EFEFEF] border-2 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
