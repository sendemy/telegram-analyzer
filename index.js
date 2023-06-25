// import ChartDataLabels from './chartjs-plugin-datalabels.min.js'
// import { Chart } from './node_module/schart.js/dist/chart.cjs'
// Chart.register(ChartDataLabels)

const container = document.querySelector('.container')
const mainContainer = document.querySelector('.main-container')
const personsContainer = document.querySelector('.persons-container')
const wordsContainer = document.querySelector('.words-container')
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
	'#9370DB',
	'#F08080',
	'#00008B',
	'#87CEFA',
	'#F4A460',
	'#D3D3D3',
	'#CD853F',
	'#6A5ACD',
	'#FF0000',
	'#00FA9A',
	'#7FFFD4',
	'#8B4513',
	'#FF7F50',
	'#A9A9A9',
	'#006400',
	'#8B008B',
	'#A0522D',
	'#191970',
	'#A9A9A9',
	'#7FFF00',
	'#708090',
	'#6B8E23',
	'#008080',
	'#FFE4C4',
	'#FFFFFF',
	'#FFD700',
	'#DB7093',
	'#00FF7F',
	'#DDA0DD',
	'#3CB371',
	'#F0FFF0',
	'#87CEEB',
	'#BC8F8F',
	'#FFFAFA',
	'#D2B48C',
	'#5F9EA0',
	'#F0FFFF',
	'#FF1493',
	'#98FB98',
	'#708090',
	'#F5F5DC',
	'#90EE90',
	'#9ACD32',
	'#2E8B57',
	'#FF00FF',
	'#800000',
	'#4682B4',
	'#228B22',
	'#FFDAB9',
	'#808000',
	'#FFA500',
	'#C71585',
	'#2F4F4F',
	'#40E0D0',
	'#FDF5E6',
	'#663399',
	'#F5FFFA',
	'#778899',
	'#D3D3D3',
	'#FF4500',
	'#00FF00',
	'#FFFACD',
	'#FFF0F5',
	'#E0FFFF',
	'#BA55D3',
	'#DC143C',
	'#DAA520',
	'#E9967A',
	'#BDB76B',
	'#FFA07A',
	'#483D8B',
	'#FFFFF0',
	'#32CD32',
	'#6495ED',
	'#0000FF',
	'#DEB887',
	'#B0C4DE',
	'#B22222',
	'#D8BFD8',
	'#DCDCDC',
	'#FAF0E6',
	'#FFF8DC',
	'#2F4F4F',
	'#FAEBD7',
	'#9932CC',
	'#ADD8E6',
	'#FFFFE0',
	'#4B0082',
	'#C0C0C0',
	'#48D1CC',
	'#008B8B',
	'#EE82EE',
	'#808080',
	'#8B0000',
	'#AFEEEE',
	'#A52A2A',
	'#20B2AA',
	'#DA70D6',
	'#CD5C5C',
	'#FA8072',
	'#FFE4E1',
	'#FFDEAD',
	'#F8F8FF',
	'#FAFAD2',
	'#F0F8FF',
	'#FFEFD5',
	'#FF69B4',
	'#FF00FF',
	'#8A2BE2',
	'#0000CD',
	'#FFFAF0',
	'#FFF5EE',
	'#ADFF2F',
	'#4169E1',
	'#9400D3',
	'#008000',
	'#F0E68C',
	'#B8860B',
	'#66CDAA',
	'#EEE8AA',
	'#FFB6C1',
	'#00CED1',
	'#F5DEB3',
	'#FFEBCD',
	'#FFE4B5',
	'#00FFFF',
	'#1E90FF',
	'#00BFFF',
	'#FF8C00',
	'#F5F5F5',
	'#696969',
	'#7B68EE',
	'#D2691E',
	'#800080',
	'#8FBC8F',
	'#000080',
	'#556B2F',
	'#FF6347',
	'#FFFF00',
	'#778899',
]

;(function () {
	function onChange(event) {
		var reader = new FileReader()
		reader.onload = onReaderLoad
		reader.readAsText(event.target.files[0])
	}

	function onReaderLoad(event) {
		startAnalyzing(JSON.parse(event.target.result))
	}

	document.getElementById('file').addEventListener('change', onChange)
})()

function startAnalyzing(data) {
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

	// --------------------------- DIVS WITH DATA CREATION ALGORITHM ---------------------------

	for (const msg of data.messages) {
		if ('from' in msg && !nicknames.includes(msg.from)) {
			nicknames.push(msg.from)
		}
	}

	const totalStats = getGlobalStats(data)

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

	for (const nickname of nicknames) {
		const personStats = getPersonStats(data, nickname)
		messagesNicknamesObj[nickname] = personStats.messages
		wordsNicknamesObj[nickname] = personStats.words
		symbolsNicknamesObj[nickname] = personStats.symbols
		stickersNicknamesObj[nickname] = personStats.stickers
		gifsNicknamesObj[nickname] = personStats.gifs

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

	chartObjects.push(messagesNicknamesObj)
	chartObjects.push(wordsNicknamesObj)
	chartObjects.push(symbolsNicknamesObj)
	chartObjects.push(stickersNicknamesObj)
	chartObjects.push(gifsNicknamesObj)

	// --------------------------- TOP WORDS APPEARANCE ALGORITHM ---------------------------

	const wordsObj = sortData(data)

	const wordsDiv = document.createElement('div')
	wordsDiv.className = 'words'

	const wordsHdr = document.createElement('h2')
	wordsHdr.textContent = 'Most used words'
	wordsDiv.appendChild(wordsHdr)

	Object.entries(wordsObj).forEach(([key, value], ind) => {
		const p = document.createElement('p')
		p.textContent = `${ind + 1}. ${key} - ${value}`

		wordsDiv.appendChild(p)
	})

	wordsContainer.appendChild(wordsDiv)

	// --------------------------- AUTOMATIC CHART CREATION ALGORITHM ---------------------------

	const keyWords = ['messages', 'words', 'symbols', 'stickers', 'gifs']
	for (let i = 0; i < chartObjects.length; i++) {
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
					text: '',
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

		Object.entries(chartObjects[i]).forEach(([key, value], ind) => {
			mainChartObj.data.labels = [...mainChartObj.data.labels, key]
			mainChartObj.data.datasets[0].data = [
				...mainChartObj.data.datasets[0].data,
				((value * 100) / totalStats[keyWords[i]]).toFixed(2),
			]
			mainChartObj.data.datasets[0].backgroundColor = [
				...mainChartObj.data.datasets[0].backgroundColor,
				colors[ind < colors.length ? ind : ind - colors.length],
			]
			mainChartObj.options.title.text =
				keyWords[i].charAt(0).toUpperCase() + keyWords[i].slice(1).toLowerCase()
		})

		const chartWrapper = document.createElement('div')
		chartWrapper.className = 'chart-wrapper'
		const ctx = document.createElement('canvas')
		ctx.getContext('2d')
		ctx.className = `${keyWords[i]}-chart`
		chartWrapper.appendChild(ctx)
		chartContainer.appendChild(chartWrapper)

		new Chart(ctx, mainChartObj)
	}
}

function getMsgCount(data) {
	return data.messages.length
}

function getPersonMsgCount(data, nickname) {
	let msgCount = 0

	for (const msg of data.messages) {
		if (msg.from == nickname) {
			msgCount += 1
		}
	}

	return msgCount
}

function getWordsCount(data) {
	let wordsCounter = 0

	for (const msg of data.messages) {
		if (msg.text != '' && typeof msg.text == 'string') {
			wordsCounter += msg.text.split(' ').length
		} else if (typeof msg.text == 'object') {
			Object.entries(msg).forEach(([key, value], ind) => {
				if (msg.text != '' && typeof msg.key == 'string') {
					wordsCounter += msg.key.split(' ').length
				}
			})
		}
	}

	return wordsCounter
}

function getPersonWordsCount(data, nickname) {
	let wordsCounter = 0

	for (const msg of data.messages) {
		if (msg.text != '' && typeof msg.text == 'string' && msg.from == nickname) {
			wordsCounter += msg.text.split(' ').length
		} else if (typeof msg.text == 'object') {
			Object.entries(msg).forEach(([key, value], ind) => {
				if (
					msg.text != '' &&
					typeof msg.key == 'string' &&
					msg.from == nickname
				) {
					wordsCounter += msg.key.split(' ').length
				}
			})
		}
	}

	return wordsCounter
}

function getSymbolsCount(data) {
	let symbolsCounter = 0

	for (const msg of data.messages) {
		if (typeof msg.text == 'string') {
			symbolsCounter += msg.text.length
		} else if (typeof msg.text == 'object') {
			Object.entries(msg).forEach(([key, value], ind) => {
				if (typeof msg.key == 'string') {
					symbolsCounter += msg.key.length
				}
			})
		}
	}

	return symbolsCounter
}

function getPersonSymbolsCount(data, nickname) {
	let symbolsCounterer = 0

	for (const msg of data.messages) {
		if (typeof msg.text == 'string' && msg.from == nickname) {
			symbolsCounterer += msg.text.length
		} else if (typeof msg.text == 'object' && msg.from == nickname) {
			Object.entries(msg).forEach(([key, value], ind) => {
				if (typeof msg.key == 'string') {
					symbolsCounterer += msg.key.length
				}
			})
		}
	}

	return symbolsCounterer
}

function getStickersCount(data) {
	let stickersCounter = 0

	for (const msg of data.messages) {
		if ('media_type' in msg && msg.media_type == 'sticker') {
			stickersCounter += 1
		}
	}

	return stickersCounter
}

function getPersonStickersCount(data, nickname) {
	let stickersCounter = 0

	for (const msg of data.messages) {
		if (
			'media_type' in msg &&
			msg.media_type == 'sticker' &&
			msg.from == nickname
		) {
			stickersCounter += 1
		}
	}

	return stickersCounter
}

function getGifsCount(data) {
	let gifsCounter = 0

	for (const msg of data.messages) {
		if ('media_type' in msg && msg.media_type == 'animation') {
			gifsCounter += 1
		}
	}

	return gifsCounter
}

function getPersonGifsCount(data, nickname) {
	let gifsCounter = 0

	for (const msg of data.messages) {
		if (
			'media_type' in msg &&
			msg.media_type == 'animation' &&
			msg.from == nickname
		) {
			gifsCounter += 1
		}
	}

	return gifsCounter
}

function getPersonStats(data, nickname) {
	let personMsgCounter = 0
	let personWordsCounter = 0
	let personSymbolsCounter = 0
	let personStickersCounter = 0
	let personGifsCounter = 0

	for (const msg of data.messages) {
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

			// Object.entries(msg).forEach(([key, value], ind) => {
			// 	if (
			// 		msg.type == 'message' &&
			// 		typeof msg[key] == 'string' &&
			// 		msg.from == nickname
			// 	) {
			// 		personWordsCounter += msg[key].split(' ').length
			// 	}
			// })
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

function getGlobalStats(data) {
	let msgCounter = 0
	let wordsCounter = 0
	let symbolsCounter = 0
	let stickersCounter = 0
	let gifsCounter = 0

	for (const msg of data.messages) {
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
			// Object.entries(msg).forEach(([key, value], ind) => {
			// 	if (msg.text != '' && typeof msg[key] == 'string') {
			// 		wordsCounter += msg[key].split(' ').length
			// 	}
			// })
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

		if ('media_type' in msg && msg.media_type == 'sticker') {
			stickersCounter += 1
		}

		if ('media_type' in msg && msg.media_type == 'animation') {
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

function sortData(data) {
	const topWords = {}
	const regex_emoji =
		/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u

	for (const msg of data.messages) {
		if (
			msg.type == 'message' &&
			msg.text != '' &&
			typeof msg.text == 'string'
		) {
			for (const word of msg.text.split(' ')) {
				if (
					!(word.toLowerCase() in topWords) &&
					!regex_emoji.test(word) &&
					word != parseInt(word)
				) {
					topWords[word.toLowerCase()] = 1
				} else if (
					word.toLowerCase() in topWords &&
					!regex_emoji.test(word) &&
					word != parseInt(word)
				) {
					topWords[word.toLowerCase()] += 1
				}
			}
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text)
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					for (const word of innerMsg.split(' ')) {
						if (
							!(word.toLowerCase() in topWords) &&
							!regex_emoji.test(word) &&
							word != parseInt(word)
						) {
							topWords[word.toLowerCase()] = 1
						} else if (
							word.toLowerCase() in topWords &&
							!regex_emoji.test(word) &&
							word != parseInt(word)
						) {
							topWords[word.toLowerCase()] += 1
						}
					}
				}
			}
		}
	}

	const sorted = Object.entries(topWords)
		.sort(([, v1], [, v2]) => v2 - v1)
		.reduce(
			(obj, [k, v]) => ({
				...obj,
				[k]: v,
			}),
			{}
		)

	const top10Words = {}

	Object.entries(sorted).forEach(([key, value], ind) => {
		if (ind < 10) {
			top10Words[key] = value
		}
	})

	return top10Words
}

function getTopWords(data) {
	const wordsObj = sortData(data)

	const wordsDiv = document.createElement('div')
	wordsDiv.className = 'words'

	const wordsHdr = document.createElement('h2')
	wordsHdr.textContent = 'Most used words'
	wordsDiv.appendChild(wordsHdr)

	Object.entries(wordsObj).forEach(([key, value], ind) => {
		const p = document.createElement('p')
		p.textContent = `${ind + 1}. ${key} - ${value}`

		wordsDiv.appendChild(p)
	})

	wordsContainer.appendChild(wordsDiv)
}

// const nicknames = ['Jane', 'Max', 'Dan']
// const messages = [50, 25, 25]

// const messagesChartObj = {
// 	type: 'doughnut',
// 	data: {
// 		labels: [],
// 		datasets: [
// 			{
// 				data: [],
// 				backgroundColor: [],
// 				borderWidth: 0.5,
// 				borderColor: '#ddd',
// 			},
// 		],
// 	},
// 	options: {
// 		title: {
// 			display: true,
// 			text: 'Messages',
// 			position: 'top',
// 			fontSize: 16,
// 			fontColor: '#111',
// 			padding: 20,
// 		},
// 		legend: {
// 			display: true,
// 			position: 'bottom',
// 			labels: {
// 				boxWidth: 20,
// 				fontColor: '#111',
// 				padding: 15,
// 			},
// 		},
// 		tooltips: {
// 			enabled: false,
// 		},
// 		plugins: {
// 			datalabels: {
// 				color: '#111',
// 				textAlign: 'center',
// 				font: {
// 					lineHeight: 1.6,
// 				},
// 				formatter: function (value, ctx) {
// 					return ctx.chart.data.labels[ctx.dataIndex] + '\n' + value + '%'
// 				},
// 			},
// 		},
// 	},
// }

// for (const nickname of nicknames) {
// 	messagesChartObj.data.labels = [...messagesChartObj.data.labels, nickname]
// 	messagesChartObj.data.datasets[0].data = [
// 		...messagesChartObj.data.datasets[0].data,
// 		33,
// 	]
// 	messagesChartObj.data.datasets[0].backgroundColor = [
// 		...messagesChartObj.data.datasets[0].backgroundColor,
// 		colors[Math.floor(Math.random() * colors.length)],
// 	]
// }

// console.log(messagesChartObj)

// function* shuffle(arr) {
// 	arr = [...arr]
// 	while (arr.length) yield arr.splice((Math.random() * arr.length) | 0, 1)[0]
// }

// console.log([...shuffle(colors)])
