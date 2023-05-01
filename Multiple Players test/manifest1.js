
document.addEventListener('DOMContentLoaded', () => {

fetch("https://animia.xyz/meta/tmdb/info/94796?type=tv")
	.then(response => {
		if (!response.ok) {
			throw Error("Error");
		}
		return response.json();

	})

	.then(data => {

		const showid = data.id
		const files = data.seasons.map(seasons => {
			var allep = seasons.episodes;
			console.log(allep);

			

			allep.forEach(episode => {
				var epNum = episode.episode
				var button = `${epNum}`

				let newBtn = document.createElement('button');
				newBtn.innerText = `${epNum}`;
				newBtn.id= `button`
				document.querySelector('#buttonblock').appendChild(newBtn);


			})
//////////////////////////////////////////this following event listener causes player to reload every time//////dont use this technique as it complicates and causes errors rather go with way of episode html pages 
			//document.addEventListener('click', (ev) => {
			//	if (ev.target.matches('button')) {


			//		epnumber = ev.target.innerText - 1

				//}
			

				//	console.log(epnumber)

					
					//var epId = allep[`${epnumber}`].id

					var epId = allep[0].id

					console.log(epId)


					fetch("https://animia.xyz/meta/tmdb/watch/" + epId + "?id=" + showid)
						.then(response => {
							if (!response.ok) {
								throw Error("Error");
							}
							return response.json();
						})

						///////////////////////////////////////////////////////////////////////////////////
						//.then(data => {

						//const files = data.sources.map(sources => {
						//var ep = `${sources.url}`;
						//var ep = response.sources[3].url
						///////////////////////////////////////////////////////////////////////////////////////
						//the following changes (originally it was as in //..) will find auto quality m3u8 file i.e. playlist.m3u8 for tmdb just change this syntax a little for getting playlists in other api.
						//if there is only one src then use above {var ep} part
						// primarily will have to change quality, sources, url for src


						.then(response => {

							var allsources = response.sources
							function isauto(source) {
								return source.quality === "auto";
							}

							var playlistsource = allsources.find(isauto)
							var url = playlistsource.url


							//following will always fins url for english subtitles if inside array lang is given and lang=english

							var allsubs = response.subtitles
							function isEnglish(subs) {
								return subs.lang === "English";
							}

							////to get id /////  var engSub = allsubs.findIndex(isEnglish)

							var engSub = allsubs.findLast(isEnglish)
							var urlforsub = engSub.url

							//above subs may not be accurate so we r using following direct indexing subtitles files
							//var urlforsub = response.subtitles[8].url

							var langforsub = engSub.lang


							////////////////////////////////////////////////////////////////////////////////////////////////////
							//following settings can be used when we need specific subtitle at specific location
							//var subt = response.subtitles[7].url
							//var id = allsubs.indexOf("url");
							//console.log(id)

							//const subt = data.subtitles.map(subtitles => {
							//	var subUrl = `${subtitles.url}`;
							//	var subLang = `${subtitles.lang}`;

							////////////////////////////////////////////////////////////////////////////////////////////////
							//const source = "https://cors.consumet.stream/${ep}";


							//const source = `${ep}`

							const source = `${url}`;
							const video = document.querySelector('video');

							const defaultOptions = {
								captions: { active: true, update: true, language: 'en', src: `${urlforsub}` }
							};

							const track = document.createElement('track');
							Object.assign(track, {
								label: 'English',
								srclang: 'en',
								default: true,
								src: `${urlforsub}`
							});
							video.appendChild(track);


							if (!Hls.isSupported()) {
								video.src = source;
								var player = new Plyr(video, defaultOptions);
							} else {

								// For more Hls.js options, see https://github.com/dailymotion/hls.js

								const hls = new Hls();
								hls.loadSource(source);

								// From the m3u8 playlist, hls parses the manifest and returns
								// all available video qualities. This is important, in this approach,
								// we will have one source on the Plyr player.

								hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

									// Transform available levels into an array of integers (height values).

									const availableQualities = hls.levels.map((l) => l.height)
									availableQualities.unshift(0) //prepend 0 to quality array

									// Add new qualities to option
									//these quality option are for tmdb. change default:2 & 2:auto as per requirement. prefer 0 if or auto in fetched (links) streaming qualities
									//the above statement is no more needed as above we directly find source with m3u8 playlist and load it as url

									defaultOptions.quality = {
										default: 0, //Default - AUTO
										options: availableQualities,
										forced: true,
										onChange: (e) => updateQuality(e),
									}

									// Add Auto Label

									defaultOptions.i18n = {
										qualityLabel: {
											0: 'Auto',
										},
									}

									hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
										var span = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='0'] span")
										if (hls.autoLevelEnabled) {
											span.innerHTML = `AUTO (${hls.levels[data.level].height}p)`
										} else {
											span.innerHTML = `AUTO`
										}
									});

									var player = new Plyr(video, defaultOptions);
								});

								hls.attachMedia(video);
								window.hls = hls;
							}

							function updateQuality(newQuality) {
								if (newQuality === 0) {
									window.hls.currentLevel = -1; //Enable AUTO quality if option.value = 0
								} else {
									window.hls.levels.forEach((level, levelIndex) => {
										if (level.height === newQuality) {
											console.log("Found quality match with " + newQuality);
											window.hls.currentLevel = levelIndex;
										}
									});
								}
							}

							//})
							//})
						});
			//})
})

		})
	})