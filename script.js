document.addEventListener('DOMContentLoaded', () => {
    // Эффект пишущей машинки
    const usernameEl = document.getElementById('username');
    if (usernameEl) {
        const usernameText = usernameEl.textContent;
        usernameEl.textContent = '';
        let i = 0;
        function typeWriter() {
            if (i < usernameText.length) {
                usernameEl.textContent += usernameText.charAt(i);
                i++;
                setTimeout(typeWriter, 150);
            }
        }
        typeWriter();
    }

    // Музыкальный плеер
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

    // --- ВАЖНО: Замените на имена ваших файлов в папке /music/ ---
    const musicFiles = [
        '1.mp3', '2.m4a', '3.mp3', '4.mp3', '5.mp3',
        '6.mp3', '7.mp3', '8.mp3', '9.mp3', '10.mp3'
    ];
    // -----------------------------------------------------------

    let currentTrackIndex = 0;
    let isPlaying = false;

    function loadTrack(trackIndex) {
        if (!backgroundMusic || musicFiles.length === 0) {
            if (musicPlayerDiv) musicPlayerDiv.style.display = 'none';
            return;
        }
        currentTrackIndex = trackIndex;
        backgroundMusic.src = 'music/' + musicFiles[currentTrackIndex];
        backgroundMusic.load(); // Загружаем трек
        
        if(trackTitleEl) {
            // Убираем расширение .mp3 и делаем первую букву заглавной для отображения
            let displayName = musicFiles[currentTrackIndex].replace('.mp3', '');
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            trackTitleEl.textContent = displayName;
        }
        
        // Сбрасываем время и ползунок при загрузке нового трека
        if (currentTimeEl) currentTimeEl.textContent = formatTime(0);
        if (totalDurationEl) totalDurationEl.textContent = formatTime(0);
        if (seekSlider) seekSlider.value = 0;
    }

    function playTrack() {
        if (!backgroundMusic || !backgroundMusic.src) return;
        backgroundMusic.play();
        isPlaying = true;
        if (playPauseButton) playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
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
        if (musicFiles.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
        loadTrack(currentTrackIndex);
        playTrack(); // Автоматически проигрывать следующий трек
    }

    function prevTrack() {
        if (musicFiles.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
        loadTrack(currentTrackIndex);
        playTrack(); // Автоматически проигрывать предыдущий трек
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateSeekSlider() {
        if (backgroundMusic && seekSlider && currentTimeEl && totalDurationEl) {
            if (backgroundMusic.duration) {
                seekSlider.value = (backgroundMusic.currentTime / backgroundMusic.duration) * 100;
                currentTimeEl.textContent = formatTime(backgroundMusic.currentTime);
                totalDurationEl.textContent = formatTime(backgroundMusic.duration);
            }
        }
    }
    
    if (musicFiles.length > 0 && backgroundMusic) {
        // Выбираем случайный трек при первой загрузке
        const randomIndex = Math.floor(Math.random() * musicFiles.length);
        loadTrack(randomIndex);
        // Не будем автоматически проигрывать при загрузке страницы, пусть пользователь нажмет play
        // Если хотите автоплей, добавьте: playTrack();

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
                if (backgroundMusic.duration) {
                    backgroundMusic.currentTime = (seekSlider.value / 100) * backgroundMusic.duration;
                }
            });
        }
        
        backgroundMusic.addEventListener('timeupdate', updateSeekSlider);
        backgroundMusic.addEventListener('loadedmetadata', updateSeekSlider); // Обновить длительность, когда метаданные загружены
        backgroundMusic.addEventListener('ended', nextTrack); // Автоматически переключать на следующий трек по завершении

    } else {
        if (musicPlayerDiv) {
            musicPlayerDiv.style.display = 'none'; // Скрываем плеер, если нет треков или элемента audio
        }
    }


    // Проверка наличия видеофона
    const backgroundVideo = document.getElementById('background-video');
    if (backgroundVideo) {
        const videoSource = backgroundVideo.querySelector('source');
        if (!videoSource || !videoSource.getAttribute('src') || videoSource.getAttribute('src') === "") {
            document.body.style.backgroundColor = '#1a1a1a';
            if (document.querySelector('.overlay')) {
                document.querySelector('.overlay').style.backgroundColor = 'rgba(0,0,0,0.3)';
            }
        }
    }

    // Эффект следования курсора
    const cursorEffect = document.createElement('div');
    cursorEffect.classList.add('cursor-glow');
    document.body.appendChild(cursorEffect);

    document.addEventListener('mousemove', (e) => {
        cursorEffect.style.left = e.clientX + 'px';
        cursorEffect.style.top = e.clientY + 'px';
    });
});
