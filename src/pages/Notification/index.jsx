
import { IoSettingsOutline  } from 'react-icons/io5';
import { FaPhoneAlt,FaHistory  ,FaFileUpload, FaKey    } from 'react-icons/fa';
import { FaUserPen } from "react-icons/fa6";
import {MdEditNotifications, MdCalendarMonth  } from "react-icons/md";
import { CiCircleList } from "react-icons/ci";
import { BsCalendar2Month,BsCalendar4Week ,BsCalendar3Week  } from "react-icons/bs";
import { FaRegCalendarDays } from "react-icons/fa6";
import { MdOutlineKeyboardReturn } from "react-icons/md";
import { LuCalendar1 } from "react-icons/lu";
import { Link } from 'react-router-dom';
const Home = () => {
    const role=localStorage.getItem('role');

    return (

        <div class="container mx-auto">
            <h1 class="text-3xl font-bold text-center mb-8 mt-8 text-white text-shadow-lg">Cài đặt</h1>

            <div class="flex flex-wrap justify-center gap-5">
                {role==="admin"&&(
                    <Link to="/weekly" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            <BsCalendar4Week class=" text-black-500 text-7xl" />
                            <i class="fas fa-home text-blue-500 text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Thông báo theo Tuần</h3>
                    </Link >
                )}
                {role==="admin"&&(
                    <Link to="/monthly" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            <LuCalendar1  class=" text-black-500 text-7xl" />
                            <i class="fas fa-home text-blue-500 text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Thông báo theo Tháng & Quý</h3>

                    </Link >
                )}
                {role==="admin"&&(
                    <Link to="/quarterly" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            <FaRegCalendarDays   class=" text-black-500 text-7xl" />

                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Thông báo theo Quý</h3>
                    </Link >
                )}
                {role==="admin"&&(
                    <Link to="/yearly" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            <MdCalendarMonth   class=" text-black-500 text-7xl" />

                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Thông báo theo Năm</h3>
                    </Link >
                )}
                <Link to="/setting" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <MdOutlineKeyboardReturn  class=" text-black-500 text-7xl" />
                        <i class="fas fa-home text-blue-500 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Quay Lại</h3>

                </Link >


            </div>
        </div>
    );
};
export default Home;