import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation  } from 'react-router-dom'
import { BackButton } from '@vkruglikov/react-telegram-web-app';

import { useTelegram } from "./hooks/useTelegram";
import { useUserVerification } from "./hooks/useUserVerification";

import './styles/App.css';

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

  // Инициализация и отслеживание темы Telegram
  useEffect(() => {
    if (telegram) {
      telegram.ready();

      // Функция для применения темы
      const applyTheme = (params) => {
        const theme = params || {
          bg_color: '#f5f5f5',
          text_color: '#333333',
          secondary_bg_color: '#e5e5e5',
          button_color: '#007aff',
          button_text_color: '#ffffff',
        };
        console.log('Applying theme:', theme);

        // Устанавливаем все переменные из themeParams
        document.documentElement.style.setProperty('--background-color', theme.secondary_bg_color || '#ffffff');
        document.documentElement.style.setProperty('--text-color', theme.text_color);
        document.documentElement.style.setProperty('--card-background', theme.bg_color);
        document.documentElement.style.setProperty('--primary-color', theme.button_color || '#007aff');
        document.documentElement.style.setProperty('--button-text-color', theme.button_text_color || '#ffffff');
      };

      // Применяем начальную тему
      applyTheme(telegram.themeParams);

      // Событие: изменение темы в Telegram
      telegram.onEvent('themeChanged', () => {
        console.log('Theme changed event:', telegram.themeParams);
        applyTheme(telegram.themeParams);
      });
    } else {
      // Значения по умолчанию для браузера
      document.documentElement.style.setProperty('--background-color', '#f5f5f5');
      document.documentElement.style.setProperty('--text-color', '#333333');
      document.documentElement.style.setProperty('--card-background', '#ffffff');
      document.documentElement.style.setProperty('--primary-color', '#007aff');
      document.documentElement.style.setProperty('--button-text-color', '#ffffff');
    }
  }, [telegram]);
  
  useEffect(() => {
    // Проверяем, если это главная страница или история пуста
    if (location.pathname === '/' || window.history.length === 1) {
      setShowBackButton(false); // Скрыть кнопку назад
    } else {
      setShowBackButton(true); // Показать кнопку назад
    }
  }, [location]);

  useEffect(() => {
    verifyUser(telegram.initData); // Автоматическая верификация при монтировании компонента
  }, [verifyUser, telegram.initData]);
  
  return (
    <div className={`App ${telegram?.colorScheme || 'light'}`}>
      {/* Выводим результат верификации */}
      {/* <p>{result}</p>  */}
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
      {/* Legacy */}
        {/* <Navigation /> */}
      {/*  */}
      {showBackButton && <BackButton onClick={() => navigate(-1)} />}
    </div>
  );
}

export default App;