import "./App.css";
import { DatePicker } from "antd";
import { CgAddR } from "react-icons/cg";
function App() {
  return (
    <>
      <h1 className="text-3xl font-bold">
        <DatePicker />
        <CgAddR />
      </h1>
    </>
  );
}

export default App;
