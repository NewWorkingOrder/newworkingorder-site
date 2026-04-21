(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var useMobileVideo = window.matchMedia('(max-width: 720px)').matches;

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    var navLinks = document.querySelectorAll('.site-nav a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var videos = document.querySelectorAll('.video-shell video');
  videos.forEach(function (video) {
    var source = video.querySelector('source');
    if (!source) return;

    var desktopSrc = video.getAttribute('data-desktop-src') || source.getAttribute('src') || '';
    var mobileSrc = video.getAttribute('data-mobile-src') || '';
    var activeSrc = useMobileVideo && mobileSrc ? mobileSrc : desktopSrc;

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    source.setAttribute('src', activeSrc);

    function attemptPlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function (error) {
          console.error('AMS video play() failed', error);
        });
      }
    }

    video.addEventListener('loadeddata', attemptPlay, { once: true });
    video.addEventListener('canplay', attemptPlay, { once: true });
    video.addEventListener('error', function () {
      if (activeSrc !== desktopSrc && desktopSrc) {
        source.setAttribute('src', desktopSrc);
        video.load();
        attemptPlay();
        return;
      }
      console.error('AMS video failed to load');
    }, { once: true });

    video.load();
    attemptPlay();
  });
})();
