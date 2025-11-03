
import { IoSettingsOutline  } from 'react-icons/io5';
import { FaPhoneAlt,FaHistory  ,FaFileUpload, FaKey    } from 'react-icons/fa';
import { FaUserPen } from "react-icons/fa6";
import {MdEditNotifications, MdOutlineFormatListNumbered} from "react-icons/md";
import { CiCircleList } from "react-icons/ci";
import { MdOutlineKeyboardReturn } from "react-icons/md";
import { Link } from 'react-router-dom';
const Home = () => {
    const role=localStorage.getItem('role');

    return (

     <div class="container mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8 mt-8 text-white text-shadow-lg">Cài đặt</h1>
        
        <div class="flex flex-wrap justify-center gap-5">
            
            <Link to="/updateuser" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                <div class="w-15 h-15 mb-5 flex items-center justify-center">
                    <FaUserPen class=" text-black-500 text-7xl" />
                    <i class="fas fa-home text-blue-500 text-4xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Thông tin tài khoản</h3>

            </Link >
           
            <Link to="/changepassword" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                <div class="w-15 h-15 mb-5 flex items-center justify-center">
                    <FaKey class=" text-black-500 text-7xl" />
                    <i class="fas fa-home text-blue-500 text-4xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2"> Thay đổi mật khẩu</h3>

            </Link >
            {role==="admin"&&(
                <Link to="/notification" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <MdEditNotifications  class=" text-black-500 text-7xl" />

                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Thông báo nộp báo cáo</h3>
                </Link >
            )}
            <Link to="/" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
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