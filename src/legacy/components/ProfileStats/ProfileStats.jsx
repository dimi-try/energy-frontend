import React from 'react';
import './ProfileStats.css';

const Stats = ({ icon = null, data, label}) => {
    return (
        <div className={"stats__info"}>
            <span className={'profile__rating-data'}>{icon ? icon + " " : ""}{data}</span>
            <span className={'profile__rating-label'}>{label}</span>
        </div>
    );
};

export default Stats;
