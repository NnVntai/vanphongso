import { IoSettingsOutline  } from 'react-icons/io5';
import { FaPhoneAlt ,FaChartPie ,FaHistory ,FaFileUpload ,FaUsers   } from 'react-icons/fa';
import { MdEditNotifications  } from "react-icons/md";
import { CiCircleList } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { LiaPhoneAltSolid } from "react-icons/lia";
import {GiPackedPlanks} from "react-icons/gi";
const Home = () => {
    const role=localStorage.getItem('role');

    return (

     <div class="container mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8 mt-8 text-white text-shadow-lg">Chức năng</h1>

        <div class="flex flex-wrap justify-center gap-5">
            {role==="admin"&&
                (<Link to="/reportindex" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <FaChartPie class=" text-black-500 text-7xl" />
                        <i class="fas fa-home text-blue-500 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Báo Cáo</h3>

                </Link >)}
            {role==="admin"&&
                (<Link to="/listuser" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <FaUsers class=" text-black-500 text-7xl" />
                        <i class="fas fa-home text-blue-500 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Tài khoản người dùng</h3>

                </Link >)}
            {role==="admin"&&(
                <Link to="/indexchitieu" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <CiCircleList class=" text-black-500 text-7xl" />

                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Chỉ tiêu báo cáo</h3>
                </Link >
            )}
            {role==="admin"&&(
                <Link to="/adminSupport" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <LiaPhoneAltSolid class=" text-black-500 text-7xl" />

                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Đóng góp ý kiến & Báo lỗi </h3>
                </Link >
            )}

            {role==="client"&&(
                <Link to="/reporthistory" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <FaHistory class=" text-black-500 text-7xl" />

                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Xem lịch sử báo cáo</h3>
                </Link >
            )}
            {role==="client"&&
                (<Link to="reportfile" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <FaFileUpload class=" text-black-500 text-7xl" />
                        <i class="fas fa-home text-blue-500 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Nhập báo cáo tải File lên</h3>

                </Link >
                )}
            {role==="client"&&
                ( <Link to="/kehoach" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                        <div class="w-15 h-15 mb-5 flex items-center justify-center">
                            <GiPackedPlanks class=" text-black-500 text-7xl" />
                            <i class="fas fa-home text-blue-500 text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Nhập kế hoạch chỉ tiêu</h3>
                    </Link >
                )}
            {role==="client"&&
                (<Link to="telephone" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px] ">
                    <div class="w-15 h-15 mb-5 flex items-center justify-center">
                        <LiaPhoneAltSolid class=" text-black-500 text-7xl" />
                        <i class="fas fa-home text-blue-500 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Liên hệ</h3>

                </Link >)
            }

            {/*{role==="client"&&(*/}
            {/*    <Link to="/reportmanual" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">*/}
            {/*        <div class="w-15 h-15 mb-5 flex items-center justify-center">*/}
            {/*            <MdOutlineFormatListNumbered class=" text-black-500 text-7xl" />*/}

            {/*        </div>*/}
            {/*        <h3 class="text-xl font-bold text-gray-800 mb-2">Nhập báo cáo thủ công</h3>*/}
            {/*    </Link >*/}
            {/*)}*/}

            {/*<Link to="/setting/changeAuth" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">*/}
            {/*    <div class="w-15 h-15 mb-5 flex items-center justify-center">*/}
            {/*        <FaPhoneAlt class=" text-black-500 text-6xl" />*/}
            {/*        /!* <i class="fas fa-user text-blue-500 text-4xl"></i> *!/*/}
            {/*    </div>*/}
            {/*    <h3 class="text-xl font-bold text-gray-800 mb-2">Liên hệ</h3>*/}
            {/*</Link >*/}
            <Link to="/setting" class="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center flex-1 min-w-[250px] max-w-[300px]">
                <div class="w-15 h-15 mb-5 flex items-center justify-center">
                    <IoSettingsOutline class="text-black-500 text-7xl" />
                     <i class="fas fa-sign-out-alt text-blue-500 text-4xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Cài Đặt</h3>
            </Link >

        </div>
    </div>

    );
};
export default Home;