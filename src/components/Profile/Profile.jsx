import React from 'react';
import Stats from './Stats/Stats';
import Info from './Info/Info';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();  // Хук для программной навигации

    const handleClick = () => {
        navigate('/energies');  // Перенаправляем пользователя на страницу с энергетиками
    };

    return (
        <div className={'profile container'}>
            <div className={'profile__container grid'}>
                <Info />

                <div className={"stats__content"}>
                    <Stats icon="⭐" data={55} label={'Мои оценки'}/>
                    <Stats icon="~" data={7.4} label={'Средний балл'}/>
                </div>

                <div className={"stats__content"}>
                    <Stats data={'Monster'} label={'Любимый энергетик'}/>
                    <Stats data={'Burn'} label={'Любимая линейка'}/>
                </div>

                <button className={"profile__button"} onClick={handleClick}>
                    Список энергетиков
                </button>
            </div>
        </div>
    );
};

export default Profile;
