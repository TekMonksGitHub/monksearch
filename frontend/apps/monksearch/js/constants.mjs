/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
const FRONTEND = "http://localhost:8080";
const BACKEND = "http://localhost:9090";
const APP_PATH = `${FRONTEND}/apps/monksearch`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH,
    MAIN_THTML: APP_PATH+"/main.html",
    LOGIN_THTML: APP_PATH+"/login.html",

    SESSION_NOTE_ID: "com_monkshu_ts",

    LANG_ID: "com_monkshu_lang",

    // Login constants
    MIN_PASS_LENGTH: 8,
    API_LOGIN: BACKEND+"/apps/monksearch/login",
    API_REGISTER: BACKEND+"/apps/monksearch/register",
    API_SEARCH: BACKEND+"/apps/monksearch/search",
    BCRYPT_SALT: "$2a$10$VFyiln/PpFyZc.ABoi4ppf",
    USERID: "id"
}