/* Sunrise Estate – mailto builder
   Assembles the email address at click time so it's not sitting as plain text
   in the page source. Reduces exposure to spam scrapers. */
(function () {
  'use strict';

  function handle(el, e) {
    e.preventDefault();
    var u = el.getAttribute('data-u') || '';
    var d = el.getAttribute('data-d') || '';
    if (!u || !d) return;
    var subject = encodeURIComponent(el.getAttribute('data-s') || 'Sunrise Estate Enquiry');
    var body = encodeURIComponent('Hi Paul,\n\n');
    window.location.href = 'mailto:' + u + '@' + d + '?subject=' + subject + '&body=' + body;
  }

  function init() {
    var buttons = document.querySelectorAll('.email-btn');
    buttons.forEach(function (el) {
      el.addEventListener('click', function (e) { handle(el, e); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
