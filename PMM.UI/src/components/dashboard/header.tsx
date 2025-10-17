import { Breadcrumb } from "antd";
import { FaFolderOpen } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const pathSegments = currentPath.split("/").filter(Boolean);
  const pathSegmentsMap = [
    {
      pathOriginal: "projects",
      pathTr: "Projeler",
    },
    {
      pathOriginal: "tasks",
      pathTr: "Görevler",
    },
    {
      pathOriginal: "activities",
      pathTr: "Etkinlikler",
    },
  ];
  return (
    <>
      <header className=" rounded-md bg-white border-[#EFEFEF] border-2 p-5 flex items-center justify-between">
        <div className="flex gap-7 items-center">
          <Link to="/">
            <div className="flex gap-2 text-gray-600">
              <MdOutlineDashboard size={24} /> Anasayfa
            </div>
          </Link>
          <div>
            {pathSegments.length > 0 && (
              <Breadcrumb
                items={[
                  {
                    title: (
                      <Link to="/pm-module/projects">
                        <div className="flex gap-2 items-center text-gray-600">
                          <FaFolderOpen />
                          <span>PM Module</span>
                        </div>
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <span className="text-blue-500 font-bold">
                        {pathSegments[1] === ""
                          ? ""
                          : pathSegmentsMap.find(
                            segment =>
                              segment.pathOriginal === pathSegments[1]
                          )?.pathTr}
                      </span>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </header>
    </>
  );
}
