import React, { useState } from 'react';
import { FaInstagram, FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa'; // Importă iconițele de la react-icons

const Contact = () => {
  return (
    <>
      <div className="shadow-lg bg-gray-600 h-[50%]">
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          {/* Rând pentru iconițele de social media */}
          <div className="flex space-x-8">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-white text-2xl hover:text-gray-300" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-white text-2xl hover:text-gray-300" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-white text-2xl hover:text-gray-300" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-white text-2xl hover:text-gray-300" />
            </a>
          </div>

          {/* Linie subțire pentru a separa secțiunile */}
          <hr className="w-52 border-t-2 border-white" />

          {/* Rând pentru linkurile legale și copyright */}
          <div className="flex flex-col items-center space-y-2">
            <a href="/politica-de-confidentialitate" className="text-white hover:text-gray-300">
              Politica de confidențialitate
            </a>
            <a href="/termeni-si-conditii" className="text-white hover:text-gray-300">
              Termeni și condiții
            </a>
            <p className="text-white">&copy; 2024 Toate drepturile rezervate.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
