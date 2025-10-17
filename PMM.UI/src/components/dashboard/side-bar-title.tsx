import assets from "@/assets";
import { Link } from "react-router-dom";
export default function SideBarTitle() {
  return (
    <>
      <Link to="/">
        <div className=" text-lg font-semibold flex flex-col items-center justify-between">
          <img src={assets.Logo} alt="Logo" className="w-32 h-20" />
          <p className="text-sm text-center">1.1.1.1/24</p>
        </div>
      </Link>
    </>
  );
}
