import React from 'react';
import Video1 from '../../assets/website/video1.webm';
import Video2 from '../../assets/website/video2.webm';
import Video3 from '../../assets/website/video3.webm';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <div className="py-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-7 mt-1">
          Simplă, precisă și disponibilă pentru oricine
        </h2>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-start md:gap-10 md:ml-0 lg:ml-8">
        {/* Secțiunea de text */}
        <div className="w-full md:w-1/2 p-8 bg-white">
          <h3 className='text-2xl md:text-3xl font-bold mb-6'>Scopul nostru</h3>
          <p className='text-lg md:text-xl font-semibold'>
            Te-ai săturat să uiți mereu parolele de la conturi? Îți oferim o soluție simplă și eficientă de a avea toate parolele într-un singur loc sigur și accesibil oriunde și oricând. Tot ce va trebui să faci este doar să creezi cont și să memorezi doar o singură parolă.
          </p>
          <video
            src={Video2}
            controls
            autoPlay
            loop
            muted
            className="w-full h-auto min-w-[300px] min-h-[200px] md:min-w-[400px] md:min-h-[300px] mt-5 rounded-lg shadow-lg"
          />
        </div>

        {/* Secțiunea semicerc și videoclip */}
        <div className="w-full md:w-1/2 flex items-end justify-center md:justify-end relative md:-ml-12">
          <div className="w-32 h-32 md:w-96 md:h-96 lg:w-3/4  bg-green-600 rounded-full rounded-l-none transform rotate-180 absolute top-0 right-0 md:relative md:bottom-20"></div>
        </div>
      </div>

      {/* A doua secțiune - semicerc verde în stânga, orientat cu partea curbată în sus */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start">
        {/* Secțiunea semicerc verde */}
        <div className="w-1/2 md:w-1/2 flex items-start justify-start">
          <div className="w-32 h-32 md:w-96 md:h-96 lg:w-3/4 bg-green-600 rounded-full rounded-l-none transform -rotate-0"></div>
        </div>

        {/* Secțiunea de text */}
        <div className="w-full md:w-1/2 p-8 bg-white">
          <h3 className='text-2xl md:text-3xl font-bold mb-6'>Autocompletare de fiecare dată</h3>
          <p className='text-lg md:text-xl font-semibold'>
            La fiecare sesiune de logare pe un site, nu vei fi nevoit să îți introduci mereu credențialele. Îți vom detecta și completa noi automat câmpurile necesare logării, indiferent de browser-ul ales.
          </p>
          <video
            src={Video1}
            controls
            autoPlay
            loop
            muted
            className="w-full max-w-full h-auto min-w-[300px] min-h-[200px] md:min-w-[100%] lg:min-w-[400px] md:min-h-[300px] mt-5 rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* A treia secțiune - semicerc verde în dreapta, orientat cu partea curbată în jos */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start md:gap-10 md:ml-0 lg:ml-8">
        {/* Secțiunea de text */}
        <div className="w-full md:w-1/2 p-8 bg-white">
          <h3 className='text-2xl md:text-3xl font-bold mb-6'>Securitate sporită</h3>
          <p className='text-lg md:text-xl font-semibold'>
            Cu ajutorul metodelor de detectare a parolelor slabe sau reutilizate și a criptării standardizate datelor, îți vom asigura o securitate sporită împotriva atacurilor malițioase.
          </p>
          <video
            src={Video3}
            controls
            autoPlay
            loop
            muted
            className="w-full h-auto min-w-[300px] min-h-[200px] md:min-w-[400px] md:min-h-[300px] mt-5 rounded-lg shadow-lg"
          />
        </div>

        {/* Secțiunea semicerc verde */}
        <div className="w-full md:w-1/2 flex items-end justify-center md:justify-end relative">
          <div className="hidden md:block w-32 h-32 md:w-96 md:h-96 lg:w-3/4 bg-green-600 rounded-full rounded-l-none transform rotate-180 md:absolute top-0 right-0 md:relative md:bottom-20"></div>
        </div>
      </div>

    </div>
  );
}

export default TestPage;
