import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Navbar from './components/DescribePage/Navbar'
import StartPage from './components/DescribePage/StartPage'
import HowWorks from './components/DescribePage/HowWorks'
import Contact from './components/DescribePage/Contact'
import QAFrecvente from './components/DescribePage/QAFrecevnte'
import TestPage from './components/DescribePage/TestPage'
import LoginPage from './components/LoginPage/LoginPage'
import SignUpPage from './components/LoginPage/SignUpPage'
import RecoveryPasswordPage from './components/LoginPage/RecoveryPasswordPage';
import AplicatiePage from './components/AplicatiePage/AplicatiePage'

import { ProviderSimetricKey } from './components/FunctiiDate/ContextKeySimetrice'

function App() {
  return (
    <ProviderSimetricKey>
      <Router>
        <div className="w-full md:w-full">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <StartPage />
                <TestPage />
                <HowWorks />
                <QAFrecvente />
                <Contact />
              </>
            } />
            <Route path="/home" element={
              <>
                <Navbar />
                <StartPage />
                <TestPage />
                <HowWorks />
                <QAFrecvente />
                <Contact />
              </>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/myapp" element={<AplicatiePage />} />
            <Route path="/recoverypassword" element={<RecoveryPasswordPage />} />
          </Routes>
        </div>
      </Router>
    </ProviderSimetricKey>
  )
}

export default App
