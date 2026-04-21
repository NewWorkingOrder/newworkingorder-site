(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

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

  var videoStyle = document.createElement('style');
  videoStyle.textContent = '.video-shell video{filter:brightness(.9) saturate(1) contrast(1.04)!important}.video-overlay{background:linear-gradient(90deg,rgba(5,6,7,.56) 0%,rgba(5,6,7,.38) 34%,rgba(5,6,7,.2) 58%,rgba(5,6,7,.62) 100%),linear-gradient(180deg,rgba(5,6,7,.08) 0%,rgba(5,6,7,.05) 28%,rgba(5,6,7,.72) 100%)!important}';
  document.head.appendChild(videoStyle);

  function attemptPlay(video) {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function (error) {
        console.error('AMS video play() failed', error);
      });
    }
  }

  var sharedVideoSources = document.querySelectorAll('.ams-video-source');
  if (sharedVideoSources.length && window.AMS_HERO_VIDEO_DATA) {
    sharedVideoSources.forEach(function (source) {
      source.src = window.AMS_HERO_VIDEO_DATA;
      var video = source.closest('video');
      if (video) {
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.addEventListener('loadeddata', function () {
          video.setAttribute('data-ams-video-state', 'loaded');
          attemptPlay(video);
        }, { once: true });
        video.addEventListener('canplay', function () {
          attemptPlay(video);
        }, { once: true });
        video.addEventListener('error', function () {
          video.setAttribute('data-ams-video-state', 'error');
          console.error('AMS video failed to load');
        }, { once: true });
        video.load();
        attemptPlay(video);
      }
    });
  }
})();
