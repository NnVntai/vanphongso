import { Outlet, useLocation  } from 'react-router-dom';
import Header from '../components/layout/Header';
import  Footer from '../components/layout/Footer';
import { AnimatePresence } from "framer-motion";
import  PageTranstion from '../components/FrameMonitor/EffectRoute';
import {lazy} from "react";

// import backgroundhome from ""
const MainLayout = () => {
    const location = useLocation();
  return (
   <div className="relative min-h-screen flex flex-col">
  {/* Lớp nền */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-30"
      style={{ backgroundImage: "url('/imagesystem/backgrounddongthap.png')" }}
    ></div>
     {/*<div*/}
     {/*    className="absolute inset-0 bg-contain bg-center opacity-80 bg-no-repeat"*/}
     {/*    style={{ backgroundImage: "url('/imagesystem/nendongthap.png')" }}*/}
     {/*></div>*/}

    {/* Lớp overlay màu */}
    <div className="absolute inset-0 bg-black/30"></div>

    {/* Nội dung chính */}
    <div className="relative z-10 flex flex-col flex-1">
      <Header />
      <main className="flex-1">
          <AnimatePresence mode="wait">
              <PageTranstion>
                    <Outlet />
              </PageTranstion>
          </AnimatePresence>
      </main>
       <Footer />
    </div>
  </div>
  );
};

export default MainLayout;
