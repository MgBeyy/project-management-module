import { Breadcrumb, Button } from "antd";
import { FaFolderOpen } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import SearchInput from "./search-input";
import {
  AiOutlineBell,
  AiOutlineFullscreenExit,
  AiOutlineMoon,
  AiOutlineSetting,
  AiOutlineStar,
} from "react-icons/ai";

import Account from "./account";
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
      pathTr: "Gorevler",
    },
    {
      pathOriginal: "activities",
      pathTr: "Etkinlikler",
    },
  ];
  return (
    <>
      <header className="w-[98%]  mx-auto rounded-md bg-white border-[#EFEFEF] border-2 p-5 flex items-center justify-between">
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
        <div className="w-96">
          <SearchInput />
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-gray-600 ">
            <Button type="text" icon={<AiOutlineFullscreenExit />} />
            <Button type="text" icon={<AiOutlineStar />} />
            <Button type="text" icon={<AiOutlineMoon />} />
            <Button type="text" icon={<AiOutlineSetting />} />
            <Button type="text" icon={<AiOutlineBell />} />
          </div>
          <div>
            <Account />
          </div>
        </div>
      </header>
    </>
  );
}
