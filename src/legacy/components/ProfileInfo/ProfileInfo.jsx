import React from 'react';
import {useTelegram} from '../../../hooks/useTelegram';
import imagePlaceholder from './image_placeholder.png';
import './ProfileInfo.css';

const Profile = () => {
    const {user} = useTelegram();

    return (
        <div className={'profile__data'}>
            <div className={'profile__border'}>
                <div className={'profile__perfil'}>
                    <img src={imagePlaceholder} alt='Logo' />;
                </div>
            </div>
            <h2 className={'profile__name'}>{user?.first_name}</h2>
            <h3 className={'profile__username'}>{`@${user?.username}`}</h3>
        </div> 
    );
};

export default Profile;
