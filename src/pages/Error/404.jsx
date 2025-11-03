import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function NoteFound() {
  return (
    <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Không tìm thấy trang hoặc chức năng này chưa phát triển</h2>
        <Link to="/"><button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
          Quay lại trang chủ
        </button></Link>
    </div>
  );
}

export default NoteFound;
