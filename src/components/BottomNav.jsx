import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavBar = styled.nav`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  background: #222;
  padding: 10px 0;
`;

const NavItem = styled(NavLink)`
  color: white;
  text-decoration: none;
  &.active { font-weight: bold; }
`;

const BottomNav = () => (
  <NavBar>
    <NavItem to="/top100">🏆 Топ 100</NavItem>
    <NavItem to="/search">🔍 Поиск</NavItem>
    <NavItem to="/favorites">⭐ Избранное</NavItem>
    <NavItem to="/profile">👤 Профиль</NavItem>
  </NavBar>
);

export default BottomNav;
