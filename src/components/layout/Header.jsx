import React from "react";
import { logout } from '@/utils/logout';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
let title = "";
let username = "Người dùng";
try {
    const userData = JSON.parse(localStorage.getItem("username"));
    // console.log(userData);
    if(userData?.xa?.id==null)
    {
        title =  "Quyền quản trị";
    }else
    {
        title = "UBND "+userData?.xa?.ten_xa || "Quyền quản trị";
    }
    username = userData?.name || username;
} catch (err) {
    console.warn("Invalid user data in localStorage "+ err);
}
  const handleLogout = () => {
    logout(navigate);
  };
  return (
        <div class="w-full bg-gray-50 shadow-md py-3 sm:py-4 px-4 sm:px-5 opacity-95">
          <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div class="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-400 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 class="text-lg sm:text-xl font-bold text-gray-800">Thống kê Nông nghiệp</h1>
                </div>
                <button class="sm:hidden text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            <div class="text-base sm:text-[28px] font-semibold text-gray-700 text-center sm:text-left order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
                {title}
            </div>
            <div id="userSection" class=" flex items-center space-x-4">
              <span class="text-gray-700 font-medium">Xin chào, {username}</span>
              <button  onClick={handleLogout} class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105" >
                Đăng xuất
              </button>
            </div>  
          </div>
        </div>
        
  );
};

export default Header;