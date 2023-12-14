import React from 'react';

import Users from './Users';
import AtplImage from './Atpl.jpg';

function Home() {
    let userIndex = localStorage.getItem("clydemo-user");
    let user = {};

    if (userIndex !== undefined && userIndex !== null) {
        user = Users[userIndex] || {};
    }

    return (
        <div>
            <center>
                <img src={AtplImage} alt="Home"></img>
                <h1>Welcome {user.name}</h1>
            </center>
        </div>
    );
}

export default Home;