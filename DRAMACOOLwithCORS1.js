//import { uri } from "./uri.js";

const uri = "https://api.consumet.org/";
const epnum = 1; 

document.addEventListener('DOMContentLoaded', () => {


	fetch(`${uri}`+ "movies/dramacool/info?id=drama-detail/emergency-lands-of-love")
		.then(response => {
			if (!response.ok) {
				throw Error("Error");
			}
			return response.json();

		})

		.then(data => {



			//const files = data.episodes.map(episodes => {

				var epId = response.episodes[`${epnum}`].id
				var epId = data.episodes[`${epnum}`].id
				var mediaId = data.id


				fetch(`${uri}`+"movies/dramacool/watch?episodeId=" + epId + "&mediaId=" + mediaId)
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
						function istrue(sources) {
							return sources.isM3U8 === true;
						}

						var playlistsource = allsources.find(istrue)
						var url = playlistsource.url
						console.log(url)


						//following will always fins url for english subtitles if inside array lang is given and lang=english

						var urlforsub = response.subtitles[0].url

						var langforsub = response.subtitles[0].lang


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

						const source = 'https://proxy.vnxservers.com/proxy/m3u8/' + encodeURIComponent(url)
						const video = document.querySelector('video');

						const defaultOptions = {
							captions: { active: true, update: true, language: 'en', src: `${urlforsub}` }
						};

						const track = document.createElement('track');
						Object.assign(track, {
							label: 'English',
							srclang: 'en',
							default: true,
							src: 'https://proxy.vnxservers.com/proxy/m3u8/' + encodeURIComponent(urlforsub)
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
			//})

		})
})









