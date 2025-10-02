import { Link } from "react-router-dom";
import LogoImage from "../../../assets/Gemini_Generated_Image_5um8055um8055um8.png";
export default function SideBarTitle() {
  return (
    <>
      <Link to="/">
        <div className=" text-lg font-semibold flex flex-col items-center justify-between">
          <img src={LogoImage} alt="" className="w-32 h-20" />
          <p className="text-sm text-center">1.1.1.1/24</p>
        </div>
      </Link>
    </>
  );
}
