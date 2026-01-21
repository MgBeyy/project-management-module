import assets from "@/assets";
import { Link } from "react-router-dom";

export default function SideBarTitle() {
  return (
    <>
      <div className="flex items-center justify-center relative overflow-visible">
        <Link to="/">
          <div style={{margin : 25}} className="text-lg font-semibold flex flex-col items-center justify-center">
            <img src={assets.Logo} alt="Logo" className="max-w-32 max-h-20 w-full" />
          </div>
        </Link>
      </div>
    </>
  );
}
