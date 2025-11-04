import { Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { GetUsers } from "../../services/activities/get-users";
import { UserDto } from "@/types";

interface UserSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function UserSelect({
  value,
  onChange,
  placeholder = "Kullanıcı seçin...",
  style,
  disabled = false,
}: UserSelectProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search?: string) => {
    try {
      setLoading(true);
      const response = await GetUsers({query: {search: search || ""}});
      const userData = response.data || [];

      const formattedUsers = userData.map((user: UserDto) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
        name: user.name,
        email: user.email,
      }));

      setUsers(formattedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (value.length >= 2 || value.length === 0) {
      fetchUsers(value);
    }
  };

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={
        loading ? (
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Spin size="small" />
          </div>
        ) : (
          "Kullanıcı bulunamadı"
        )
      }
      options={users}
      allowClear
    />
  );
}
