(function () {
  'use strict';

  const form = document.getElementById('deepotsav-registration-form');
  if (!form) return;

  const page = document.querySelector('.deepotsav-page');
  const paidAttendees = document.getElementById('paid-attendees');
  const estimatedFee = document.getElementById('estimated-fee');
  const feeRateNote = document.getElementById('fee-rate-note');
  const mobileWrap = document.getElementById('mobile-wrap');
  const mobileInput = mobileWrap.querySelector('input');
  const performanceWrap = document.getElementById('performance-description-wrap');
  const performanceDescription = performanceWrap.querySelector('textarea');
  const status = document.getElementById('form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const submissionToken = document.getElementById('submission-token');
  let responseFrame;
  let submissionInProgress = false;
  let submissionTimeout;
  let responseLoadTimeout;

  function formatWon(value) {
    return new Intl.NumberFormat('en-US').format(value) + ' KRW';
  }

  function updateFee() {
    const count = Number(paidAttendees.value || 0);
    const cutoff = new Date(page.dataset.earlyBirdDeadline);
    const earlyBird = new Date() <= cutoff;
    const rate = earlyBird ? 10000 : 12000;

    estimatedFee.textContent = count ? formatWon(count * rate) : 'Select attendee count';
    feeRateNote.textContent = count
      ? `${formatWon(rate)} per paid attendee (${earlyBird ? 'early-bird rate' : 'regular rate'})`
      : '';
  }

  function hasChecked(name) {
    return Boolean(form.querySelector(`input[name="${name}"]:checked`));
  }

  function selectedValue(name) {
    const input = form.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : '';
  }

  function updateConditionalFields() {
    const hasPerformance = hasChecked('performance');
    const hasVolunteerRole = hasChecked('volunteerRoles');
    const needsContact = hasPerformance || hasVolunteerRole ||
      selectedValue('fashionShow') === 'Yes' || selectedValue('communityMela') === 'Yes';

    performanceWrap.hidden = !hasPerformance;
    performanceDescription.required = hasPerformance;
    mobileWrap.hidden = !needsContact;
    mobileInput.required = needsContact;
    if (!needsContact) mobileInput.value = '';
  }

  function showStatus(message, state) {
    status.className = `deepotsav-status is-${state}`;
    status.textContent = message;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function validateForm() {
    updateConditionalFields();
    const controls = form.querySelectorAll('input, select, textarea');
    controls.forEach((control) => control.removeAttribute('aria-invalid'));

    if (form.checkValidity()) return true;

    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) {
      firstInvalid.setAttribute('aria-invalid', 'true');
      firstInvalid.focus();
    }
    showStatus('Please complete the required fields before submitting.', 'error');
    return false;
  }

  function completeSubmittedRequest() {
    if (!submissionInProgress) return;

    window.clearTimeout(submissionTimeout);
    window.clearTimeout(responseLoadTimeout);
    submissionInProgress = false;
    submitButton.disabled = false;
    form.removeAttribute('target');
    if (responseFrame) responseFrame.remove();
    responseFrame = null;
    showStatus('Registration request processed. Please check your email for the reference number. If no email arrives within a few minutes, contact ISRK.', 'success');
    form.reset();
    updateFee();
    updateConditionalFields();
  }

  function createResponseFrame() {
    if (responseFrame) responseFrame.remove();

    responseFrame = document.createElement('iframe');
    responseFrame.name = `deepotsav-response-${Date.now()}`;
    responseFrame.title = 'Registration response';
    responseFrame.hidden = true;
    responseFrame.addEventListener('load', function () {
      if (!submissionInProgress) return;

      try {
        if (responseFrame.contentWindow.location.href === 'about:blank') return;
      } catch (error) {
        // The Apps Script response is cross-origin, which confirms the real request loaded.
      }

      window.clearTimeout(responseLoadTimeout);
      responseLoadTimeout = window.setTimeout(completeSubmittedRequest, 1200);
    });
    document.body.appendChild(responseFrame);
    form.target = responseFrame.name;
  }

  paidAttendees.addEventListener('change', updateFee);
  form.addEventListener('change', updateConditionalFields);
  updateFee();
  updateConditionalFields();

  form.addEventListener('submit', function (event) {
    if (!validateForm()) {
      event.preventDefault();
      return;
    }

    if (form.action.includes('REPLACE_WITH_DEPLOYMENT_ID')) {
      event.preventDefault();
      showStatus('The form design is ready, but the private Apps Script endpoint has not been connected yet.', 'error');
      return;
    }

    submissionToken.value = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    createResponseFrame();
    submissionInProgress = true;
    submitButton.disabled = true;
    showStatus('Submitting your test registration...', 'working');

    window.clearTimeout(submissionTimeout);
    submissionTimeout = window.setTimeout(function () {
      if (!submissionInProgress) return;

      completeSubmittedRequest();
    }, 20000);
  });

  window.addEventListener('message', function (event) {
    const allowedOrigin = event.origin === 'null' ||
      event.origin === 'https://script.google.com' ||
      event.origin.endsWith('.googleusercontent.com');
    if (!allowedOrigin || !submissionInProgress || !event.data || event.data.type !== 'deepotsav-registration') return;

    window.clearTimeout(submissionTimeout);
    window.clearTimeout(responseLoadTimeout);
    submissionInProgress = false;
    submitButton.disabled = false;
    form.removeAttribute('target');
    if (responseFrame) responseFrame.remove();
    responseFrame = null;

    if (event.data.status === 'success') {
      showStatus(event.data.message || 'Registration received. Please check your email.', 'success');
      form.reset();
      updateFee();
      updateConditionalFields();
      return;
    }

    showStatus(event.data.message || 'The registration could not be submitted. Please try again.', 'error');
  });
})();
