import {Link} from 'react-router-dom';
import React, { ReactNode } from "react";
// import backgroundhome from "

export default function MainLayout({ children, title = "Tiêu đề Trang" ,backlink="/"}) {
    return (
        <div className="min-h-screen container m-auto mt-6 max-w-7xl rounded-xl overflow-hidden ">
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-3 shadow-md rounded-4xl bg-gradient-to-r from-green-500 to-white">
                <div className="text-3xl font-semibold text-gray-50">{title}</div>
                <Link
                    to={backlink}
                    className="px-4 py-2 rounded bg-gray-200 text-sm font-medium shadow-md hover:bg-gray-300 transition-transform duration-300 ease-in-out hover:scale-105"
                >
                    Quay Lại Trang Chủ
                </Link>
            </div>
            <div className="bg-white">
                {children}
            </div>
        </div>
    );
};

