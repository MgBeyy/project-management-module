import { Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { GetUsers } from "../../services/activities/get-users";

interface UserSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function UserSelect({
  value,
  onChange,
  placeholder = "Kullanıcı seçin...",
  style,
}: UserSelectProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search?: string) => {
    try {
      setLoading(true);
      const response = await GetUsers(search);
      
      
      const result = response.result || response;
      const userData = result.data || [];
      
      const formattedUsers = userData.map((user: any) => ({
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
