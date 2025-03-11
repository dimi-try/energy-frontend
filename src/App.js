import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation  } from 'react-router-dom'
import { BackButton } from '@vkruglikov/react-telegram-web-app';

import { useTelegram } from "./hooks/useTelegram";
import { useUserVerification } from "./hooks/useUserVerification";

import './App.css';

import Profile from "./components/Profile/Profile";
import EnergyList from "./components/EnergyList/EnergyList";
import Energy from "./components/Energy/Energy";
// import Navigation from './components/Navigation/Navigation';


function App() {
  // const [ result, setResult ] = useState(null);
  const { telegram } = useTelegram();
  const { result, verifyUser } = useUserVerification(telegram);

  const navigate = useNavigate();
  const location = useLocation();
  const [showBackButton, setShowBackButton] = useState(true);

  useEffect(() => {
    telegram.ready();
  }, telegram);

  useEffect(() => {
    // Проверяем, если это главная страница или история пуста
    if (location.pathname === '/' || window.history.length === 1) {
      setShowBackButton(false); // Скрыть кнопку назад
    } else {
      setShowBackButton(true); // Показать кнопку назад
    }
  }, [location]);

  // useEffect(() => {
  //   verifyUser(telegram.initData); // Автоматическая верификация при монтировании компонента
  // }, verifyUser);

  // return (
  //   <div className="App">
  //     <div>
  //       <p>{result}</p> {/* Выводим результат верификации */}
  //     </div>
  //   </div>
  // );
  
  return (
    <div className={`App ${telegram.colorScheme}`}>
      {/* <EnergyList /> */}
      {/* <Profile /> */}
      <Routes>
        <Route index element={<Profile />}/>
        <Route path={'/energies'} element={<EnergyList />}/>
        <Route path={"/energies/:id"} element={<Energy />} />
      </Routes>
      {showBackButton && <BackButton onClick={() => navigate(-1)} />}
      {/* <Navigation /> */}
      <goBack />
    </div>
  );
}

export default App;