/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */

const {promisify} = require("util");
const getHttpsAsync = promisify(require(`${CONSTANTS.LIBDIR}/rest.js`).getHttps);

let cache = {};

 exports.doService = async req => {
	if (!validateRequest(req)) return CONSTANTS.FALSE_RESULT;
	
	LOG.info("Got search for: " + req.q);

	if (cache[req.q.toLowerCase()]) return {"result":true, "results":cache[req.q.toLowerCase()]};

	try{
		let items = [];
		for (let i = 0; i < 5; i++) {
			let result = await getHttpsAsync("www.googleapis.com",443,"/customsearch/v1",{},
				`key=AIzaSyAgbp53TIk65JcKQH7QlrPLNcpZ5Dorzi8&cx=012981187543195721877:67rxdffruri&num=10&start=${(10*i)+1}&q=${req.q}`);
			items.push(...result.items);
		}
		cache[req.q.toLowerCase()] = items;
		return {"result":true, "results":items};
	} catch (err) {
		LOG.error(`Search error: ${err}`); 
		return CONSTANTS.FALSE_RESULT
	}
}

let validateRequest = rew => (rew && rew.q);
