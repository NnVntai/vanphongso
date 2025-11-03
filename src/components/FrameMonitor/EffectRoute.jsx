import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <motion.div
            // key={location.pathname}
            // initial={{ opacity: 0, scale: 0.95 }}
            // animate={{ opacity: 1, scale: 1 }}
            // exit={{ opacity: 0, scale: 0.95 }}
            // transition={{ duration: 0.6, ease: "easeInOut" }}
            // className="w-full h-full"
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }} // ⏱ Tăng từ 0.25 → 0.6 giây
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
