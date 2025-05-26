document.addEventListener('DOMContentLoaded', () => {
    const cursorGlow = document.getElementById('cursor-glow');
    let touchTimeout;

    // --- Логика для фонового видео ---
    const backgroundVideoElement = document.getElementById('background-video');
    const videoSourceElement = document.getElementById('video-source'); 
    
    // Убедитесь, что эти пути верны для вашего проекта
    const desktopVideoSrc = 'video/2.mp4'; 
    const mobileVideoSrc = 'video/1.mp4';   

    function setBackgroundVideo(playWhenReady = true) {
        if (backgroundVideoElement && videoSourceElement) {
            let videoToLoad = '';
            if (window.innerWidth <= 768) { 
                videoToLoad = mobileVideoSrc; 
            } else { 
                videoToLoad = desktopVideoSrc; 
            }

            const currentSrc = videoSourceElement.getAttribute('src');
            if (videoToLoad && currentSrc !== videoToLoad) { 
                videoSourceElement.setAttribute('src', videoToLoad);
                backgroundVideoElement.load();
                if (playWhenReady) {
                    // Пытаемся запустить видео после загрузки метаданных
                    backgroundVideoElement.onloadedmetadata = () => {
                        backgroundVideoElement.play().catch(error => { 
                            console.warn("Autoplay видеофона был предотвращен (onloadedmetadata):", error); 
                        });
                        backgroundVideoElement.onloadedmetadata = null; // Убираем обработчик
                    };
                }
            } else if (videoToLoad && currentSrc === videoToLoad && playWhenReady && backgroundVideoElement.paused) {
                // Если источник тот же, но видео на паузе, пытаемся запустить
                backgroundVideoElement.play().catch(error => { 
                    console.warn("Autoplay видеофона был предотвращен (retry):", error); 
                });
            } else if (!videoToLoad) { 
                applyFallbackBackground(); 
            }
        } else { 
            console.warn("Video elements not found for background video setup.");
            applyFallbackBackground(); 
        }
    }

    function applyFallbackBackground() {
        const overlayDiv = document.querySelector('.overlay');
        if (overlayDiv) { 
            overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.71)'; // Менее интенсивный оверлей, если нет видео
        }
        // Если видео нет, основной фон body (из CSS) будет виден
    }
    
    setBackgroundVideo(); // Устанавливаем видео при загрузке страницы

    // --- Логика для эффекта курсора/касания ---
    function updateGlowPosition(x, y) { 
        if (cursorGlow) { 
            cursorGlow.style.left = `${x}px`; 
            cursorGlow.style.top = `${y}px`; 
        } 
    }
    function showGlow(isTouchActive = false) { 
        if (cursorGlow) { 
            cursorGlow.classList.add('visible'); 
            if (isTouchActive) { 
                cursorGlow.classList.add('touch-active'); 
            } else { 
                cursorGlow.classList.remove('touch-active'); 
            } 
            clearTimeout(touchTimeout); 
        } 
    }
    function hideGlow(delay = 300) { 
        if (cursorGlow) { 
            cursorGlow.classList.remove('touch-active'); 
            touchTimeout = setTimeout(() => { 
                cursorGlow.classList.remove('visible'); 
            }, delay); 
        } 
    }
    
    document.addEventListener('mousemove', (e) => { 
        updateGlowPosition(e.clientX, e.clientY); 
        showGlow(); 
    });
    document.addEventListener('mouseleave', () => { 
        hideGlow(0); 
    });
    document.addEventListener('touchstart', (e) => { 
        const touch = e.touches[0]; 
        updateGlowPosition(touch.clientX, touch.clientY); 
        showGlow(true); 
    }, { passive: true });
    document.addEventListener('touchmove', (e) => { 
        const touch = e.touches[0]; 
        updateGlowPosition(touch.clientX, touch.clientY); 
        showGlow(true); 
    }, { passive: true });
    document.addEventListener('touchend', () => { 
        hideGlow(); 
    });
    document.addEventListener('touchcancel', () => { 
        hideGlow(); 
    });

    // --- Музыкальный плеер ---
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
        { src: 'music/1.mp3', displayName: 'ОРУЩАЯ ДУРА' }, 
        { src: 'music/2.m4a', displayName: 'АЙ ЛАВ Ю СОУУ' }, 
        { src: 'music/3.mp3', displayName: 'MUNIMUNI MURAMURA' }, 
        { src: 'music/4.mp3', displayName: 'ГРОЗА ТВИЧА' }, 
        { src: 'music/5.mp3', displayName: 'СИСЯМБЫ' }, 
        { src: 'music/6.mp3', displayName: 'ГЛАВНЫЙ ГЕРОЙ' }, 
        { src: 'music/7.mp3', displayName: 'GDE PAPA' }, 
        { src: 'music/8.mp3', displayName: 'hell.. YEAH' }, 
        { src: 'music/9.mp3', displayName: 'GO, JUST GO' }, 
        { src: 'music/10.mp3', displayName: 'Я ПОД НЕЁ НА ХВХ ЕБАЛ ВСЕХ' } 
    ];

    let currentTrackIndex = 0; 
    let isPlaying = false;

    function loadTrack(trackIndex) { 
        if (!backgroundMusic || musicPlaylist.length === 0) { 
            if (musicPlayerDiv) musicPlayerDiv.style.display = 'none'; 
            return; 
        } 
        const track = musicPlaylist[trackIndex]; 
        currentTrackIndex = trackIndex; 
        backgroundMusic.src = track.src; 
        backgroundMusic.load(); 
        if(trackTitleEl) { 
            trackTitleEl.textContent = track.displayName; 
        } 
        if (currentTimeEl) currentTimeEl.textContent = formatTime(0); 
        if (totalDurationEl) totalDurationEl.textContent = formatTime(0); 
        if (seekSlider) seekSlider.value = 0; 
    }
    function playTrack() { 
        if (!backgroundMusic || !backgroundMusic.src) return; 
        backgroundMusic.play().then(() => { 
            isPlaying = true; 
            if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; 
        }).catch(error => { 
            console.error("Ошибка воспроизведения аудио:", error); 
            isPlaying = false; 
            if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; 
        }); 
    }
    function pauseTrack() { 
        if (!backgroundMusic) return; 
        backgroundMusic.pause(); 
        isPlaying = false; 
        if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; 
    }
    function playPauseToggle() { 
        if (isPlaying) { 
            pauseTrack(); 
        } else { 
            playTrack(); 
        } 
    }
    function nextTrack() { 
        if (musicPlaylist.length === 0) return; 
        currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length; 
        loadTrack(currentTrackIndex); 
        playTrack(); 
    }
    function prevTrack() { 
        if (musicPlaylist.length === 0) return; 
        currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length; 
        loadTrack(currentTrackIndex); 
        playTrack(); 
    }
    function formatTime(seconds) { 
        const minutes = Math.floor(seconds / 60); 
        const secs = Math.floor(seconds % 60); 
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; 
    }
    function updateSeekSlider() { 
        if (backgroundMusic && seekSlider && currentTimeEl && totalDurationEl) { 
            if (backgroundMusic.duration && !isNaN(backgroundMusic.duration)) { 
                seekSlider.value = (backgroundMusic.currentTime / backgroundMusic.duration) * 100; 
                currentTimeEl.textContent = formatTime(backgroundMusic.currentTime); 
                totalDurationEl.textContent = formatTime(backgroundMusic.duration); 
            } else {  
                seekSlider.value = 0; 
                currentTimeEl.textContent = formatTime(0); 
                if (backgroundMusic.duration && !isNaN(backgroundMusic.duration)) { 
                    totalDurationEl.textContent = formatTime(backgroundMusic.duration); 
                } else { 
                    totalDurationEl.textContent = "0:00";  
                } 
            } 
        } 
    }
    
    if (musicPlaylist.length > 0 && backgroundMusic && musicPlayerDiv) { 
        const randomIndex = Math.floor(Math.random() * musicPlaylist.length); 
        loadTrack(randomIndex); 
        if (playPauseButton) playPauseButton.addEventListener('click', playPauseToggle); 
        if (nextTrackButton) nextTrackButton.addEventListener('click', nextTrack); 
        if (prevTrackButton) prevTrackButton.addEventListener('click', prevTrack); 
        if (volumeSlider) { 
            backgroundMusic.volume = volumeSlider.value; 
            volumeSlider.addEventListener('input', (e) => { 
                backgroundMusic.volume = e.target.value; 
            }); 
        } 
        if (seekSlider) { 
            seekSlider.addEventListener('input', () => { 
                if (backgroundMusic.duration && !isNaN(backgroundMusic.duration)) { 
                    backgroundMusic.currentTime = (seekSlider.value / 100) * backgroundMusic.duration; 
                } 
            }); 
        } 
        backgroundMusic.addEventListener('timeupdate', updateSeekSlider); 
        backgroundMusic.addEventListener('loadedmetadata', () => { 
            updateSeekSlider();  
            // Не пытаемся запустить аудио здесь автоматически, пусть пользователь нажмет play
            // if (isPlaying) playTrack();  
        }); 
        backgroundMusic.addEventListener('ended', nextTrack); 
        backgroundMusic.addEventListener('error', (e) => { 
            console.error("Ошибка аудио элемента:", e); 
            if (trackTitleEl) trackTitleEl.textContent = "Ошибка загрузки трека"; 
        }); 
    } else { 
        if (musicPlayerDiv) { 
            musicPlayerDiv.style.display = 'none'; 
        } 
    }
    
    // Обновление года в копирайте
    const yearEl = document.getElementById('year');
    if (yearEl) { 
        yearEl.textContent = new Date().getFullYear(); 
    }
});
