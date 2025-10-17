import { Button, Menu, type MenuProps } from "antd";
import SideBarTitle from "./side-bar-title";
import Sider from "antd/es/layout/Sider";
import React from "react";
import { FaFolderOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";
import { useSidebarStore } from "@/store/zustand/sidebarStore";

export default function SideBar() {
  const { collapsed, setCollapsed, toggleCollapsed } = useSidebarStore();

  const itemsOptions = ["Projeler", "Görevler", "Etkinlikler"];
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
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{ background: "white" }}
        width={250}
        className="h-full w-72 rounded-md bg-white border-[#EFEFEF] border-2"
      >
        <Button
          type="text"
          icon={collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
          onClick={toggleCollapsed}
          size="large"
          style={{position: 'absolute'}}
          className="text-gray-600 hover:text-gray-800 right-0 z-10 bottom-4"
        />
        <SideBarTitle />
        <Menu mode="inline" style={{ height: "100%" }} items={items} />
      </Sider>
    </>
  );
}
