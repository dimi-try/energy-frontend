import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  motion,
  useMotionValue,
  animate,
  useSpring,
} from "framer-motion";

// Иконки пунктов меню из react-icons/io5
import {
  IoTrophyOutline,
  IoSettingsOutline,
  IoPersonOutline,
  IoAddCircleOutline,
} from "react-icons/io5";

import "./NavigationBar.css";

// Размер blob-индикатора в пикселях
const BLOB_SIZE = 68;

/* Основной компонент навигационной панели.
   Принимает проп role для условного рендера админ-пункта. */
export default function NavigationBar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Рефы для DOM-элементов
  const navRef = useRef(null);       // контейнер навигации
  const itemRefs = useRef([]);       // ссылки на каждый пункт меню
  const blobRef = useRef(null);      // blob-индикатор

  // Рефы состояния взаимодействия (не вызывают ре-рендер)
  const draggingRef = useRef(false);  // идёт ли перетаскивание
  const hoverRef = useRef(false);     // курсор над панелью

  // Анимируемые значения позиции blob
  const blobX = useMotionValue(0);
  const blobY = useMotionValue(0);

  // Пружинная анимация для плавного перемещения blob по X
  const springX = useSpring(blobX, {
    stiffness: 500,
    damping: 35,
    mass: 0.6,
  });

  const [hoveredIndex, setHoveredIndex] = useState(-1);  // индекс пункта под курсором
  const [isDragging, setIsDragging] = useState(false);     // флаг для CSS-класса

  // Массив пунктов меню. Админ-пункт добавляется только для role === "admin"
  const navItems = useMemo(
    () => [
      {
        to: "/",
        icon: <IoTrophyOutline />,
        label: "Рейтинг",
      },

      ...(role === "admin"
        ? [
            {
              to: "/admin",
              icon: <IoSettingsOutline />,
              label: "Админ",
            },
          ]
        : []),

      {
        to: "/my-suggestions",
        icon: <IoAddCircleOutline />,
        label: "Предложить",
      },

      {
        to: "/profile",
        icon: <IoPersonOutline />,
        label: "Профиль",
      },
    ],
    [role]
  );

  // Определяет индекс активного пункта на основе текущего маршрута
  const getActiveIndex = useCallback(() => {
    const index = navItems.findIndex((item) => {
      // Для корня проверяем точное совпадение, чтобы не ловить все маршруты
      if (item.to === "/") {
        return location.pathname === "/";
      }

      return location.pathname.startsWith(item.to);
    });

    return index >= 0 ? index : 0;
  }, [location.pathname, navItems]);

  // Вычисляет центр пункта меню относительно контейнера навигации
  const getItemCenter = useCallback((index) => {
    const item = itemRefs.current[index];
    const nav = navRef.current;

    if (!item || !nav) return 0;

    const itemRect = item.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    return itemRect.left - navRect.left + itemRect.width / 2;
  }, []);

  // Позиция blob по центру пункта меню
  const getBlobPosition = useCallback(
    (index) => {
      return getItemCenter(index) - BLOB_SIZE / 2;
    },
    [getItemCenter]
  );

  // Ограничивает позицию blob в пределах панели (с отступом 4px)
  const clampBlob = useCallback((value) => {
    if (!navRef.current) return value;

    const max = navRef.current.offsetWidth - BLOB_SIZE;

    return Math.max(4, Math.min(value, max - 4));
  }, []);

  // Анимирует blob к указанному индексу пункта меню
  const animateToIndex = useCallback(
    (index) => {
      animate(
        blobX,
        clampBlob(getBlobPosition(index)),
        {
          type: "spring",
          stiffness: 450,
          damping: 30,
          mass: 0.7,
        }
      );
    },
    [blobX, clampBlob, getBlobPosition]
  );

  // Перемещаем blob к активному пункту при смене маршрута
  useEffect(() => {
    animateToIndex(getActiveIndex());
  }, [location.pathname, navItems.length, animateToIndex, getActiveIndex]);

  // Пересчитываем позицию blob при ресайзе окна
  useEffect(() => {
    if (!navRef.current) return;

    const observer = new ResizeObserver(() => {
      animateToIndex(getActiveIndex());
    });

    observer.observe(navRef.current);

    return () => observer.disconnect();
  }, [animateToIndex, getActiveIndex]);

  // Находит ближайший пункт меню по координате X курсора
  const findNearestItem = useCallback((clientX) => {
    const nav = navRef.current;
    if (!nav) return -1;

    const rect = nav.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const itemWidth = rect.width / navItems.length;

    let index = Math.round(relativeX / itemWidth - 0.5);
    index = Math.max(0, Math.min(navItems.length - 1, index));

    return index;
  }, [navItems.length]);

  // Обновляет hoveredIndex, если курсор внутри панели
  const updateHoverIndex = useCallback((clientX) => {
    const nav = navRef.current;
    if (!nav) return;

    const rect = nav.getBoundingClientRect();
    const isInside =
      clientX >= rect.left &&
      clientX <= rect.right;

    if (!isInside) {
      setHoveredIndex(-1);
      return;
    }

    const itemIndex = findNearestItem(clientX);
    setHoveredIndex(itemIndex);
  }, [findNearestItem]);

  // --- Обработчики перетаскивания blob ---

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    draggingRef.current = true;
    setIsDragging(true);

    // Захватываем указатель для корректной обработки за пределами элемента
    e.currentTarget.setPointerCapture(e.pointerId);

    updateBlobPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;

    updateBlobPosition(e.clientX);
    updateHoverIndex(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    // Определяем ближайший пункт и перемещаем blob к нему
    const nearestIndex = findNearestItem(e.clientX);
    animateToIndex(nearestIndex);

    // Навигация к выбранному пункту (с задержкой для завершения анимации)
    if (location.pathname !== navItems[nearestIndex].to) {
      setTimeout(() => {
        navigate(navItems[nearestIndex].to);
      }, 100);
    }
  };

  const handlePointerCancel = () => {
    draggingRef.current = false;
    setIsDragging(false);
  };

  // Устанавливает позицию blob вслед за курсором при перетаскивании
  const updateBlobPosition = (clientX) => {
    if (!navRef.current) return;

    const rect = navRef.current.getBoundingClientRect();
    const position = clientX - rect.left - BLOB_SIZE / 2;

    blobX.set(clampBlob(position));
  };

  // --- Обработчики hover на панели ---

  const handleNavPointerMove = (e) => {
    if (draggingRef.current) return;

    updateHoverIndex(e.clientX);
  };

  const handleNavPointerLeave = () => {
    if (draggingRef.current) return;
    setHoveredIndex(-1);
  };

  return (
    <div className="liquid-nav-wrapper">
      <nav
        ref={navRef}
        className="liquid-nav"
        onPointerMove={handleNavPointerMove}
        onPointerLeave={handleNavPointerLeave}
      >

        {/* Анимированный blob-индикатор */}
        <motion.div
          ref={blobRef}
          className={`liquid-blob ${isDragging ? "dragging" : ""}`}
          style={{
            x: springX,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {/* Блик и отражение для эффекта жидкого стекла */}
          <div className="blob-highlight" />
          <div className="blob-reflection" />
        </motion.div>

        {/* Пункты меню */}
        {navItems.map((item, index) => {
          const active = index === getActiveIndex();
          const isHovered = index === hoveredIndex;

          return (
            <NavLink
              key={item.to}
              ref={(el) => (itemRefs.current[index] = el)}
              to={item.to}
              className={`liquid-item ${active ? "active" : ""} ${isHovered ? "hovered" : ""}`}
            >
              {/* Иконка с анимацией масштабирования */}
              <motion.div
                className="icon-wrapper"
                animate={{
                  scale: active ? 1.15 : isHovered ? 1.25 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                }}
              >
                {item.icon}
              </motion.div>

              {/* Локальное свечение под активной/ховерной иконкой */}
              {(active || isHovered) && (
                <motion.div
                  className="icon-glow"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}