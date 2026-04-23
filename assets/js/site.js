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

  var consoleWindow = document.querySelector('[data-console-window]');
  var consoleOutput = document.getElementById('ams-console-output');
  var consoleForm = document.getElementById('ams-console-form');
  var consoleField = document.getElementById('ams-console-field');
  var promptButtons = document.querySelectorAll('.console-prompt');

  if (consoleWindow && consoleOutput && consoleForm && consoleField) {
    var cannedResponses = {
      ams: 'Applied Method Systems helps manufacturers improve technical, operational, and equipment purchasing decisions through expert-led process design built through discovery and executed through custom AI-enabled workflow apps.',
      tools: 'Publicly, AMS describes configuration and quote apps, workflow and handoff apps, shared account context tools, and department assistants or local AI tools. The point is to remove friction, compress time, and reduce errors where the work actually breaks down.',
      architecture: 'AMS uses a staged local architecture path: focused tools first, then connected workflows, then department intelligence, and shared company memory only when the operation is ready for that level of control.',
      handoffs: 'AMS focuses heavily on the moments where information degrades between sales, service, engineering, operations, and purchasing. The objective is tighter handoffs, fewer avoidable touches, and cleaner execution across departments.'
    };

    function clearTranscript() {
      consoleOutput.innerHTML = '';
      consoleOutput.scrollTop = 0;
    }

    function addMessage(kind, label, text) {
      var wrapper = document.createElement('div');
      wrapper.className = 'console-message console-message-' + kind;

      var role = document.createElement('div');
      role.className = 'console-role';
      role.textContent = label;

      var body = document.createElement('p');
      body.textContent = text;

      wrapper.appendChild(role);
      wrapper.appendChild(body);
      consoleOutput.appendChild(wrapper);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
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
        return 'Try one of the prompts below.';
      }

      return 'Ask about workflow, handoffs, quoting, tools, or local AI architecture.';
    }

    function respond(userText, directReply) {
      clearTranscript();
      addMessage('user', 'You', userText);
      window.setTimeout(function () {
        addMessage('assistant', 'AMS Console', directReply || replyFor(userText));
      }, 180);
    }

    promptButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-console-prompt') || '';
        var label = button.textContent.trim();
        respond(label, cannedResponses[key] || replyFor(label));
      });
    });

    consoleForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = consoleField.value.trim();
      if (!value) return;
      consoleField.value = '';
      respond(value);
    });
  }
})();
