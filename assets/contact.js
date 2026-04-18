/* Sunrise Estate – email reveal + mailto builder
   Assembles the email address at click time (so it's not sitting as plain text
   in the page source) and shows a small modal with three options:
     1. Copy email address
     2. Open in default mail app (mailto:)
     3. Open Gmail compose in a new tab
   This avoids the "Gmail sign-in loop" trap that happens on desktop Chrome
   when mailto: is routed to Gmail but no session exists (e.g. Incognito). */
(function () {
  'use strict';

  var MODAL_ID = 'se-email-modal';

  function buildAddress(el) {
    var u = el.getAttribute('data-u') || '';
    var d = el.getAttribute('data-d') || '';
    if (!u || !d) return '';
    return u + '@' + d;
  }

  function buildSubject(el) {
    return el.getAttribute('data-s') || 'Sunrise Estate Enquiry';
  }

  function removeModal() {
    var existing = document.getElementById(MODAL_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    document.removeEventListener('keydown', onEscape);
  }

  function onEscape(e) {
    if (e.key === 'Escape' || e.keyCode === 27) removeModal();
  }

  function copyToClipboard(text, btn) {
    var done = function () {
      var original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.setAttribute('aria-live', 'polite');
      setTimeout(function () { btn.textContent = original; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch (err) { /* no-op */ }
  }

  function openModal(email, subject) {
    removeModal();

    var overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'se-email-modal-title');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(30,20,10,0.65);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Inter,system-ui,sans-serif;';

    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:16px;max-width:440px;width:100%;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);position:relative;';

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:14px;background:none;border:none;font-size:28px;line-height:1;color:#92400e;cursor:pointer;padding:4px 10px;';
    closeBtn.addEventListener('click', removeModal);

    var title = document.createElement('h3');
    title.id = 'se-email-modal-title';
    title.textContent = 'Email Sunrise Estate';
    title.style.cssText = 'font-family:"Playfair Display",Georgia,serif;font-size:24px;font-weight:700;color:#78350f;margin:0 0 6px 0;';

    var sub = document.createElement('p');
    sub.textContent = 'Get in touch — choose whichever option is easiest for you:';
    sub.style.cssText = 'color:#57534e;margin:0 0 18px 0;font-size:14px;line-height:1.5;';

    var emailRow = document.createElement('div');
    emailRow.style.cssText = 'background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap;';

    var emailText = document.createElement('span');
    emailText.textContent = email;
    emailText.style.cssText = 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;color:#78350f;word-break:break-all;';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy';
    copyBtn.style.cssText = 'background:#d97706;color:#fff;border:none;border-radius:6px;padding:6px 14px;font-weight:600;font-size:14px;cursor:pointer;';
    copyBtn.addEventListener('click', function () { copyToClipboard(email, copyBtn); });

    emailRow.appendChild(emailText);
    emailRow.appendChild(copyBtn);

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:6px;';

    var mailtoLink = document.createElement('a');
    mailtoLink.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent('Hi Paul,\n\n');
    mailtoLink.textContent = 'Open in my mail app';
    mailtoLink.style.cssText = 'display:block;text-align:center;background:#78350f;color:#fff;text-decoration:none;padding:11px 16px;border-radius:8px;font-weight:600;font-size:15px;';

    var gmailLink = document.createElement('a');
    gmailLink.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent('Hi Paul,\n\n');
    gmailLink.target = '_blank';
    gmailLink.rel = 'noopener noreferrer';
    gmailLink.textContent = 'Open in Gmail (web)';
    gmailLink.style.cssText = 'display:block;text-align:center;background:#fff;color:#78350f;border:1.5px solid #d97706;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;font-size:15px;';

    actions.appendChild(mailtoLink);
    actions.appendChild(gmailLink);

    var hint = document.createElement('p');
    hint.textContent = 'If "Open in my mail app" doesn\'t work, just copy the address above.';
    hint.style.cssText = 'color:#78716c;margin:14px 0 0 0;font-size:12px;line-height:1.5;text-align:center;';

    box.appendChild(closeBtn);
    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(emailRow);
    box.appendChild(actions);
    box.appendChild(hint);
    overlay.appendChild(box);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) removeModal();
    });

    document.body.appendChild(overlay);
    document.addEventListener('keydown', onEscape);
    setTimeout(function () { copyBtn.focus(); }, 0);
  }

  function handle(el, e) {
    e.preventDefault();
    var email = buildAddress(el);
    if (!email) return;
    openModal(email, buildSubject(el));
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
