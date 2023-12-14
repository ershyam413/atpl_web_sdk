import React from 'react';
import Atpl from 'Atpl-sdk-web';
import AtplImage from './Atpl.jpg';

function Contact() {
    const emailUsClick = () => {
        Atpl.q.push(['add_event', {
            "key": "email-us-clicked",
            "count": 1
        }]);
        alert("Email us event triggered");
    }

    return (
        <div className="contact">
            <div>
                <img src={AtplImage} alt="Home"></img>
            </div>
            <div>
                <h1>support@Atpl</h1>
            </div>
            <div>
                <button className="email-us" onClick={emailUsClick}>Email us</button>
            </div>
        </div>
    );
}

export default Contact;