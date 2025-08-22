import Cookies from 'js-cookie';
import { dbService } from './db-service';

import './cookie-consent.css';

const linkEnableCookies = document.getElementById("link-enable-cookies");
const linkRejectCookies = document.getElementById("link-reject-cookies");

linkEnableCookies.addEventListener('click', function (event) {
    Cookies.set('cookie-consent', 'true');
});

linkRejectCookies.addEventListener('click', function (event) {
    Cookies.remove('cookie-consent');
    dbService.drop();
});
