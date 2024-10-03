// src/plugins/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from 'js-cookie';


window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: "ap1",
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
    auth: {
        headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
        },
    },
});

export default echo;
