import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation  } from 'react-router-dom'
import { BackButton } from '@vkruglikov/react-telegram-web-app';

import { useTelegram } from "./hooks/useTelegram";
import { useUserVerification } from "./hooks/useUserVerification";

import './App.css';

import Top100 from './pages/Top100';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import EnergyDrinkPage from './pages/EnergyDrinkPage';
import BrandPage from './pages/BrandPage';
import BottomNav from './components/BottomNav';

/*Legacy*/
import LegacyProfile from "./legacy/pages/Profile/Profile";
import LegacyEnergies from "./legacy/pages/Energies/Energies";
import LegacyEnergy from "./legacy/pages/Energy/Energy";
import Navigation from './legacy/components/Navigation/Navigation';
/********/

function App() {
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

  /*Legacy*/
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
  /********/
  
  return (
    <div className={`App ${telegram.colorScheme}`}>
      <Routes>
        <Route index element={<Top100 />} />
        <Route path="/search" element={<Search />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/energy/:id" element={<EnergyDrinkPage />} />
        <Route path="/brand/:id" element={<BrandPage />} />

        {/* Legacy */}
        <Route path={'/legacy/profile'} element={<LegacyProfile />}/>
        <Route path={'/legacy/energies'} element={<LegacyEnergies />}/>
        <Route path={"/legacy/energy/:id"} element={<LegacyEnergy />} />
        {/*  */}
      </Routes>
      <BottomNav />
      {showBackButton && <BackButton onClick={() => navigate(-1)} />}
      {/* <Navigation /> */}
      <goBack />
    </div>
  );
}

export default App;