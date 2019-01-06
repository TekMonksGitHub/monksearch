/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {loginmanager} from "../../js/loginmanager.mjs";

async function signin() {	
	let id = login_box.shadowRoot.getElementById("userid").value;
	let pass = login_box.shadowRoot.getElementById("pass").value;
		
	_handleLoginResult(await loginmanager.signin(id, pass));
}

function _handleLoginResult(result) {
	if (result) router.loadPage(APP_CONSTANTS.MAIN_THTML);
	else {
		let shadowRoot = login_box.shadowRoot;
		shadowRoot.getElementById("notifier").MaterialSnackbar.showSnackbar({message:"Login Failed"})
	}
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM

export const login_box = {signin, trueWebComponentMode}

// convert this all into a WebComponent so we can use it
monkshu_component.register("login-box", `${APP_CONSTANTS.APP_PATH}/components/login-box/login-box.html`, login_box);