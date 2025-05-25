document.addEventListener('DOMContentLoaded', () => {
    // Эффект пишущей машинки для заголовка
    const usernameEl = document.getElementById('username');
    const usernameText = usernameEl.textContent;
    usernameEl.textContent = '';
    let i = 0;
    function typeWriter() {
        if (i < usernameText.length) {
            usernameEl.textContent += usernameText.charAt(i);
            i++;
            setTimeout(typeWriter, 150); // Скорость печати
        }
    }
    typeWriter();

    // Управление музыкой
    const backgroundMusic = document.getElementById('background-music');
    const playPauseButton = document.getElementById('play-pause-button');
    const volumeSlider = document.getElementById('volume-slider');

    if (backgroundMusic && playPauseButton && volumeSlider) {
        if (backgroundMusic.querySelector('source') && backgroundMusic.querySelector('source').getAttribute('src')) {
            playPauseButton.addEventListener('click', () => {
                if (backgroundMusic.paused) {
                    backgroundMusic.play();
                    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    backgroundMusic.pause();
                    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
                }
            });

            volumeSlider.addEventListener('input', (e) => {
                backgroundMusic.volume = e.target.value;
            });
            backgroundMusic.volume = volumeSlider.value;
        } else {
            if (document.querySelector('.music-player')) {
                 document.querySelector('.music-player').style.display = 'none';
            }
        }
    } else {
         if (document.querySelector('.music-player')) {
            document.querySelector('.music-player').style.display = 'none';
         }
    }

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

    // Эффект следования курсора (JavaScript часть)
    const cursorEffect = document.createElement('div');
    cursorEffect.classList.add('cursor-glow');
    document.body.appendChild(cursorEffect);

    document.addEventListener('mousemove', (e) => {
        cursorEffect.style.left = e.clientX + 'px';
        cursorEffect.style.top = e.clientY + 'px';
    });
});
