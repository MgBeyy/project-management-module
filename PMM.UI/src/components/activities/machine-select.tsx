import { Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { GetMachines } from "../../services/machines/get-machines";
import { MachineDto } from "@/types";

interface MachineSelectProps {
    value?: number;
    onChange?: (value: number) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

export default function MachineSelect({
    value,
    onChange,
    placeholder = "Makine seçin...",
    style,
    disabled = false,
}: MachineSelectProps) {
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async (search?: string) => {
        try {
            setLoading(true);
            const response = await GetMachines({ query: { search: search || "" } });
            const machineData = response.data || [];

            const formattedMachines = machineData.map((machine: MachineDto) => {
                return {
                    value: machine.id,
                    label: (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span>{machine.name}</span>
                            {machine.status && (
                                <span style={{
                                    marginLeft: "8px",
                                    fontSize: "0.85em",
                                    color: machine.status === 'Available' ? 'green' : 'orange'
                                }}>
                                    ({machine.status})
                                </span>
                            )}
                        </div>
                    ),
                    name: machine.name,
                };
            });

            setMachines(formattedMachines);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching machines:", error);
            setMachines([]);
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        if (value.length >= 2 || value.length === 0) {
            fetchMachines(value);
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
                    "Makine bulunamadı"
                )
            }
            options={machines}
            allowClear
        />
    );
}
