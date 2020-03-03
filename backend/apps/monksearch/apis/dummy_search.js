/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */

 exports.doService = async req => {
	if (!validateRequest(req)) return CONSTANTS.FALSE_RESULT;
	
	LOG.info("Got search for: " + req.q);

	let items = [];
	for (let i = 0; i < 50; i++) items.push({title: `${getRandomText()}`, snippet: `${getRandomText()}`, formattedUrl: `http://${getRandomWord()}.com`});

	return {result: true, results: items};
}

let randomIntFromInterval = (min,max) => Math.floor(Math.random()*(max-min+1)+min);

let getRandomWord = _=> Math.random().toString(36).substr(2, randomIntFromInterval(4,11));

function getRandomText() {
	let numbefOfWords = randomIntFromInterval(4,12);
	let text = [];
	for (let i = 0; i < numbefOfWords; i++) text.push(getRandomWord());
	
	return text.join(" ");
}

let validateRequest = req => (req && req.q);
