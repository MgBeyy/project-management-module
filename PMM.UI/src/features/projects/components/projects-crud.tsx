import { Button, Divider } from "antd";
import { useState } from "react";
import type { ConfigProviderProps } from "antd";
import {
  AiOutlinePlus, // +
  AiOutlineEdit, // kalem
  AiOutlineEye, // göz
  AiOutlineDelete, // çöp kutusu
} from "react-icons/ai";

type SizeType = ConfigProviderProps["componentSize"];

export default function CrudModal() {
  const [size] = useState<SizeType>("middle"); // default is 'middle'

  return (
    <div className="m-4 flex items-center justify-around rounded-3xl bg-[#F1F5FF] gap-4">
      <span>Projeler</span>
      <Divider type="vertical" className="h-6" />
      <Button type="primary" icon={<AiOutlinePlus />} size={size} />
      <Button type="primary" icon={<AiOutlineEdit />} size={size} />
      <Button type="primary" icon={<AiOutlineEye />} size={size} />
      <Button type="primary" icon={<AiOutlineDelete />} size={size} />
    </div>
  );
}
