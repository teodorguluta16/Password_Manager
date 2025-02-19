import React, { useState } from 'react';
import Video1 from '../../assets/website/video1.webm';
import Video2 from '../../assets/website/video2.mov';
import Fundal from '../../assets/website/background2.jpg';

const DescribePage = () => {
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);

  const toggleAccordion1 = () => {
    setIsOpen1(!isOpen1);
  };

  const toggleAccordion2 = () => {
    setIsOpen2(!isOpen2);
  };

  const toggleAccordion3 = () => {
    setIsOpen3(!isOpen3);
  };

  return (
    <>
         <div 
        style={{
          backgroundImage: `url(${Fundal})`,
        }} 
        className="min-h-[700px] sm:min-h-[670px]"
      >
         
          <div className="py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-left mb-7 mt-1 ml-20 md:ml-20">
              Simplă, precisă și disponibilă pentru oricine
            </h2>
          </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-start md:gap-10 md:ml-24">
          <div className="accordion-wrapper w-4/5 md:w-4/5 mt-20 md:mt-20 ml-24 md:ml-24">
            <div className="accordion-wrapper-col ">
              {/* Accordion 1 */}
              <div
                className={`accordion-card ${isOpen1 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-green-100 hover:py-4 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300`}
                data-accordion="1"
                tabIndex="0"
              >
                <h3
                  role="button"
                  className="accordion-card-heading flex justify-between items-center"
                  aria-controls="accordion-content-01"
                  aria-expanded={isOpen1 ? 'true' : 'false'}
                  onClick={toggleAccordion1}
                >
                  <span className='text-2xl md:text-3xl font-bold'>Scopul nostru...</span>
                  <svg
                    className="accordion-arrow w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 9"
                  >
                    <path
                      d="M7.04085 0.83331C7.38906 0.832905 7.72059 0.973505 7.95071 1.21918L13.3118 6.16088C13.3118 6.16088 13.5996 6.46537 13.6624 6.89489C13.7095 7.21707 13.6003 7.62712 13.3118 7.93542C13.0525 8.21255 12.7318 8.31356 12.4474 8.2971C11.9936 8.27085 11.6173 7.99073 11.6173 7.99073L7.13978 4.04782C7.1148 4.02103 7.07874 3.98865 7.04085 3.98865C7.00295 3.98865 6.96689 4.02103 6.94191 4.04782L2.42731 7.99225C2.42731 7.99225 2.08562 8.2933 1.64493 8.33026C1.34816 8.35516 0.989519 8.22522 0.724218 7.93542C0.446084 7.6316 0.301779 7.21342 0.344496 6.89489C0.403031 6.45841 0.724218 6.16088 0.724218 6.16088L6.1294 1.22116C6.35992 0.974889 6.6919 0.833622 7.04085 0.83331Z"
                      fill="#25282D"
                    ></path>
                  </svg>
                </h3>
                <div
                  className={`accordion-content mt-2 ${isOpen1 ? 'block' : 'hidden'}`}
                  id="accordion-content-01"
                >
                  <p className='text-1xl md:text-1xl font-semibold'>
                    Te-ai săturat să uiți mereu parolele de la conturi? Îți oferim o soluție simplă și eficientă de a avea toate parolele într-un singur loc sigur și accesibil oriunde și oricând. Tot ce va trebui să faci este doar să creezi cont și să memorezi doar o singură parolă.
                  </p>
                </div>
              </div>
              {/* Accordion 2 */}
              <div
                className={`accordion-card ${isOpen2 ? 'accordion-card--open' : ''} py-8 hover:shadow-lg hover:bg-green-100 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300`}
                data-accordion="2"
                tabIndex="0"
              >
                <h3
                  role="button"
                  className="accordion-card-heading flex justify-between items-center"
                  aria-controls="accordion-content-02"
                  aria-expanded={isOpen2 ? 'true' : 'false'}
                  onClick={toggleAccordion2}
                >
                  <span className='text-2xl md:text-3xl font-bold'>Autocompletare de fiecare dată...</span>
                  <svg
                    className="accordion-arrow w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 9"
                  >
                    <path
                      d="M7.04085 0.83331C7.38906 0.832905 7.72059 0.973505 7.95071 1.21918L13.3118 6.16088C13.3118 6.16088 13.5996 6.46537 13.6624 6.89489C13.7095 7.21707 13.6003 7.62712 13.3118 7.93542C13.0525 8.21255 12.7318 8.31356 12.4474 8.2971C11.9936 8.27085 11.6173 7.99073 11.6173 7.99073L7.13978 4.04782C7.1148 4.02103 7.07874 3.98865 7.04085 3.98865C7.00295 3.98865 6.96689 4.02103 6.94191 4.04782L2.42731 7.99225C2.42731 7.99225 2.08562 8.2933 1.64493 8.33026C1.34816 8.35516 0.989519 8.22522 0.724218 7.93542C0.446084 7.6316 0.301779 7.21342 0.344496 6.89489C0.403031 6.45841 0.724218 6.16088 0.724218 6.16088L6.1294 1.22116C6.35992 0.974889 6.6919 0.833622 7.04085 0.83331Z"
                      fill="#25282D"
                    ></path>
                  </svg>
                </h3>
                <div
                  className={`accordion-content mt-2 ${isOpen2 ? 'block' : 'hidden'}`}
                  id="accordion-content-02"
                >
                  <p className='text-1xl md:text-1xl font-semibold'>
                    La fiecare sesiune de logare pe un site, nu vei fi nevoit să îți introduci mereu credențialele. Îți vom detecta și completa noi automat câmpurile necesare logării, indiferent de browser-ul ales.
                  </p>
                </div>
              </div>
              {/* Accordion 3 */}
              <div
                className={`accordion-card ${isOpen3 ? 'accordion-card--open' : ''} py-3 hover:shadow-lg hover:bg-green-100 hover:py-4 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300`}
                data-accordion="3"
                tabIndex="0"
              >
                <h3
                  role="button"
                  className="accordion-card-heading flex justify-between items-center"
                  aria-controls="accordion-content-03"
                  aria-expanded={isOpen3 ? 'true' : 'false'}
                  onClick={toggleAccordion3}
                >
                  <span className='text-2xl md:text-3xl font-bold'>Securitate sporită...</span>
                  <svg
                    className="accordion-arrow w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 9"
                  >
                    <path
                      d="M7.04085 0.83331C7.38906 0.832905 7.72059 0.973505 7.95071 1.21918L13.3118 6.16088C13.3118 6.16088 13.5996 6.46537 13.6624 6.89489C13.7095 7.21707 13.6003 7.62712 13.3118 7.93542C13.0525 8.21255 12.7318 8.31356 12.4474 8.2971C11.9936 8.27085 11.6173 7.99073 11.6173 7.99073L7.13978 4.04782C7.1148 4.02103 7.07874 3.98865 7.04085 3.98865C7.00295 3.98865 6.96689 4.02103 6.94191 4.04782L2.42731 7.99225C2.42731 7.99225 2.08562 8.2933 1.64493 8.33026C1.34816 8.35516 0.989519 8.22522 0.724218 7.93542C0.446084 7.6316 0.301779 7.21342 0.344496 6.89489C0.403031 6.45841 0.724218 6.16088 0.724218 6.16088L6.1294 1.22116C6.35992 0.974889 6.6919 0.833622 7.04085 0.83331Z"
                      fill="#25282D"
                    ></path>
                  </svg>
                </h3>
                <div
                  className={`accordion-content mt-2 ${isOpen3 ? 'block' : 'hidden'}`}
                  id="accordion-content-03"
                >
                  <p className='text-1xl md:text-1xl font-semibold'>
                    Cu ajutorul metodelor de detectare a parolelor slabe sau reutilizate și a criptării standardizate datelor, îți vom asigura o securitate sporită împotriva atacurilor malițioase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video or image */}
          <div className="w-1/2 md:w-full mt-12 md:mt-15 ml-5 md:ml-12">
            <video
              src={Video2}
              controls
              autoPlay
              loop
              muted
              className="w-5/6 h-5/6 rounded-lg shadow-lg"
            ></video>
          </div>
        </div>
      </div>
    </>
  );
};

export default DescribePage;
