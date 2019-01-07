/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

function bindSearchEvent(receiver) {	
	search_box._receiver = receiver;
}

function search() {
	let searchTerm = search_box.shadowRoot.getElementById("search").value;
	if (search_box._receiver) search_box._receiver(searchTerm);
}

function register(roles) {
	// convert this all into a WebComponent so we can use it
	monkshu_component.register("search-box", `${APP_CONSTANTS.APP_PATH}/components/search-box/search-box.html`, 
		search_box, roles);
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM

export const search_box = {bindSearchEvent, search, trueWebComponentMode, register};