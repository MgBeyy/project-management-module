import { Menu, type MenuProps } from "antd";
import SideBarTitle from "./side-bar-title";
import Sider from "antd/es/layout/Sider";
import React from "react";
import { FaFolderOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SideBar() {
  const itemsOptions = ["Projeler", "Gorevler", "Etikinlikler"];
  const itemsOptionsEn = ["Projects", "Tasks", "Activities"];
  const items: MenuProps["items"] = [FaFolderOpen].map((icon, index) => {
    return {
      className: "h-screen",
      key: `PM_Module`,
      icon: React.createElement(icon),
      label: `PM Module`,
      children: itemsOptions.map((element, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: (
            <Link to={`/pm-module/${itemsOptionsEn[j].toLowerCase()}`}>
              {element}
            </Link>
          ),
        };
      }),
    };
  });

  return (
    <>
      <Sider
        style={{ width: "50rem", background: "white" }}
        width={250}
        className="h-full w-72 rounded-md bg-white border-[#EFEFEF] border-2 overflow-hidden"
      >
        <SideBarTitle />
        <Menu mode="inline" style={{ height: "100%" }} items={items} />
      </Sider>
    </>
  );
}
