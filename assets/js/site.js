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
  videoStyle.textContent = '.video-shell video{filter:brightness(.82) saturate(.96) contrast(1.04)!important}.video-overlay{background:linear-gradient(90deg,rgba(5,6,7,.68) 0%,rgba(5,6,7,.52) 34%,rgba(5,6,7,.32) 58%,rgba(5,6,7,.72) 100%),linear-gradient(180deg,rgba(5,6,7,.12) 0%,rgba(5,6,7,.08) 28%,rgba(5,6,7,.78) 100%)!important}';
  document.head.appendChild(videoStyle);

  var sharedVideoSources = document.querySelectorAll('.ams-video-source');
  if (sharedVideoSources.length && window.AMS_HERO_VIDEO_DATA) {
    sharedVideoSources.forEach(function (source) {
      source.src = window.AMS_HERO_VIDEO_DATA;
      var video = source.closest('video');
      if (video) {
        video.addEventListener('loadeddata', function () {
          video.setAttribute('data-ams-video-state', 'loaded');
        }, { once: true });
        video.addEventListener('error', function () {
          video.setAttribute('data-ams-video-state', 'error');
          console.error('AMS video failed to load');
        }, { once: true });
        video.load();
      }
    });
  }
})();
