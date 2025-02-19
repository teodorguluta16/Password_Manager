import React, { useState, useEffect } from "react";
import Imagine1 from "../../assets/website/im.jpg";
import Imagine2 from "../../assets/website/imagine2.jpg";
import Imagine3 from "../../assets/website/imagine3.jpg";
import Imagine4 from "../../assets/website/imagine4.jpg";
import Imagine5 from "../../assets/website/imagine5.avif";


const StartPage = () => {
  const images = [Imagine2, Imagine3, Imagine4, Imagine5];
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeout(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="min-h-screen sm:min-h-[750px] bg-gray-100 w-full flex justify-center items-center dark:bg-gray-950 dark:text-white duration-200 bg-cover bg-center" style={{ backgroundImage: `url(${Imagine1})` }}>
        <div className="container pb-8 sm:pb-0 mt-20 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
            <div className="mt-10 sm:mt-1 lg:mt-0 sm:ml-0 ml-8 ">
              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-bold">Fii Puternic, Rămâi Protejat</h1>
              <p className="text-sm mt-6 lg:text-2xl">
                Platforma ta sigură si prietenoasă, care îți protejează conturile oriunde, oricând
              </p>
            </div>
            <div className="flex justify-center items-center -mt-14 sm:mt-0">
              <img
                src={images[imageIndex]}
                alt=""
                className="w-[550px] h-[550px] sm:w-[350px] md:w-[400px] sm:h-[350px] lg:w-[650px] lg:h-[750px] xl:w-[600px] xl:h-[600px] object-contain shadow-lg animate-scale-rotate rounded " />

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartPage;
