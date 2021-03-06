/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {loginmanager} from "../../js/loginmanager.mjs";

async function signin(signInButton) {	
	let shadowRoot = login_box.getShadowRootByContainedElement(signInButton);
	let userid = shadowRoot.getElementById("userid").value;
	let pass = shadowRoot.getElementById("pass").value;
		
	_handleLoginResult(await loginmanager.signin(userid, pass), shadowRoot);
}

function _handleLoginResult(result, shadowRoot) {
	if (result) router.loadPage(APP_CONSTANTS.MAIN_THTML);
	else shadowRoot.getElementById("notifier").MaterialSnackbar.showSnackbar({message:"Login Failed"});
}

function register() {
	// convert this all into a WebComponent so we can use it
	monkshu_component.register("login-box", `${APP_CONSTANTS.APP_PATH}/components/login-box/login-box.html`, login_box);
}

const trueWebComponentMode = false;	// making this false renders the component without using Shadow DOM

export const login_box = {signin, trueWebComponentMode, register}