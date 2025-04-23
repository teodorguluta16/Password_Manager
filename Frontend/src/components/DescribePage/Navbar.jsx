import React, { useState, useEffect } from "react";
import Logo from "../../assets/website/access-control.png";
import User from "../../assets/website/user.png";
import Administrator from "../../assets/website/administrator.png";

const Menu = [
  { id: 1, name: "Intreaba ceva", link: "/#", },
  { id: 2, name: "Ajutor", link: "/#services", },
];

const DropdownLinks = [
  { id: 1, name: "My User", icon: User, },
  { id: 2, name: "Admins", link: "/#", icon: Administrator, },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const toggleMenu = () => { setShowMenu(!showMenu); };
  const toggleLoginMenu = () => { setShowLoginMenu(!showLoginMenu); };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/auth/validateToken', {
          method: 'GET',
          credentials: "include"
        });

        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);
  return (
    <>
      <div className="shadow-lg bg-gray-800 fixed top-0 z-50  mx-auto w-screen">
        <div className="py-0 sm:py-2 md:px-6 px-4 ">
          <div className="flex justify-between items-center py-2 sm:px-8">
            <div>
              <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2 text-white">
                <img src={Logo} alt="" className="w-11 filter invert" />
                EnginePassword
              </a>
            </div>
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-white focus:outline-none">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
            <ul className="hidden md:flex items-center gap-4 font-semibold">
              {Menu.map((menu) => (
                <li key={menu.id}>
                  <a
                    href={menu.link}
                    className="inline-block py-2 px-4 border border-green-500 text-green-500 rounded-full hover:bg-green-500 hover:text-white duration-200"
                  >
                    {menu.name}
                  </a>
                </li>
              ))}
              {/* Butonul de login vizibil pe toate dimensiunile */}
              <li className="cursor-pointer bg-green-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full" onClick={toggleLoginMenu}>
                <a href="/#">Login</a>
              </li>
            </ul>
          </div>
        </div>
        {/* Meniu mobil afișat în cascadă */}
        {showMenu && (
          <div className="bg-gray-800 text-white py-4 px-6 md:hidden">
            <ul className="flex flex-col gap-4">
              {Menu.map((menu) => (
                <li key={menu.id}>
                  <a
                    href={menu.link}
                    className="block py-2 px-4 border border-green-500 text-green-500 rounded-full hover:bg-green-500 hover:text-white duration-200"
                  >
                    {menu.name}
                  </a>
                </li>
              ))}
              {/* Butonul de login pentru meniul mobil */}
              <li className="block bg-green-400 text-black py-2 px-4 rounded-full" onClick={toggleLoginMenu}>
                <a href="/#">Login</a>
              </li>
            </ul>
          </div>
        )}
        {/* Meniul de login afișat separat sub bara */}
        {showLoginMenu && (
          <div className="absolute top-full right-12 sm:right-[10%] md:right-14 lg:right-12 xl:right-16 2xl:right-12 w-[80%] md:w-[20%] lg:w-[18%] xl:w-[10%] bg-gray-300 rounded-lg p-4 shadow-md z-40">
            <ul>
              {DropdownLinks.map((data) => {
                // Decizie dinamică pentru linkul de login
                const link =
                  data.name === "My User" ? (isAuthenticated ? "/myapp" : "/login") : data.link;

                return (
                  <li key={data.id} className="flex justify-between items-center gap-2 p-2 hover:bg-primary rounded">
                    <a href={link}>{data.name}</a>
                    <img src={data.icon} alt={data.name} className="w-7" />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>

  );
};

export default Navbar;
