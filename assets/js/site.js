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

  var sharedVideoSources = document.querySelectorAll('.ams-video-source');
  if (sharedVideoSources.length && window.AMS_HERO_VIDEO_DATA) {
    sharedVideoSources.forEach(function (source) {
      source.src = window.AMS_HERO_VIDEO_DATA;
      var video = source.closest('video');
      if (video) {
        video.load();
      }
    });
  }
})();
