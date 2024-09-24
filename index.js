const container = document.querySelector('.container')
const mainContainer = document.querySelector('.main-container')
const personsContainer = document.querySelector('.persons-container')
const wordsContainer = document.querySelector('.top-words-container')
const chartContainer = document.querySelector('.chart-container')

const colors = [
	'#b91d47',
	'#00aba9',
	'#2b5797',
	'#e8c3b9',
	'#1e7145',
	'#00FFFF',
	'#696969',
	'#FFC0CB',
	'#808080',
	'#E6E6FA',
	'#B0E0E6',
	'#7CFC00',
	'#000000',
]

// file reader init
;(function () {
	function onChange(event) {
		var reader = new FileReader()
		reader.onload = onReaderLoad
		reader.readAsText(event.target.files[0])
	}

	function onReaderLoad(event) {
		run(JSON.parse(event.target.result))
	}

	document.getElementById('file').addEventListener('change', onChange)
})()

function run(data) {
	// clearing divs
	personsContainer.replaceChildren()
	mainContainer.replaceChildren()
	wordsContainer.replaceChildren()

	const nicknames = []
	const messagesNicknamesObj = {}
	const wordsNicknamesObj = {}
	const symbolsNicknamesObj = {}
	const stickersNicknamesObj = {}
	const gifsNicknamesObj = {}
	const chartObjects = []

	// getting nicknames
	for (const msg of data.messages) {
		if ('from' in msg && !nicknames.includes(msg.from)) {
			nicknames.push(msg.from)
		}
	}

	const totalStats = getGlobalStats(data.messages)

	createTotalStatsDiv(totalStats, nicknames)

	for (const nickname of nicknames) {
		const personStats = getPersonStats(data.messages, nickname)

		messagesNicknamesObj[nickname] = personStats.messages
		wordsNicknamesObj[nickname] = personStats.words
		symbolsNicknamesObj[nickname] = personStats.symbols
		stickersNicknamesObj[nickname] = personStats.stickers
		gifsNicknamesObj[nickname] = personStats.gifs

		createPersonDiv(personStats, totalStats, nickname)
	}

	chartObjects.push(messagesNicknamesObj)
	chartObjects.push(wordsNicknamesObj)
	chartObjects.push(symbolsNicknamesObj)
	chartObjects.push(stickersNicknamesObj)
	chartObjects.push(gifsNicknamesObj)

	displayTopWords(data.messages)

	const keyWords = ['messages', 'words', 'symbols', 'stickers', 'gifs']

	// setting up charts
	for (let i = 0; i < chartObjects.length; i++) {
		createChart(chartObjects[i], keyWords[i], totalStats[keyWords[i]])
	}
}

function createTotalStatsDiv(totalStats, nicknames) {
	const totalDiv = document.createElement('div')
	const totalHdr = document.createElement('h2')
	const totalPar1 = document.createElement('p')
	const totalPar2 = document.createElement('p')
	const totalPar3 = document.createElement('p')
	const totalPar4 = document.createElement('p')
	const totalPar5 = document.createElement('p')
	const totalPar6 = document.createElement('p')

	totalHdr.textContent = 'Global Stats'
	totalPar1.textContent = `Messages: ${totalStats.messages}`
	totalPar2.textContent = `Words: ${totalStats.words}`
	totalPar3.textContent = `Symbols: ${totalStats.symbols}`
	totalPar4.textContent = `Stickers: ${totalStats.stickers}`
	totalPar5.textContent = `Gifs: ${totalStats.gifs}`
	totalPar6.textContent = `Number of people: ${nicknames.length}`

	totalDiv.className = 'total-stats'

	totalDiv.appendChild(totalHdr)
	totalDiv.appendChild(totalPar6)
	totalDiv.appendChild(totalPar1)
	totalDiv.appendChild(totalPar2)
	totalDiv.appendChild(totalPar3)
	totalDiv.appendChild(totalPar4)
	totalDiv.appendChild(totalPar5)

	mainContainer.appendChild(totalDiv)
}

function createPersonDiv(personStats, totalStats, nickname) {
	const personDiv = document.createElement('div')
	personDiv.className = 'person-stats'
	const personStatsWrapper = document.createElement('div')
	personStatsWrapper.className = 'person-stats__wrapper'
	const personStatsDigits = document.createElement('div')
	personStatsDigits.className = 'person-stats__digits'
	const personStatsPercent = document.createElement('div')
	personStatsPercent.className = 'person-stats__percent'

	const personHdr = document.createElement('h3')
	const personPar1 = document.createElement('p')
	const personPar2 = document.createElement('p')
	const personPar3 = document.createElement('p')
	const personPar4 = document.createElement('p')
	const personPar5 = document.createElement('p')
	personHdr.textContent = `In numbers`
	personPar1.textContent = `Messages: ${personStats.messages}`
	personPar2.textContent = `Words: ${personStats.words}`
	personPar3.textContent = `Symbols: ${personStats.symbols}`
	personPar4.textContent = `Stickers: ${personStats.stickers}`
	personPar5.textContent = `Gifs: ${personStats.gifs}`
	personStatsDigits.appendChild(personHdr)
	personStatsDigits.appendChild(personPar1)
	personStatsDigits.appendChild(personPar2)
	personStatsDigits.appendChild(personPar3)
	personStatsDigits.appendChild(personPar4)
	personStatsDigits.appendChild(personPar5)

	const personHdrPercent = document.createElement('h3')
	const personPar1Percent = document.createElement('p')
	const personPar2Percent = document.createElement('p')
	const personPar3Percent = document.createElement('p')
	const personPar4Percent = document.createElement('p')
	const personPar5Percent = document.createElement('p')
	personHdrPercent.textContent = `In percent`
	personPar1Percent.textContent = `Messages: ${
		totalStats.messages !== 0
			? `${((personStats.messages * 100) / totalStats.messages).toFixed(2)}%`
			: '00.00%'
	}`
	personPar2Percent.textContent = `Words: ${
		totalStats.words !== 0
			? `${((personStats.words * 100) / totalStats.words).toFixed(2)}%`
			: '00.00%'
	}`
	personPar3Percent.textContent = `Symbols: ${
		totalStats.symbols !== 0
			? `${((personStats.symbols * 100) / totalStats.symbols).toFixed(2)}%`
			: '00.00%'
	}`
	personPar4Percent.textContent = `Stickers: ${
		totalStats.stickers !== 0
			? `${((personStats.stickers * 100) / totalStats.stickers).toFixed(2)}%`
			: '00.00%'
	}`
	personPar5Percent.textContent = `Gifs: ${
		totalStats.gifs !== 0
			? `${((personStats.gifs * 100) / totalStats.gifs).toFixed(2)}%`
			: '00.00%'
	}`
	personStatsPercent.appendChild(personHdrPercent)
	personStatsPercent.appendChild(personPar1Percent)
	personStatsPercent.appendChild(personPar2Percent)
	personStatsPercent.appendChild(personPar3Percent)
	personStatsPercent.appendChild(personPar4Percent)
	personStatsPercent.appendChild(personPar5Percent)

	const hdr = document.createElement('h2')
	hdr.textContent = `Stats for ${nickname}`

	personStatsWrapper.appendChild(personStatsDigits)
	personStatsWrapper.appendChild(personStatsPercent)

	personDiv.appendChild(hdr)
	personDiv.appendChild(personStatsWrapper)

	personsContainer.appendChild(personDiv)
}

function createChart(chartObject, keyWord, totalStat) {
	const mainChartObj = {
		type: 'pie',
		data: {
			labels: [],
			datasets: [
				{
					data: [],
					backgroundColor: [],
					borderWidth: 0.5,
					borderColor: '#ddd',
				},
			],
		},
		options: {
			title: {
				display: true,
				text: keyWord.charAt(0).toUpperCase() + keyWord.slice(1),
				position: 'top',
				fontSize: 24,
				fontColor: '#111',
				padding: 20,
			},
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					boxWidth: 20,
					fontColor: '#111',
					padding: 15,
					fontSize: 16,
				},
			},
			tooltips: {
				enabled: true,
			},
			plugins: {},
		},
	}

	// filling up chart data for every user
	Object.entries(chartObject).forEach(([key, value], ind) => {
		mainChartObj.data.labels.push(key)
		mainChartObj.data.datasets[0].data.push(
			((value * 100) / totalStat).toFixed(2)
		)
		mainChartObj.data.datasets[0].backgroundColor.push(
			colors[ind % colors.length]
		)
	})

	const chartWrapper = document.createElement('div')
	chartWrapper.className = 'chart-wrapper'
	const ctx = document.createElement('canvas')
	ctx.getContext('2d')
	ctx.className = `${keyWord}-chart`
	chartWrapper.appendChild(ctx)
	chartContainer.appendChild(chartWrapper)

	new Chart(ctx, mainChartObj)
}

// utility functions

function getPersonStats(messages, nickname) {
	let personMsgCounter = 0
	let personWordsCounter = 0
	let personSymbolsCounter = 0
	let personStickersCounter = 0
	let personGifsCounter = 0

	for (const msg of messages) {
		if (msg.type == 'message' && msg.from == nickname) {
			personMsgCounter += 1
		}

		if (
			msg.type == 'message' &&
			msg.text != '' &&
			typeof msg.text == 'string' &&
			msg.from == nickname
		) {
			personWordsCounter += msg.text.split(' ').length
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text) &&
			msg.from == nickname
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					personWordsCounter += innerMsg.split(' ').length
				}
			}
		}

		if (
			msg.type == 'message' &&
			typeof msg.text == 'string' &&
			msg.from == nickname
		) {
			personSymbolsCounter += msg.text.length
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text) &&
			msg.from == nickname
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					personSymbolsCounter += innerMsg.length
				}
			}
		}

		if (
			'media_type' in msg &&
			msg.media_type == 'sticker' &&
			msg.from == nickname
		) {
			personStickersCounter += 1
		}

		if (
			'media_type' in msg &&
			msg.media_type == 'animation' &&
			msg.from == nickname
		) {
			personGifsCounter += 1
		}
	}

	return {
		nickname: nickname,
		messages: personMsgCounter,
		words: personWordsCounter,
		symbols: personSymbolsCounter,
		stickers: personStickersCounter,
		gifs: personGifsCounter,
	}
}

function getGlobalStats(messages) {
	let msgCounter = 0
	let wordsCounter = 0
	let symbolsCounter = 0
	let stickersCounter = 0
	let gifsCounter = 0

	for (const msg of messages) {
		if (msg.type == 'message') {
			msgCounter += 1
		}

		if (
			msg.type == 'message' &&
			msg.text != '' &&
			typeof msg.text == 'string'
		) {
			wordsCounter += msg.text.split(' ').length
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text)
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					wordsCounter += innerMsg.split(' ').length
				}
			}
		}

		if (msg.type == 'message' && typeof msg.text == 'string') {
			symbolsCounter += msg.text.length
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text)
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					symbolsCounter += innerMsg.length
				}
			}
		}

		if (msg.hasOwnProperty('media_type') && msg.media_type == 'sticker') {
			stickersCounter += 1
		} else if (
			msg.hasOwnProperty('media_type') &&
			msg.media_type == 'animation'
		) {
			gifsCounter += 1
		}
	}

	return {
		messages: msgCounter,
		words: wordsCounter,
		symbols: symbolsCounter,
		stickers: stickersCounter,
		gifs: gifsCounter,
	}
}

function sortData(messages) {
	// key: word, value: number of its occurrences
	const words = {}

	// regex to filter out emojis
	const regexEmoji =
		/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u

	for (const msg of messages) {
		// if the message is a non-empty text string
		if (
			msg.type == 'message' &&
			msg.text != '' &&
			typeof msg.text == 'string'
		) {
			for (const word of msg.text.split(' ')) {
				const lowerCaseWord = word.toLowerCase()

				if (
					!words.hasOwnProperty(lowerCaseWord) &&
					!regexEmoji.test(word) &&
					word != parseInt(word)
				) {
					words[lowerCaseWord] = 1
				} else if (
					words.hasOwnProperty(lowerCaseWord) &&
					!regexEmoji.test(word) &&
					word != parseInt(word)
				) {
					words[lowerCaseWord] += 1
				}
			}
			// if the message consists of a file/link/img etc. and has text in it
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text)
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					for (const word of innerMsg.split(' ')) {
						const lowerCaseWord = word.toLowerCase()

						if (
							!words.hasOwnProperty(lowerCaseWord) &&
							!regexEmoji.test(word) &&
							word != parseInt(word)
						) {
							words[lowerCaseWord] = 1
						} else if (
							words.hasOwnProperty(lowerCaseWord) &&
							!regexEmoji.test(word) &&
							word != parseInt(word)
						) {
							words[lowerCaseWord] += 1
						}
					}
				}
			}
		}
	}

	// sorting array by the number of word occurrences
	const sorted = Object.entries(words)
		.sort(([, v1], [, v2]) => v2 - v1)
		.reduce(
			(obj, [k, v]) => ({
				...obj,
				[k]: v,
			}),
			{}
		)

	const topWords = {}

	Object.entries(sorted).forEach(([key, value], ind) => {
		if (ind < 10) {
			topWords[key] = value
		}
	})

	return topWords
}

function displayTopWords(messages) {
	const topWords = sortData(messages)

	const wordsDiv = document.createElement('div')
	wordsDiv.className = 'words'

	const wordsHdr = document.createElement('h2')
	wordsHdr.textContent = 'Most used words'
	wordsDiv.appendChild(wordsHdr)

	Object.entries(topWords).forEach(([key, value], ind) => {
		const p = document.createElement('p')
		p.textContent = `${ind + 1}. ${key} - ${value} time(s)`

		wordsDiv.appendChild(p)
	})

	wordsContainer.appendChild(wordsDiv)
}
