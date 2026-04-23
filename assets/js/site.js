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

  var drawer = document.getElementById('ams-console-drawer');
  var drawerBackdrop = document.getElementById('ams-console-backdrop');
  var drawerThread = document.getElementById('ams-console-thread');
  var drawerForm = document.getElementById('ams-console-drawer-form');
  var drawerField = document.getElementById('ams-console-drawer-field');
  var launchForm = document.getElementById('ams-console-launch-form');
  var launchField = document.getElementById('ams-console-launch-field');
  var openButtons = document.querySelectorAll('[data-console-open]');
  var closeButtons = document.querySelectorAll('[data-console-close]');
  var promptButtons = document.querySelectorAll('.console-prompt');

  if (drawer && drawerBackdrop && drawerThread && drawerForm && drawerField && launchForm && launchField) {
    var cannedResponses = {
      ams: 'Applied Method Systems helps manufacturers improve technical, operational, and equipment purchasing decisions through expert-led process design built through discovery and executed through custom AI-enabled workflow apps.',
      tools: 'Publicly, AMS describes configuration and quote apps, workflow and handoff apps, shared account context tools, and department assistants or local AI tools. The point is to remove friction, compress time, and reduce errors where the work actually breaks down.',
      architecture: 'AMS uses a staged local architecture path: focused tools first, then connected workflows, then department intelligence, and shared company memory only when the operation is ready for that level of control.',
      handoffs: 'AMS focuses heavily on the moments where information degrades between sales, service, engineering, operations, and purchasing. The objective is tighter handoffs, fewer avoidable touches, and cleaner execution across departments.'
    };

    function openDrawer() {
      drawer.classList.add('is-open');
      drawerBackdrop.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('console-drawer-open');
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      drawerBackdrop.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('console-drawer-open');
    }

    function addMessage(kind, text) {
      var bubble = document.createElement('div');
      bubble.className = 'console-message console-message-' + kind;
      bubble.textContent = text;
      drawerThread.appendChild(bubble);
      drawerThread.scrollIntoView({ block: 'end' });
      drawerThread.parentElement.scrollTop = drawerThread.parentElement.scrollHeight;
    }

    function replyFor(text) {
      var normalized = text.toLowerCase();
      var compact = normalized.replace(/[^a-z0-9\s]/g, '').trim();

      if (normalized.indexOf('what does ams') !== -1 || normalized.indexOf('what do you do') !== -1 || normalized.indexOf('applied method systems') !== -1) {
        return cannedResponses.ams;
      }

      if (normalized.indexOf('tool') !== -1 || normalized.indexOf('quote') !== -1 || normalized.indexOf('configuration') !== -1) {
        return cannedResponses.tools;
      }

      if (normalized.indexOf('architecture') !== -1 || normalized.indexOf('local ai') !== -1 || normalized.indexOf('company memory') !== -1 || normalized.indexOf('department intelligence') !== -1) {
        return cannedResponses.architecture;
      }

      if (normalized.indexOf('handoff') !== -1 || normalized.indexOf('workflow') !== -1 || normalized.indexOf('friction') !== -1 || normalized.indexOf('process') !== -1) {
        return cannedResponses.handoffs;
      }

      if (normalized.indexOf('crm') !== -1 || normalized.indexOf('erp') !== -1) {
        return 'CRM and ERP can still matter as systems of record, but AMS focuses on the working layer around the process, where context, coordination, and the next move matter most.';
      }

      if (normalized.indexOf('contact') !== -1 || normalized.indexOf('email') !== -1 || normalized.indexOf('phone') !== -1) {
        return 'For a direct discussion, use the Contact page or email adam@newworkingorder.com with the workflow, friction point, or decision problem that is getting delayed or degraded.';
      }

      if (compact.length < 8) {
        return 'Try one of the prompts or ask a workflow question.';
      }

      return 'Ask about workflow, handoffs, quoting, tools, or local AI architecture.';
    }

    function handleMessage(text, directReply) {
      if (!text) return;
      openDrawer();
      addMessage('user', text);
      window.setTimeout(function () {
        addMessage('assistant', directReply || replyFor(text));
      }, 180);
    }

    openButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        openDrawer();
        window.setTimeout(function () {
          drawerField.focus();
        }, 120);
      });
    });

    closeButtons.forEach(function (button) {
      button.addEventListener('click', closeDrawer);
    });

    drawerBackdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    promptButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-console-prompt') || '';
        handleMessage(button.textContent.trim(), cannedResponses[key] || 'Ask about workflow, handoffs, quoting, tools, or local AI architecture.');
      });
    });

    launchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = launchField.value.trim();
      launchField.value = '';
      if (!value) {
        openDrawer();
        window.setTimeout(function () {
          drawerField.focus();
        }, 120);
        return;
      }
      handleMessage(value);
    });

    drawerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = drawerField.value.trim();
      drawerField.value = '';
      if (!value) return;
      handleMessage(value);
    });
  }
})();
