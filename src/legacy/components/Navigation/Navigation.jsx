import React from 'react';
import {useTelegram} from '../../../hooks/useTelegram';
import './Navigation.css';

const Navigation = () => {
    const {user} = useTelegram();

    return (
        <div className={'navigation container'}>
            <div className={"nav"}>
                <div className={"nav-item selected"}>
                    {/* <img src="home-icon.svg" alt="Home" className="icon" /> */}
                    <span className={'nav__item-text'}>👤</span>
                </div>
                <div className={"nav-item"}>
                    {/* <img src="heart-icon.svg" alt="Likes" className="icon" /> */}
                    <span className={'nav__item-text'}>♥</span>
                </div>
                <div className={"nav-item"}>
                    {/* <img src="search-icon.svg" alt="Search" className="icon" /> */}
                    <span className={'nav__item-text'}>🔎</span>
                </div>
                <div className={"nav-item"}>
                    {/* <img src="profile-icon.svg" alt="Profile" className="icon" /> */}
                    <span className={'nav__item-text'}>⭐</span>
                </div>
            </div>
        </div>
    );
};

export default Navigation;
