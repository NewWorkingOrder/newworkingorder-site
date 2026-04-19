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

  var heroVideoSource = document.getElementById('hero-video-source');
  var heroVideo = heroVideoSource ? heroVideoSource.closest('video') : null;
  if (heroVideoSource && heroVideo && window.AMS_HERO_VIDEO_DATA) {
    heroVideoSource.src = window.AMS_HERO_VIDEO_DATA;
    heroVideo.load();
  }

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('name');
      var email = document.getElementById('email');
      var company = document.getElementById('company');
      var message = document.getElementById('message');

      var nameValue = name ? name.value.trim() : '';
      var emailValue = email ? email.value.trim() : '';
      var companyValue = company ? company.value.trim() : '';
      var messageValue = message ? message.value.trim() : '';

      var subject = encodeURIComponent(nameValue ? 'Website inquiry from ' + nameValue : 'Website inquiry');
      var body = encodeURIComponent(
        'Name: ' + (nameValue || '-') + '\n' +
        'Email: ' + (emailValue || '-') + '\n' +
        'Company: ' + (companyValue || '-') + '\n\n' +
        'Message:\n' + (messageValue || '-') + '\n'
      );

      window.location.href = 'mailto:adam@newworkingorder.com?subject=' + subject + '&body=' + body;
    });
  }
})();
