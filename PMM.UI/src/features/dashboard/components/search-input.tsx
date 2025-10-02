import { Input } from "antd";
import { HiOutlineSearch } from "react-icons/hi";

export default function SearchInput() {
  return (
    <>
      <Input
        placeholder="Sayfa Ara... (Ctrl + K)"
        variant="filled"
        prefix={<HiOutlineSearch />}
        allowClear
      />
    </>
  );
}
