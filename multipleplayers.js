//import { uri } from "./uri.js";


//following are to be changed as per source
const uri = "https://animia.xyz/";
const showinfo = "movies/dramacool/info?id=";
const epinfo = "movies/dramacool/watch?episodeId=";


//following are to be changed as per show
const epnum = 0; 
const showid = "drama-detail/emergency-lands-of-love";


document.addEventListener('DOMContentLoaded', () => {


	fetch(`${uri}`+ `${showinfo}` + `${showid}`)
		.then(response => {
			if (!response.ok) {
				throw Error("Error");
			}
			return response.json();

		})

		.then(data => {
			/// use forEach here to get id of every episodes and then use following most of the code (which is required for one player) for every player. then initiate plyr refer https://codepen.io/jackjona/pen/JjypzWj

			var totalep = data.episodes.length;
			for (var i = 0; i < totalep; i++) {

				var epId = data.episodes[i].id
				var mediaId = data.id

				//following should be same for all episodes..

				fetch(`${uri}` + `${epinfo}` + epId + "&mediaId=" + mediaId)
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

						const source = 'https://proxy.vnxservers.com/proxy/m3u8/' + encodeURIComponent(url[i])



							const video = document.querySelector('video');
							var urlforsub = response.subtitles[0].url
							var langforsub = response.subtitles[0].lang

							const player = new Plyr(video[i], { captions: { active: true, update: true, language: 'en' } });
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
								video[i].src = source[i];
							} else {
								const hls = new Hls();
								hls.loadSource(source[i]);
								hls.attachMedia(video[i]);
								window.hls = hls;
								player.on('languagechange', () => {
									setTimeout(() => hls.subtitleTrack = player.currentTrack, 50);
								});
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
								})
								window.player = player;
							}


							var players = Array.from(document.querySelectorAll('.video')).map((p) => new Plyr(p));

						})

						//})
						//})
					}
			})
		//})
})









