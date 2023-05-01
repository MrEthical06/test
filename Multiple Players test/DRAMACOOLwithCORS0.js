//import { uri } from "./uri.js";


//following are to be changed as per source
const uri = "https://animia.xyz/";
const showinfo = "movies/dramacool/info?id=";
const epinfo = "movies/dramacool/watch?episodeId=";


//following are to be changed as per show
const epnum = 0; 
const showid = "drama-detail/emergency-lands-of-love";


//document.addEventListener('DOMContentLoaded', () => {


	fetch(`${uri}`+ `${showinfo}` + `${showid}`)
		.then(response => {
			if (!response.ok) {
				throw Error("Error");
			}
			return response.json();

		})

		.then(data => {
			/// use forEach here to get id of every episodes and then use following most of the code (which is required for one player) for every player. then initiate plyr refer https://codepen.io/jackjona/pen/JjypzWj


				var epId = data.episodes[`${epnum}`].id
				var mediaId = data.id


				fetch(`${uri}`+ `${epinfo}` + epId + "&mediaId=" + mediaId)
					.then(response => {
						if (!response.ok) {
							throw Error("Error");
						}
						return response.json();
					})

					.then(response => {

						var allsources = response.sources
						function istrue(sources) {
							return sources.isM3U8 === true;
						}

						var playlistsource = allsources.find(istrue)
						var url = playlistsource.url


						//following will always fins url for english subtitles if inside array lang is given and lang=english

						var urlforsub = response.subtitles[0].url

						var langforsub = response.subtitles[0].lang



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

							hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

								const availableQualities = hls.levels.map((l) => l.height)
								availableQualities.unshift(0) 
								defaultOptions.quality = {
									default: 0, //Default - AUTO
									options: availableQualities,
									forced: true,
									onChange: (e) => updateQuality(e),
								}

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
					});
		})
//})









