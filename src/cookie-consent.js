import Cookies from 'js-cookie';
import { dbService } from './db-service';

import './cookie-consent.css';

const linkEnableCookies = document.getElementById("link-enable-cookies");
const linkRejectCookies = document.getElementById("link-reject-cookies");

linkEnableCookies.addEventListener('click', function () {
    Cookies.set('cookie-consent', 'true', { expires: 365 });
});

linkRejectCookies.addEventListener('click', function () {
    Cookies.remove('cookie-consent');
    dbService.drop();
});
