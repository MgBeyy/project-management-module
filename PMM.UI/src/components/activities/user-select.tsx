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
      const response = await GetUsers({ query: { search: search || "" } });
      const userData = response.data || [];

      const formattedUsers = userData.map((user: UserDto) => {
        let capacityNode = null;
        if (user.capacityPercent !== undefined) {
          let color = "#ff4d4f"; // Red (< 20)
          if (user.capacityPercent >= 50) color = "#52c41a"; // Green
          else if (user.capacityPercent >= 20) color = "#faad14"; // Yellow

          capacityNode = (
            <span style={{
              marginLeft: "8px",
              backgroundColor: color,
              color: "#fff",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.75em",
              fontWeight: 500
            }}>
              %{user.capacityPercent}
            </span>
          );
        }

        return {
          value: user.id,
          label: (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>{user.name}</span>
              {capacityNode}
              <span style={{ color: "#999", marginLeft: "8px", fontSize: "0.85em" }}>
                ({user.email})
              </span>
            </div>
          ),
          name: user.name,
          email: user.email,
        };
      });

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
