/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */

import {loginmanager} from "./loginmanager.mjs";

function bindSearchAndDataTables() {
	monkshu_env.components["search-box"].bindSearchEvent(async searchText => {
		let results = await(await fetch(`${APP_CONSTANTS.API_SEARCH}?q=${searchText}`)).json();
		if (results.result) {

			let rowData = [];
			results.results.forEach(item => rowData.push({"column":[item.title, item.snippet, item.formattedUrl]}));

			let data = {
				"headers":["Title", "Snippet", "Link"],
				"rows":rowData
			}

			monkshu_env.components["data-table"].displayResults(data, 10);
		}
	});
}

function logout() {
	loginmanager.logout();
}

export const main = {bindSearchAndDataTables, logout}