document.addEventListener('DOMContentLoaded', () => {
    const cursorGlow = document.getElementById('cursor-glow');
    let touchTimeout;

    // --- НАЧАЛО БЛОКА ВИДЕОФОНА ---
    const backgroundVideoElement = document.getElementById('background-video');
    const videoSourceElement = document.getElementById('video-source'); 
    
    const mobileVideoSrc = 'video/1.mp4';   
    const desktopVideoFiles = [];
    // Убедитесь, что i <= N, где N - номер вашего последнего видео для десктопа
    for (let i = 2; i <= 13; i++) { 
        desktopVideoFiles.push(`video/${i}.mp4`);
    }

    let availableDesktopVideos = [...desktopVideoFiles];
    let currentVideoLoadAttempt = 0;
    const MAX_VIDEO_LOAD_ATTEMPTS = 10; // Макс. попыток для одного цикла выбора видео

    function getRandomDesktopVideo() {
        if (availableDesktopVideos.length === 0) {
            // Если список исчерпан, обновляем его из основного списка
            console.warn("Список доступных видео для текущего цикла исчерпан, обновляем.");
            availableDesktopVideos = [...desktopVideoFiles];
            // Если и после этого он пуст (например, desktopVideoFiles был пуст изначально)
            if (availableDesktopVideos.length === 0) {
                 console.warn("Основной список десктопных видео пуст.");
                 return null;
            }
        }
        const randomIndex = Math.floor(Math.random() * availableDesktopVideos.length);
        const selectedVideo = availableDesktopVideos[randomIndex];
        // Удаляем выбранное видео из списка *доступных для текущего цикла*, 
        // чтобы оно не повторялось сразу же, пока не проиграются другие (если бы была смена)
        // Но т.к. у вас loop в HTML, это не так критично, но оставим для консистентности
        availableDesktopVideos.splice(randomIndex, 1); 
        return selectedVideo;
    }

    function loadAndPlayVideo(videoSrc, playWhenReady = true) {
        if (!backgroundVideoElement || !videoSourceElement || !videoSrc) {
            console.warn("Невозможно загрузить видео: не найдены элементы или источник видео.");
            applyFallbackBackground();
            return;
        }

        console.log(`Попытка загрузить видео: ${videoSrc}`);
        videoSourceElement.setAttribute('src', videoSrc);
        // Атрибут loop в HTML (<video autoplay muted loop>) уже управляет зацикливанием
        backgroundVideoElement.load();

        // Сбрасываем обработчики перед назначением
        backgroundVideoElement.onloadedmetadata = null;
        backgroundVideoElement.onerror = null;

        if (playWhenReady) {
            backgroundVideoElement.onloadedmetadata = () => {
                console.log(`Метаданные для ${videoSrc} загружены.`);
                const playPromise = backgroundVideoElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Видео ${videoSrc} успешно воспроизводится.`);
                        currentVideoLoadAttempt = 0; // Сброс счетчика ошибок для успешного видео
                        // При loop в HTML, availableDesktopVideos сбрасывать не обязательно,
                        // т.к. смена не предполагается без перезагрузки.
                        // Но если бы была смена, то здесь бы сбрасывали:
                        // availableDesktopVideos = [...desktopVideoFiles];
                    }).catch(error => { 
                        console.warn(`Ошибка при вызове play() для ${videoSrc}:`, error);
                        if (error.name) console.warn(`Имя ошибки: ${error.name}`);
                        if (error.message) console.warn(`Сообщение ошибки: ${error.message}`);
                        
                        // Попытка загрузить другое видео, если это десктоп
                        if (window.innerWidth > 768) {
                            currentVideoLoadAttempt++; // Увеличиваем счетчик здесь, т.к. play() зафейлился
                            if (currentVideoLoadAttempt < MAX_VIDEO_LOAD_ATTEMPTS) {
                                console.log(`(Из catch play()) Попытка ${currentVideoLoadAttempt} загрузить другое десктопное видео.`);
                                const nextVideo = getRandomDesktopVideo();
                                if (nextVideo) {
                                    loadAndPlayVideo(nextVideo, true);
                                } else {
                                    console.warn("(Из catch play()) Больше нет десктопных видео для попытки загрузки.");
                                    applyFallbackBackground();
                                }
                            } else {
                                 console.warn("(Из catch play()) Достигнуто максимальное количество попыток загрузки для десктопа.");
                                 applyFallbackBackground();
                            }
                        } else { // Для мобильного при ошибке play
                            applyFallbackBackground();
                        }
                    });
                } else {
                     console.warn(`Метод play() не вернул промис для ${videoSrc}.`);
                     if(window.innerWidth > 768) { /* логика для десктопа, если нужно */ } else {applyFallbackBackground();}
                }
            };

            backgroundVideoElement.onerror = (e) => {
                console.error(`Ошибка элемента <video> при загрузке/декодировании ${videoSrc}:`, e);
                currentVideoLoadAttempt++;
                if (currentVideoLoadAttempt < MAX_VIDEO_LOAD_ATTEMPTS && window.innerWidth > 768) {
                    console.log(`(Из onerror) Попытка ${currentVideoLoadAttempt} загрузить другое десктопное видео.`);
                    const nextVideo = getRandomDesktopVideo();
                    if (nextVideo) {
                        loadAndPlayVideo(nextVideo, playWhenReady);
                    } else {
                        console.warn("(Из onerror) Больше нет десктопных видео для попытки загрузки.");
                        applyFallbackBackground();
                    }
                } else if (window.innerWidth > 768) {
                    console.warn("(Из onerror) Достигнуто максимальное количество попыток загрузки для десктопа.");
                    applyFallbackBackground();
                } else { // Для мобильного или если попытки исчерпаны
                    applyFallbackBackground();
                }
            };
        }
    }

    function setBackgroundVideo(playWhenReady = true) {
        currentVideoLoadAttempt = 0; // Сброс счетчика для новой сессии выбора видео
        availableDesktopVideos = [...desktopVideoFiles]; // Обновляем список доступных при каждом вызове

        if (backgroundVideoElement && videoSourceElement) {
            let videoToLoad = '';
            if (window.innerWidth <= 768) { 
                videoToLoad = mobileVideoSrc; 
                console.log("Выбрано мобильное видео:", videoToLoad);
                loadAndPlayVideo(videoToLoad, playWhenReady);
            } else { 
                videoToLoad = getRandomDesktopVideo(); 
                if (videoToLoad) {
                    console.log("Случайно выбрано десктопное видео:", videoToLoad);
                    loadAndPlayVideo(videoToLoad, playWhenReady);
                } else {
                    console.warn("Не удалось выбрать десктопное видео для первой попытки (возможно, список пуст).");
                    applyFallbackBackground();
                }
            }
        } else { 
            console.warn("Video elements not found for background video setup.");
            applyFallbackBackground(); 
        }
    }

    function applyFallbackBackground() {
        console.log("Применен запасной фон.");
        const overlayDiv = document.querySelector('.overlay');
        if (overlayDiv) { 
            overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.71)';
        }
        if (videoSourceElement) videoSourceElement.setAttribute('src', '');
        if (backgroundVideoElement) {
            backgroundVideoElement.style.display = 'none'; // Скрываем видео элемент
        }
        document.body.style.backgroundColor = '#121212'; // Устанавливаем цвет фона body
    }
    
    setBackgroundVideo(); // Первоначальный запуск
    // --- КОНЕЦ БЛОКА ВИДЕОФОНА ---


    // --- НАЧАЛО БЛОКА 3D СЛЕДОВАНИЯ ЗА КУРСОРОМ (TILT EFFECT) ---
    const tiltElements = document.querySelectorAll('.content-box, .music-player');
    const maxTilt = 8; // Максимальный угол наклона в градусах
    const deadZoneFactor = 0.4; // Фактор для уменьшения наклона при наведении на сам элемент

    function applyTiltEffect(e) {
        // Эта проверка теперь в toggleTiltListener
        // if (window.innerWidth <= 1024) { ... return; }

        tiltElements.forEach(el => {
            const rect = el.getBoundingClientRect();

            // Координаты мыши относительно центра ОКНА
            const windowCenterX = window.innerWidth / 2;
            const windowCenterY = window.innerHeight / 2;
            const mouseXRelativeToWindow = e.clientX - windowCenterX;
            const mouseYRelativeToWindow = e.clientY - windowCenterY;

            // Нормализуем значения
            const percentX = mouseXRelativeToWindow / windowCenterX;
            const percentY = mouseYRelativeToWindow / windowCenterY;

            let tiltX = -percentY * maxTilt; 
            let tiltY = percentX * maxTilt;

            // Ограничиваем максимальный наклон
            tiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
            tiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));
            
            // Если курсор НАД элементом, уменьшаем наклон
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const mouseXInElement = e.clientX - rect.left;
                const mouseYInElement = e.clientY - rect.top;
                const elCenterX = rect.width / 2;
                const elCenterY = rect.height / 2;
                const mouseRelativeToElCenterX = mouseXInElement - elCenterX;
                const mouseRelativeToElCenterY = mouseYInElement - elCenterY;

                tiltY = (mouseRelativeToElCenterX / elCenterX) * maxTilt * deadZoneFactor;
                tiltX = -(mouseRelativeToElCenterY / elCenterY) * maxTilt * deadZoneFactor;
            }
            // console.log(el, `tiltX: ${tiltX.toFixed(2)}, tiltY: ${tiltY.toFixed(2)}`); // Для отладки
            el.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            console.log(`Применено к ${el.className || el.id}: rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg)`); // <--- ДОБАВЬТЕ ЭТОТ ЛОГ
        });
    }

    function resetTilt() {
        tiltElements.forEach(el => {
            el.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }

    let tiltListenerAttached = false;

    function toggleTiltListener() {
        console.log("toggleTiltListener вызван. Ширина окна:", window.innerWidth);
        if (window.innerWidth > 1024) { // Порог для ПК, можете изменить на 768, если хотите и на планшетах
            if (!tiltListenerAttached) {
                document.addEventListener('mousemove', applyTiltEffect);
                tiltListenerAttached = true;
                console.log("Tilt effect enabled. Слушатель mousemove добавлен.");
            }
        } else {
            if (tiltListenerAttached) {
                document.removeEventListener('mousemove', applyTiltEffect);
                resetTilt(); 
                tiltListenerAttached = false;
                console.log("Tilt effect disabled and reset.");
            } else {
                 resetTilt(); 
            }
        }
    }

    toggleTiltListener(); 
    window.addEventListener('resize', toggleTiltListener); 
    // --- КОНЕЦ БЛОКА 3D СЛЕДОВАНИЯ ЗА КУРСОРОМ (TILT EFFECT) ---


    // --- НАЧАЛО БЛОКА КУРСОРА (GLOW) ---
    function updateGlowPosition(x, y) { if (cursorGlow) { cursorGlow.style.left = `${x}px`; cursorGlow.style.top = `${y}px`; } }
    function showGlow(isTouchActive = false) { if (cursorGlow) { cursorGlow.classList.add('visible'); if (isTouchActive) { cursorGlow.classList.add('touch-active'); } else { cursorGlow.classList.remove('touch-active'); } clearTimeout(touchTimeout); } }
    function hideGlow(delay = 300) { if (cursorGlow) { cursorGlow.classList.remove('touch-active'); touchTimeout = setTimeout(() => { cursorGlow.classList.remove('visible'); }, delay); } }
    
    document.addEventListener('mousemove', (e) => { updateGlowPosition(e.clientX, e.clientY); showGlow(); });
    document.addEventListener('mouseleave', () => { hideGlow(0); });
    document.addEventListener('touchstart', (e) => { const touch = e.touches[0]; updateGlowPosition(touch.clientX, touch.clientY); showGlow(true); }, { passive: true });
    document.addEventListener('touchmove', (e) => { const touch = e.touches[0]; updateGlowPosition(touch.clientX, touch.clientY); showGlow(true); }, { passive: true });
    document.addEventListener('touchend', () => { hideGlow(); });
    document.addEventListener('touchcancel', () => { hideGlow(); });
    // --- КОНЕЦ БЛОКА КУРСОРА (GLOW) ---


    // --- НАЧАЛО БЛОКА МУЗЫКАЛЬНОГО ПЛЕЕРА ---
    const backgroundMusic = document.getElementById('background-music'); 
    const playPauseButton = document.getElementById('play-pause-button'); 
    const prevTrackButton = document.getElementById('prev-track-button'); 
    const nextTrackButton = document.getElementById('next-track-button'); 
    const volumeSlider = document.getElementById('volume-slider'); 
    const seekSlider = document.getElementById('seek-slider'); 
    const currentTimeEl = document.getElementById('current-time'); 
    const totalDurationEl = document.getElementById('total-duration'); 
    const trackTitleEl = document.getElementById('track-title'); 
    const musicPlayerDiv = document.querySelector('.music-player');

    const musicPlaylist = [ 
        { src: 'music/1.mp3', displayName: 'ОРУЩАЯ ДУРА' }, { src: 'music/2.m4a', displayName: 'АЙ ЛАВ Ю СОУУ' }, { src: 'music/3.mp3', displayName: 'MUNIMUNI MURAMURA' }, { src: 'music/4.mp3', displayName: 'ГРОЗА ТВИЧА' }, { src: 'music/5.mp3', displayName: 'СИСЯМБЫ' }, { src: 'music/6.mp3', displayName: 'ГЛАВНЫЙ ГЕРОЙ' }, { src: 'music/7.mp3', displayName: 'GDE PAPA' }, { src: 'music/8.mp3', displayName: 'hell.. YEAH' }, { src: 'music/9.mp3', displayName: 'GO, JUST GO' }, { src: 'music/10.mp3', displayName: 'Я ПОД ЭТО НА ХВХ ПЕНИЛ' } 
    ];

    let currentTrackIndex = 0; 
    let isPlaying = false;

    function loadTrack(trackIndex) { if (!backgroundMusic || musicPlaylist.length === 0) { if (musicPlayerDiv) musicPlayerDiv.style.display = 'none'; return; } const track = musicPlaylist[trackIndex]; currentTrackIndex = trackIndex; backgroundMusic.src = track.src; backgroundMusic.load(); if(trackTitleEl) { trackTitleEl.textContent = track.displayName; } if (currentTimeEl) currentTimeEl.textContent = formatTime(0); if (totalDurationEl) totalDurationEl.textContent = formatTime(0); if (seekSlider) seekSlider.value = 0; }
    function playTrack() { if (!backgroundMusic || !backgroundMusic.src) return; backgroundMusic.play().then(() => { isPlaying = true; if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; }).catch(error => { console.error("Ошибка воспроизведения аудио:", error); isPlaying = false; if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; }); }
    function pauseTrack() { if (!backgroundMusic) return; backgroundMusic.pause(); isPlaying = false; if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; }
    function playPauseToggle() { if (isPlaying) { pauseTrack(); } else { playTrack(); } }
    function nextTrack() { if (musicPlaylist.length === 0) return; currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length; loadTrack(currentTrackIndex); playTrack(); }
    function prevTrack() { if (musicPlaylist.length === 0) return; currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length; loadTrack(currentTrackIndex); playTrack(); }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; }
    function updateSeekSlider() { if (backgroundMusic && seekSlider && currentTimeEl && totalDurationEl) { if (backgroundMusic.duration && !isNaN(backgroundMusic.duration)) { seekSlider.value = (backgroundMusic.currentTime / backgroundMusic.duration) * 100; currentTimeEl.textContent = formatTime(backgroundMusic.currentTime); totalDurationEl.textContent = formatTime(backgroundMusic.duration); } else {  seekSlider.value = 0; currentTimeEl.textContent = formatTime(0); if (backgroundMusic.duration && !isNaN(backgroundMusic.duration)) { totalDurationEl.textContent = formatTime(backgroundMusic.duration); } else { totalDurationEl.textContent = "0:00";  } } } }
    
    if (musicPlaylist.length > 0 && backgroundMusic && musicPlayerDiv) { const randomIndex = Math.floor(Math.random() * musicPlaylist.length); loadTrack(randomIndex); if (playPauseButton) playPauseButton.addEventListener('click', playPauseToggle); if (nextTrackButton) nextTrackButton.addEventListener('click', nextTrack); if (prevTrackButton) prevTrackButton.addEventListener('click', prevTrack); if (volumeSlider) { backgroundMusic.volume = volumeSlider.value; volumeSlider.addEventListener('input', (e) => { backgroundMusic.volume = e.target.value; }); } if (seekSlider) { seekSlider.addEventListener('input', () => { if (backgroundMusic.duration && !isNaN(backgroundMusic.duration)) { backgroundMusic.currentTime = (seekSlider.value / 100) * backgroundMusic.duration; } }); } backgroundMusic.addEventListener('timeupdate', updateSeekSlider); backgroundMusic.addEventListener('loadedmetadata', () => { updateSeekSlider(); }); backgroundMusic.addEventListener('ended', nextTrack); backgroundMusic.addEventListener('error', (e) => { console.error("Ошибка аудио элемента:", e); if (trackTitleEl) trackTitleEl.textContent = "Ошибка загрузки трека"; }); } else { if (musicPlayerDiv) { musicPlayerDiv.style.display = 'none'; } }
    // --- КОНЕЦ БЛОКА МУЗЫКАЛЬНОГО ПЛЕЕРА ---
    

    // --- НАЧАЛО БЛОКА ОБНОВЛЕНИЯ ГОДА ---
    const yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
    // --- КОНЕЦ БЛОКА ОБНОВЛЕНИЯ ГОДА ---

});
