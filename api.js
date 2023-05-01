
const uri = "https://api.consumet.org/";
const epinfo = "meta/tmdb/watch/";

//following are to be changed as per show
const epnum = 0;

fetch("https://api.consumet.org/meta/tmdb/info/94796?type=tv")
	.then(response => {
		if (!response.ok) {
			throw Error("Error");
		}
		return response.json();

	})

	.then(data => {

		const files = data.seasons.map(seasons => {
			var allep = seasons.episodes;
			var epId = allep[`${epnum}`].id
			var mediaId = data.id



			fetch(`${uri}` + `${epinfo}` + epId + "?id=" + mediaId)
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

					const source = `${url}`;
					const video = document.querySelector('video');


					////////////////////////////////////////////////////////////////
					var allsubs = response.subtitles




					for (var i = 0; i < allsubs.length; i++) {
						const track = document.createElement('track');
						Object.assign(track, {
							label: `${allsubs[i].lang}`,
							default: false,
							src: `${proxy}` + `${allsubs[i].url}`
						});
						video.appendChild(track);
					}




					//////////////////////////////////////////////////////////////////////////////////////////////////////

					const defaultOptions = {
						captions: { active: true, update: true }
					};

					if (!Hls.isSupported()) {
						video.src = source;
						var player = new Plyr(video, defaultOptions);
					} else {

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

				});
		})
	})

