import { Button, Divider } from "antd";
import { useState } from "react";
import type { ConfigProviderProps } from "antd";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineDelete,
} from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

type SizeType = ConfigProviderProps["componentSize"];

export default function CrudModal() {
  const [size] = useState<SizeType>("middle");
  const rowInfo = useSelector((state: any) => state.projectsRowInfo.value);
  console.log("seçilen proje bilgilerfadsfadsfadsfdsafi:", rowInfo);
  return (
    <div className="m-4 flex items-center justify-around rounded-3xl bg-[#F1F5FF] gap-4">
      <span>Projeler</span>
      <Divider type="vertical" className="h-6" />
      <Link to="/pm-module/projects/create">
        <Button type="primary" icon={<AiOutlinePlus />} size={size} />
      </Link>
      <Link to="/pm-module/projects/edit">
        <Button type="primary" icon={<AiOutlineEdit />} size={size} />
      </Link>
      <Link to="/pm-module/projects/view">
        <Button type="primary" icon={<AiOutlineEye />} size={size} />
      </Link>
      <Link to="/pm-module/projects/delete">
        <Button type="primary" icon={<AiOutlineDelete />} size={size} />
      </Link>
    </div>
  );
}
