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
  var liveConsoleEndpoint = 'https://console-api.newworkingorder.com/chat';

  if (drawer && drawerBackdrop && drawerThread && drawerForm && drawerField && launchForm && launchField) {
    var cannedResponses = {
      ams: 'Applied Method Systems helps manufacturers improve technical, operational, and equipment purchasing decisions through expert-led process improvement, workflow design, local AI systems, and specialized tools designed to support business needs.',
      tools: 'AMS builds specialized tools for quoting, configuration, handoffs, coordination, and other parts of the business that need better support. Depending on the situation, AMS may also build local AI support, connected workflows, or broader shared-context systems.',
      architecture: 'AMS can start with a specialized tool, a workflow problem, department support, local AI integration, or a broader shared-context build. More than one layer can be implemented at the same time.',
      handoffs: 'AMS focuses heavily on the points where information weakens between sales, service, engineering, operations, and purchasing. The goal is tighter handoffs, better support, and stronger execution across departments.'
    };

    var formButtons = [];
    var drawerSubmit = drawerForm.querySelector('button[type="submit"]');
    var launchSubmit = launchForm.querySelector('button[type="submit"]');
    if (drawerSubmit) formButtons.push(drawerSubmit);
    if (launchSubmit) formButtons.push(launchSubmit);

    function scrollThreadToBottom() {
      drawerThread.scrollIntoView({ block: 'end' });
      drawerThread.parentElement.scrollTop = drawerThread.parentElement.scrollHeight;
    }

    function setConsoleBusy(isBusy) {
      drawerField.disabled = isBusy;
      launchField.disabled = isBusy;
      formButtons.forEach(function (button) {
        button.disabled = isBusy;
      });
    }

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
      scrollThreadToBottom();
    }

    function addLoadingMessage() {
      var bubble = document.createElement('div');
      var dots = 0;
      bubble.className = 'console-message console-message-assistant console-message-loading';
      bubble.setAttribute('role', 'status');
      bubble.setAttribute('aria-live', 'polite');
      bubble.style.opacity = '0.92';
      bubble.textContent = 'AMS Console is thinking';
      drawerThread.appendChild(bubble);
      scrollThreadToBottom();

      var timer = window.setInterval(function () {
        dots = (dots + 1) % 4;
        bubble.textContent = 'AMS Console is thinking' + '.'.repeat(dots);
        scrollThreadToBottom();
      }, 350);

      return { bubble: bubble, timer: timer };
    }

    function removeLoadingMessage(loadingState) {
      if (!loadingState) return;
      window.clearInterval(loadingState.timer);
      if (loadingState.bubble && loadingState.bubble.parentNode) {
        loadingState.bubble.parentNode.removeChild(loadingState.bubble);
      }
    }

    function fallbackReply(text) {
      var normalized = text.toLowerCase();
      var compact = normalized.replace(/[^a-z0-9\s]/g, '').trim();

      if (normalized.indexOf('what does ams') !== -1 || normalized.indexOf('what do you do') !== -1 || normalized.indexOf('applied method systems') !== -1) {
        return cannedResponses.ams;
      }

      if (normalized.indexOf('tool') !== -1 || normalized.indexOf('quote') !== -1 || normalized.indexOf('configuration') !== -1) {
        return cannedResponses.tools;
      }

      if (normalized.indexOf('architecture') !== -1 || normalized.indexOf('local ai') !== -1 || normalized.indexOf('company memory') !== -1 || normalized.indexOf('department support') !== -1) {
        return cannedResponses.architecture;
      }

      if (normalized.indexOf('handoff') !== -1 || normalized.indexOf('workflow') !== -1 || normalized.indexOf('process') !== -1) {
        return cannedResponses.handoffs;
      }

      if (normalized.indexOf('crm') !== -1 || normalized.indexOf('erp') !== -1) {
        return 'AMS does not replace CRM or ERP. Those systems may still matter as systems of record, but AMS focuses on the working layer around the process.';
      }

      if (normalized.indexOf('contact') !== -1 || normalized.indexOf('email') !== -1 || normalized.indexOf('phone') !== -1) {
        return 'For a direct discussion, use the Contact page or email adam@newworkingorder.com with the workflow, support gap, or decision problem that is getting delayed or weakened.';
      }

      if (compact.length < 8) {
        return 'Try one of the prompts or ask a workflow question.';
      }

      return 'Ask about workflow, handoffs, quoting, tools, or local AI architecture.';
    }

    async function fetchLiveReply(text) {
      if (!liveConsoleEndpoint) {
        return fallbackReply(text);
      }

      try {
        var response = await fetch(liveConsoleEndpoint, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        var raw = await response.text();

        if (!response.ok) {
          throw new Error(raw || 'AMS Console backend unavailable');
        }

        if (!raw) {
          throw new Error('Empty response');
        }

        try {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed.reply === 'string' && parsed.reply.trim()) {
            return parsed.reply.trim();
          }
          if (parsed && typeof parsed.message === 'string' && parsed.message.trim()) {
            return parsed.message.trim();
          }
        } catch (error) {
          return raw.trim();
        }

        throw new Error('Invalid response payload');
      } catch (error) {
        return fallbackReply(text);
      }
    }

    async function handleMessage(text, directReply) {
      if (!text) return;
      openDrawer();
      addMessage('user', text);

      var loadingState = null;
      if (!directReply) {
        setConsoleBusy(true);
        loadingState = addLoadingMessage();
      }

      try {
        var reply = directReply || await fetchLiveReply(text);
        removeLoadingMessage(loadingState);
        addMessage('assistant', reply);
      } finally {
        removeLoadingMessage(loadingState);
        setConsoleBusy(false);
        drawerField.focus();
      }
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
        handleMessage(button.textContent.trim());
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