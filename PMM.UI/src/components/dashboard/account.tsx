import { useState } from "react";
import { Avatar, Dropdown, Space } from "antd";
import { AiOutlineUser, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import type { MenuProps } from "antd";

export default function Account() {
  const [open, setOpen] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Profil",
    },
    {
      key: "2",
      label: "Ayarlar",
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "Çıkış Yap",
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      onOpenChange={flag => setOpen(flag)}
      open={open}
    >
      <Space style={{ cursor: "pointer" }}>
        <Avatar icon={<AiOutlineUser />} size={"small"} />
        <span className="text-sm">Kullanıcı Adı</span>
        {open ? <AiOutlineUp /> : <AiOutlineDown />}
      </Space>
    </Dropdown>
  );
}
