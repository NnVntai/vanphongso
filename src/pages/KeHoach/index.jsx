import { IoSettingsOutline  } from 'react-icons/io5';
import { FaPhoneAlt ,FaChartPie ,FaHistory ,FaFileUpload ,FaUsers   } from 'react-icons/fa';
import {MdOutlineFormatListNumbered, MdOutlineKeyboardReturn} from "react-icons/md";
import { CiCircleList } from "react-icons/ci";
import { GiPackedPlanks } from "react-icons/gi";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaWpforms } from "react-icons/fa6";

import { Link } from 'react-router-dom';
const Home = () => {
    const role=localStorage.getItem('role');

    return (

        <div class="container mx-auto">
            <h1 class="text-3xl font-bold text-center mb-8 mt-8 text-white text-shadow-lg">Chức năng</h1>

            <div class="flex flex-wrap justify-center gap-5">
                {role==="admin"&&
                    (<Link to="/kehoachfile" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            < PiMicrosoftExcelLogo class=" text-black-500 text-7xl" />
                            <i class="fas fa-home text-blue-500 text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Nhập kế hoạch File Excel</h3>

                    </Link >)}

                {role==="admin"&&
                    (<Link to="/kehoachmanual" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            <FaWpforms  class=" text-black-500 text-7xl" />
                            <i class="fas fa-home text-blue-500 text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2"> Nhập kế hoạch thủ công</h3>

                    </Link >)}
                <Link to="/indexchitieu" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <MdOutlineKeyboardReturn  class=" text-black-500 text-7xl" />
                        <i class="fas fa-home text-blue-500 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Quay lại trang chủ</h3>

                </Link >
            </div>
        </div>

    );
};
export default Home;