/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */

 
/* 
Data Model
{
	"headers":["header1", "header2","header3"],
	"rows":[
		{"column":["data1_1", "data1_2", "data1_3"]},
		{"column":["data2_1", "data2_2", "data2_3"]},
		...
		{"column":["datan_1", "datan_2", "datan_3"]}
	]
}
*/

import {monkshu_component} from "/framework/js/monkshu_component.mjs";

async function displayResults(data, resultsPerPage) {	
	await $$.require("./components/data-table/3p/tabulator/js/tabulator.min.js");

	let headers = []; data.headers.forEach(header => headers.push({title:header, field:header, width:"33%"}));
	let tableRows = [];
	let transformColumn = (id, c, headers) => {
		let transformed = {id};
		c.forEach((value, index) => transformed[headers[index]] = value);
		return transformed;
	}
	data.rows.forEach((row, index) => tableRows.push(transformColumn(index, row.column, data.headers)));

	let tableInit = {layout:"fitDataFill", columns: headers, pagination:"local", paginationSize: resultsPerPage, data:tableRows};
	new Tabulator(data_table.shadowRoot.getElementById("table"), tableInit);
}

const trueWebComponentMode = true;	// google charts won't work inside web components!

function register() {
	// convert this all into a WebComponent so we can use it
	monkshu_component.register("data-table", `${APP_CONSTANTS.APP_PATH}/components/data-table/data-table.html`, data_table);
}

export const data_table = {displayResults, trueWebComponentMode, register}