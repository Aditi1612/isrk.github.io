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
  const performanceWrap = document.getElementById('performance-options-wrap');
  const performanceOptions = document.getElementById('performance-options');
  const performanceDescription = performanceWrap.querySelector('textarea');
  const performanceSampleUrl = performanceWrap.querySelector('input[name="performanceSampleUrl"]');
  const volunteerWrap = document.getElementById('volunteer-options-wrap');
  const volunteerOptions = document.getElementById('volunteer-options');
  const fashionWrap = document.getElementById('fashion-description-wrap');
  const fashionDescription = fashionWrap.querySelector('textarea');
  const status = document.getElementById('form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const submissionToken = document.getElementById('submission-token');
  const formGuard = form.elements.form_guard_7x;
  let responseFrame;
  let submissionInProgress = false;
  let submissionTimeout;

  function startCountdown() {
    const eventStart = new Date(page.dataset.eventStart);
    const days = document.getElementById('countdown-days');
    const hours = document.getElementById('countdown-hours');
    const minutes = document.getElementById('countdown-minutes');
    const seconds = document.getElementById('countdown-seconds');
    const countdownStatus = document.getElementById('countdown-status');
    const countdownEyebrow = document.querySelector('.deepotsav-countdown__eyebrow');

    if (!Number.isFinite(eventStart.getTime()) || !days || !hours || !minutes || !seconds) return;

    function updateCountdown() {
      const remaining = eventStart.getTime() - Date.now();
      if (remaining <= 0) {
        days.textContent = '00';
        hours.textContent = '00';
        minutes.textContent = '00';
        seconds.textContent = '00';
        countdownEyebrow.textContent = 'The Deepotsav celebration is here';
        countdownStatus.textContent = 'Deepotsav 2026 has begun.';
        return false;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      days.textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
      hours.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0');
      minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      seconds.textContent = String(totalSeconds % 60).padStart(2, '0');
      countdownStatus.textContent = `${days.textContent} days, ${hours.textContent} hours, ${minutes.textContent} minutes until Deepotsav 2026.`;
      return true;
    }

    updateCountdown();
    const countdownTimer = window.setInterval(function () {
      if (!updateCountdown()) window.clearInterval(countdownTimer);
    }, 1000);
  }

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

  function clearChecked(name) {
    form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = false;
    });
  }

  function updateConditionalFields() {
    const wantsPerformance = selectedValue('performanceInterest') === 'Yes';
    const wantsVolunteerRole = selectedValue('volunteerInterest') === 'Yes';
    const wantsFashionShow = selectedValue('fashionShow') === 'Yes';
    const needsContact = wantsPerformance || wantsVolunteerRole || wantsFashionShow ||
      selectedValue('communityMela') === 'Yes';

    performanceWrap.hidden = !wantsPerformance;
    performanceDescription.required = wantsPerformance;
    performanceSampleUrl.required = wantsPerformance;
    if (!wantsPerformance) {
      clearChecked('performance');
      performanceDescription.value = '';
      performanceSampleUrl.value = '';
    }

    volunteerWrap.hidden = !wantsVolunteerRole;
    if (!wantsVolunteerRole) clearChecked('volunteerRoles');

    fashionWrap.hidden = !wantsFashionShow;
    fashionDescription.required = wantsFashionShow;
    if (!wantsFashionShow) fashionDescription.value = '';

    mobileWrap.hidden = !needsContact;
    mobileInput.required = needsContact;
    if (!needsContact) mobileInput.value = '';
  }

  function formatMobileNumber() {
    const digits = mobileInput.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) {
      mobileInput.value = digits;
      return;
    }
    if (digits.length <= 7) {
      mobileInput.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return;
    }
    mobileInput.value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function isValidPerformanceUrl(value) {
    // Loose sanity check only: must be a well-formed http(s) URL. We don't
    // restrict to a fixed set of platforms -- the ISRK team reviews
    // submitted links manually and follows up with the submitter if a link
    // turns out to be invalid or inaccessible.
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  function showStatus(message, state) {
    status.className = `deepotsav-status is-${state}`;
    status.textContent = message;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function validateForm() {
    updateConditionalFields();
    performanceSampleUrl.setCustomValidity('');
    if (selectedValue('performanceInterest') === 'Yes' && performanceSampleUrl.value &&
        !isValidPerformanceUrl(performanceSampleUrl.value)) {
      performanceSampleUrl.setCustomValidity('Please provide a valid link (starting with http:// or https://) to your performance sample.');
    }
    const controls = form.querySelectorAll('input, select, textarea');
    controls.forEach((control) => control.removeAttribute('aria-invalid'));
    form.querySelectorAll('.deepotsav-options.is-invalid').forEach((group) => group.classList.remove('is-invalid'));
    form.querySelectorAll('.deepotsav-question.is-invalid').forEach((question) => question.classList.remove('is-invalid'));

    const customInvalid = [];
    if (selectedValue('performanceInterest') === 'Yes' && !hasChecked('performance')) {
      performanceOptions.classList.add('is-invalid');
      customInvalid.push(performanceOptions.querySelector('input'));
    }
    if (selectedValue('volunteerInterest') === 'Yes' && !hasChecked('volunteerRoles')) {
      volunteerOptions.classList.add('is-invalid');
      customInvalid.push(volunteerOptions.querySelector('input'));
    }

    const invalidControls = Array.from(form.querySelectorAll(':invalid'));
    invalidControls.forEach((control) => {
      control.setAttribute('aria-invalid', 'true');
      const question = control.closest('.deepotsav-question');
      if (question) question.classList.add('is-invalid');
    });
    customInvalid.forEach((control) => control.setAttribute('aria-invalid', 'true'));

    if (invalidControls.length === 0 && customInvalid.length === 0) return true;

    const firstInvalid = invalidControls[0] || customInvalid[0];
    if (firstInvalid) {
      firstInvalid.focus();
    }
    showStatus('Please complete the required fields before submitting.', 'error');
    return false;
  }

  function finishSubmission() {
    window.clearTimeout(submissionTimeout);
    submissionInProgress = false;
    submitButton.disabled = false;
    form.removeAttribute('target');
    if (responseFrame) responseFrame.remove();
    responseFrame = null;
  }

  function createResponseFrame() {
    if (responseFrame) responseFrame.remove();

    responseFrame = document.createElement('iframe');
    responseFrame.name = `deepotsav-response-${Date.now()}`;
    responseFrame.title = 'Registration response';
    responseFrame.hidden = true;
    document.body.appendChild(responseFrame);
    form.target = responseFrame.name;
  }

  paidAttendees.addEventListener('change', updateFee);
  mobileInput.addEventListener('input', formatMobileNumber);
  performanceSampleUrl.addEventListener('input', function () {
    performanceSampleUrl.setCustomValidity('');
  });
  form.addEventListener('change', updateConditionalFields);
  startCountdown();
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

    if (formGuard) formGuard.value = '';
    if (!submissionToken.value) {
      submissionToken.value = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }
    createResponseFrame();
    submissionInProgress = true;
    submitButton.disabled = true;
    showStatus('Submitting your test registration...', 'working');

    window.clearTimeout(submissionTimeout);
    submissionTimeout = window.setTimeout(function () {
      if (!submissionInProgress) return;

      finishSubmission();
      showStatus('Your form has been successfully submitted. Please check your email in the next few minutes. If you do not receive a confirmation email, please contact the ISRK team.', 'success');
      form.reset();
      updateFee();
      updateConditionalFields();
    }, 20000);
  });

  window.addEventListener('message', function (event) {
    const allowedOrigin = event.origin === 'null' ||
      event.origin === 'https://script.google.com' ||
      event.origin.endsWith('.googleusercontent.com');
    if (!allowedOrigin || !submissionInProgress || !event.data || event.data.type !== 'deepotsav-registration') return;

    finishSubmission();

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
