const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1DByGp1ZMU30G0OVgK_pf4l0_6UeO-us2xahQUeznaUw',
  SHEET_NAME: 'Registrations',
  EVENT_NAME: 'Deepotsav 2026',
  EVENT_DATE: 'Saturday, November 7, 2026',
  EVENT_TIME: '2:00 PM onwards',
  VENUE: 'Auditorium at the Mokdong Youth Center',
  ADDRESS_EN: '143, Mokdongseo-ro, Yangcheon-gu, Seoul',
  ADDRESS_KO: '서울특별시 양천구 목동서로 143',
  REGISTRATION_CLOSE: new Date('2026-11-02T23:59:59+09:00'),
  EARLY_BIRD_CLOSE: new Date('2026-10-25T23:59:59+09:00'),
  EARLY_BIRD_FEE: 10000,
  REGULAR_FEE: 12000,
  CAPACITY: 350,
  BANK_NAME: 'Woori Bank',
  BANK_ACCOUNT: '1005-104-804620',
  BANK_HOLDER: '주한 인도 유학생 / Indian Students and R***',
  CONTACT_LINE: 'Iqbal Khazi: 010-9544-0786 | Dilip Patil: 010-7471-9016 | Pravin Upare: 010-7633-8112 | Manas Biswal: 010-9807-0763',
  REPLY_TO: 'isrk.association@gmail.com',
  LOGO_FILE_ID: '1sFH5OAzQlhB3R9cdybzQDSju0Tf6gmhy',
  TEST_MODE: false,
  TEST_RECIPIENTS: ['mrbiswal13@gmail.com', 'cometomanas@gmail.com']
});

const HEADERS = Object.freeze([
  'Timestamp', 'Registration ID', 'Email', 'Full Name', 'University/Company', 'City',
  'Nationality', 'Bank Transfer Name', 'Paid Attendees (Age 5+)', 'Children Under 5',
  'Total Attendees', 'Fee Per Paid Attendee (KRW)', 'Expected Amount (KRW)',
  'Performance Interests', 'Performance Description', 'Fashion Show', 'Fashion Show Description', 'Volunteer Roles',
  'Community Mela', 'Kids Activity', 'Mobile Number', 'Suggestions',
  'ISRK Representative Team', 'Agreement Accepted', 'Payment Status', 'Paid Amount (KRW)',
  'Payment Verified By', 'Payment Verified At', 'Registration Email Status',
  'Registration Email Sent At', 'Payment Email Status', 'Payment Email Sent At',
  'Internal Notes', 'Submission Source', 'Submission Token'
]);

function doGet() {
  return responsePage_('success', 'Deepotsav 2026 registration service is active.');
}

function doPost(e) {
  let sheet;
  let rowNumber;
  try {
    const payload = normalizePayload_(e);
    validatePayload_(payload);

    const now = new Date();
    if (now > CONFIG.REGISTRATION_CLOSE) {
      throw new Error('Registration closed on November 2, 2026.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      sheet = getRegistrationSheet_();
      assertHeaders_(sheet);
      const existingRegistrationId = registrationIdForSubmissionToken_(sheet, payload.submissionToken);
      if (existingRegistrationId) {
        return responsePage_('success', `Registration already received. Reference: ${existingRegistrationId}`);
      }
      const totalAttendees = payload.paidAttendees + payload.childrenUnderFive;
      if (activeAttendanceCount_(sheet) + totalAttendees > CONFIG.CAPACITY) {
        throw new Error('Registration capacity has been reached. Please contact the ISRK team.');
      }

      const registrationId = nextRegistrationId_(sheet);
      const feePerAttendee = now <= CONFIG.EARLY_BIRD_CLOSE ? CONFIG.EARLY_BIRD_FEE : CONFIG.REGULAR_FEE;
      const expectedAmount = payload.paidAttendees * feePerAttendee;

      const record = {
        timestamp: now,
        registrationId: registrationId,
        email: payload.email,
        fullName: payload.fullName,
        organization: payload.organization,
        city: payload.city,
        nationality: payload.nationality,
        bankAccountName: payload.bankAccountName,
        paidAttendees: payload.paidAttendees,
        childrenUnderFive: payload.childrenUnderFive,
        totalAttendees: totalAttendees,
        feePerAttendee: feePerAttendee,
        expectedAmount: expectedAmount,
        performance: payload.performance.join(', '),
        performanceDescription: payload.performanceDescription,
        fashionShow: payload.fashionShow,
        fashionDescription: payload.fashionDescription,
        volunteerRoles: payload.volunteerRoles.join(', '),
        communityMela: payload.communityMela,
        kidsActivity: payload.kidsActivity,
        mobile: payload.mobile,
        suggestions: payload.suggestions,
        isrkRepresentative: payload.isrkRepresentative,
        agreement: payload.agreement,
        submissionSource: payload.submissionSource,
        submissionToken: payload.submissionToken
      };

      const row = [
        record.timestamp, record.registrationId, record.email, record.fullName, record.organization,
        record.city, record.nationality, record.bankAccountName, record.paidAttendees,
        record.childrenUnderFive, record.totalAttendees, record.feePerAttendee,
        record.expectedAmount, record.performance, record.performanceDescription, record.fashionShow,
        record.fashionDescription, record.volunteerRoles, record.communityMela, record.kidsActivity, record.mobile,
        record.suggestions, record.isrkRepresentative, record.agreement, 'Pending', '', '', '',
        'SENDING', '', '', '', '', record.submissionSource, record.submissionToken
      ];
      if (row.length !== HEADERS.length) throw new Error('Registration row does not match the sheet schema.');
      sheet.appendRow(row);
      rowNumber = sheet.getLastRow();
      SpreadsheetApp.flush();
      try {
        sendRegistrationEmail_(record);
        setCellsByHeader_(sheet, rowNumber, {
          'Registration Email Status': 'SENT',
          'Registration Email Sent At': new Date()
        });
      } catch (emailError) {
        setCellsByHeader_(sheet, rowNumber, {
          'Registration Email Status': 'ERROR',
          'Internal Notes': safeErrorMessage_(emailError)
        });
        console.error(emailError);
        return responsePage_('success', 'Registration received. The acknowledgement email is pending and the ISRK team has been notified in the registration sheet.');
      }
    } finally {
      lock.releaseLock();
    }

    return responsePage_('success', 'Registration received. Your reference number has been sent by email.');
  } catch (error) {
    if (sheet && rowNumber) {
      setCellsByHeader_(sheet, rowNumber, {
        'Registration Email Status': 'ERROR',
        'Internal Notes': safeErrorMessage_(error)
      });
    }
    console.error(error);
    return responsePage_('error', safeErrorMessage_(error));
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Deepotsav 2026')
    .addItem('Set up automation', 'setupProject')
    .addItem('Send/retry registration acknowledgement', 'sendRegistrationForSelectedRow')
    .addItem('Send/retry payment confirmation', 'sendPaymentConfirmationForSelectedRow')
    .addToUi();
}

function setupProject() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error(`Sheet not found: ${CONFIG.SHEET_NAME}`);
  assertHeaders_(sheet);

  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'handlePaymentStatusEdit')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('handlePaymentStatusEdit')
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();

  PropertiesService.getScriptProperties().setProperty('REGISTRATION_COUNTER', String(maxRegistrationNumber_(sheet)));
  console.log('Deepotsav automation is ready. Payment confirmation will send when Payment Status changes to Paid.');
}

function handlePaymentStatusEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.SHEET_NAME || e.range.getRow() < 2) return;

  const columns = headerMap_(sheet);
  const statusColumn = columns['Payment Status'];
  if (e.range.getColumn() > statusColumn || e.range.getLastColumn() < statusColumn) return;

  for (let row = e.range.getRow(); row <= e.range.getLastRow(); row += 1) {
    if (String(sheet.getRange(row, statusColumn).getValue()).trim() === 'Paid') {
      sendPaymentForRow_(sheet, row, false);
    }
  }
}

function sendPaymentConfirmationForSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  if (sheet.getName() !== CONFIG.SHEET_NAME || row < 2) {
    SpreadsheetApp.getUi().alert('Select a registration row in the Registrations sheet.');
    return;
  }
  sendPaymentForRow_(sheet, row, true);
  SpreadsheetApp.getUi().alert('Payment confirmation processed for the selected row.');
}

function sendRegistrationForSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  if (sheet.getName() !== CONFIG.SHEET_NAME || row < 2) {
    SpreadsheetApp.getUi().alert('Select a registration row in the Registrations sheet.');
    return;
  }

  const values = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const source = rowObject_(values);
  if (source['Registration Email Status'] === 'SENT' && source['Registration Email Sent At']) {
    SpreadsheetApp.getUi().alert('The registration acknowledgement has already been sent.');
    return;
  }

  const record = {
    registrationId: source['Registration ID'],
    email: source.Email,
    fullName: source['Full Name'],
    paidAttendees: source['Paid Attendees (Age 5+)'],
    childrenUnderFive: source['Children Under 5'],
    feePerAttendee: source['Fee Per Paid Attendee (KRW)'],
    expectedAmount: source['Expected Amount (KRW)']
  };
  enforceTestRecipient_(record.email);
  setCellsByHeader_(sheet, row, { 'Registration Email Status': 'SENDING' });

  try {
    sendRegistrationEmail_(record);
    setCellsByHeader_(sheet, row, {
      'Registration Email Status': 'SENT',
      'Registration Email Sent At': new Date()
    });
    SpreadsheetApp.getUi().alert('Registration acknowledgement sent.');
  } catch (error) {
    setCellsByHeader_(sheet, row, {
      'Registration Email Status': 'ERROR',
      'Internal Notes': safeErrorMessage_(error)
    });
    throw error;
  }
}

function sendPaymentForRow_(sheet, row, forceRetry) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const columns = headerMap_(sheet);
    const values = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
    const record = rowObject_(values);

    if (record['Payment Status'] !== 'Paid') {
      throw new Error('Payment Status must be Paid before sending confirmation.');
    }
    if (!forceRetry && (record['Payment Email Status'] === 'SENT' || record['Payment Email Status'] === 'SENDING')) return;

    enforceTestRecipient_(record.Email);
    const isResend = forceRetry && record['Payment Email Status'] === 'SENT';
    const verifier = Session.getActiveUser().getEmail() || 'ISRK organizer';
    const paidAmount = record['Paid Amount (KRW)'] || record['Expected Amount (KRW)'];

    setCellsByHeader_(sheet, row, {
      'Paid Amount (KRW)': paidAmount,
      'Payment Verified By': record['Payment Verified By'] || verifier,
      'Payment Verified At': record['Payment Verified At'] || new Date(),
      'Payment Email Status': 'SENDING'
    });
    SpreadsheetApp.flush();

    try {
      sendPaymentEmail_({
        registrationId: record['Registration ID'],
        email: record.Email,
        fullName: record['Full Name'],
        paidAttendees: record['Paid Attendees (Age 5+)'],
        childrenUnderFive: record['Children Under 5'],
        paidAmount: paidAmount,
        isResend: isResend
      });
      setCellsByHeader_(sheet, row, {
        'Payment Email Status': 'SENT',
        'Payment Email Sent At': new Date()
      });
    } catch (error) {
      setCellsByHeader_(sheet, row, {
        'Payment Email Status': 'ERROR',
        'Internal Notes': safeErrorMessage_(error)
      });
      throw error;
    }
  } finally {
    lock.releaseLock();
  }
}

function normalizePayload_(e) {
  const parameters = e && e.parameters ? e.parameters : {};
  const first = (name) => String((parameters[name] || [''])[0]).trim();
  const all = (name) => (parameters[name] || []).map((value) => String(value).trim()).filter(Boolean);

  return {
    formGuard: first('form_guard_7x'),
    email: first('email').toLowerCase(),
    fullName: first('fullName'),
    organization: first('organization'),
    city: first('city'),
    nationality: first('nationality'),
    bankAccountName: first('bankAccountName'),
    paidAttendees: Number(first('paidAttendees')),
    childrenUnderFive: Number(first('childrenUnderFive')),
    performanceInterest: first('performanceInterest'),
    performance: all('performance'),
    performanceDescription: first('performanceDescription'),
    fashionShow: first('fashionShow'),
    fashionDescription: first('fashionDescription'),
    volunteerInterest: first('volunteerInterest'),
    volunteerRoles: all('volunteerRoles'),
    communityMela: first('communityMela'),
    kidsActivity: first('kidsActivity'),
    mobile: first('mobile'),
    suggestions: first('suggestions'),
    isrkRepresentative: first('isrkRepresentative'),
    agreement: first('agreement'),
    submissionSource: first('submissionSource') || 'ISRK website',
    submissionToken: first('submissionToken')
  };
}

function validatePayload_(payload) {
  if (payload.formGuard && payload.formGuard.toLowerCase() !== payload.email) {
    throw new Error('Submission rejected.');
  }
  ['email', 'fullName', 'organization', 'city', 'nationality', 'bankAccountName'].forEach((field) => {
    if (!payload[field]) throw new Error(`Required field missing: ${field}`);
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error('Please provide a valid email address.');
  enforceTestRecipient_(payload.email);
  if (!Number.isInteger(payload.paidAttendees) || payload.paidAttendees < 1 || payload.paidAttendees > 9) {
    throw new Error('Paid attendee count must be between 1 and 9.');
  }
  if (!Number.isInteger(payload.childrenUnderFive) || payload.childrenUnderFive < 0 || payload.childrenUnderFive > 5) {
    throw new Error('Children under five must be between 0 and 5.');
  }
  if (!['Yes', 'No'].includes(payload.performanceInterest)) throw new Error('Please complete the performance question.');
  if (payload.performanceInterest === 'Yes' && payload.performance.length === 0) throw new Error('Please select at least one performance type.');
  if (payload.performanceInterest === 'No' && payload.performance.length > 0) throw new Error('Performance choices do not match the selected answer.');
  if (!['Yes', 'No'].includes(payload.volunteerInterest)) throw new Error('Please complete the volunteer question.');
  if (payload.volunteerInterest === 'Yes' && payload.volunteerRoles.length === 0) throw new Error('Please select at least one volunteer role.');
  if (payload.volunteerInterest === 'No' && payload.volunteerRoles.length > 0) throw new Error('Volunteer choices do not match the selected answer.');
  if (!['Yes', 'No'].includes(payload.fashionShow) || !['Yes', 'No'].includes(payload.communityMela) || !['Yes', 'No'].includes(payload.kidsActivity)) {
    throw new Error('Please complete all participation questions.');
  }
  if (!['Yes', 'Already a member', 'No'].includes(payload.isrkRepresentative)) {
    throw new Error('Please complete the ISRK Representative Team question.');
  }
  const activityContactRequired = payload.performanceInterest === 'Yes' || payload.volunteerInterest === 'Yes' ||
    payload.fashionShow === 'Yes' || payload.communityMela === 'Yes';
  if (activityContactRequired && !payload.mobile) throw new Error('A mobile number is required for activity coordination.');
  if (activityContactRequired && !/^010-[0-9]{4}-[0-9]{4}$/.test(payload.mobile)) throw new Error('Please enter the mobile number as 010-XXXX-XXXX.');
  if (payload.performanceInterest === 'Yes' && !payload.performanceDescription) throw new Error('Please describe the proposed performance.');
  if (payload.fashionShow === 'Yes' && !payload.fashionDescription) throw new Error('Please describe the fashion show idea or theme.');
  if (payload.agreement !== 'I Agree') throw new Error('You must accept the declaration and agreement.');
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(payload.submissionToken)) {
    throw new Error('Please refresh the registration page and submit again.');
  }
}

function enforceTestRecipient_(email) {
  if (CONFIG.TEST_MODE && !CONFIG.TEST_RECIPIENTS.includes(String(email).toLowerCase())) {
    throw new Error('Test mode currently accepts organizer test email addresses only.');
  }
}

function getRegistrationSheet_() {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error(`Registration sheet not found: ${CONFIG.SHEET_NAME}`);
  return sheet;
}

function assertHeaders_(sheet) {
  const actual = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  if (actual.join('|') !== HEADERS.join('|')) throw new Error('The registration sheet headers do not match the 2026 schema.');
}

function headerMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  return headers.reduce((map, header, index) => {
    map[header] = index + 1;
    return map;
  }, {});
}

function rowObject_(values) {
  return HEADERS.reduce((record, header, index) => {
    record[header] = values[index];
    return record;
  }, {});
}

function setCellsByHeader_(sheet, row, valuesByHeader) {
  const columns = headerMap_(sheet);
  Object.keys(valuesByHeader).forEach((header) => {
    sheet.getRange(row, columns[header]).setValue(valuesByHeader[header]);
  });
}

function activeAttendanceCount_(sheet) {
  if (sheet.getLastRow() < 2) return 0;
  const columns = headerMap_(sheet);
  const rowCount = sheet.getLastRow() - 1;
  const totals = sheet.getRange(2, columns['Total Attendees'], rowCount, 1).getValues();
  const statuses = sheet.getRange(2, columns['Payment Status'], rowCount, 1).getDisplayValues();
  return totals.reduce((sum, row, index) => {
    return ['Cancelled', 'Rejected'].includes(statuses[index][0]) ? sum : sum + Number(row[0] || 0);
  }, 0);
}

function registrationIdForSubmissionToken_(sheet, submissionToken) {
  if (sheet.getLastRow() < 2) return '';
  const columns = headerMap_(sheet);
  const rowCount = sheet.getLastRow() - 1;
  const tokens = sheet.getRange(2, columns['Submission Token'], rowCount, 1).getDisplayValues();
  const index = tokens.findIndex((row) => row[0] === submissionToken);
  if (index < 0) return '';
  return String(sheet.getRange(index + 2, columns['Registration ID']).getDisplayValue());
}

function nextRegistrationId_(sheet) {
  const properties = PropertiesService.getScriptProperties();
  const stored = Number(properties.getProperty('REGISTRATION_COUNTER') || 0);
  const next = Math.max(stored, maxRegistrationNumber_(sheet)) + 1;
  properties.setProperty('REGISTRATION_COUNTER', String(next));
  return `D26-${String(next).padStart(4, '0')}`;
}

function maxRegistrationNumber_(sheet) {
  if (sheet.getLastRow() < 2) return 0;
  const idColumn = headerMap_(sheet)['Registration ID'];
  return sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1).getDisplayValues()
    .map((row) => Number((row[0].match(/D26-(\d+)/) || [0, 0])[1]))
    .reduce((max, value) => Math.max(max, value), 0);
}

function sendRegistrationEmail_(record) {
  const subject = `[DEEPOTSAV 2026] Registration received - ${record.registrationId}`;
  const statusBlock = emailStatusBlock_('Registration received', 'Payment verification pending', '#f47b20', '#fff6e8');
  const body = `Dear ${record.fullName},\n\nWe received your Deepotsav 2026 registration.\nReference: ${record.registrationId}\nPayment status: Pending verification\nExpected amount: ${formatWon_(record.expectedAmount)}\n\n${eventPlainText_()}\n\nISRK Team`;
  const html = emailShell_(
    `Dear ${escapeHtml_(record.fullName)},`,
    statusBlock +
    `<p style="margin:20px 0 8px;color:#344054;">Thank you for registering for <strong>Deepotsav 2026</strong>. Keep the reference number below for the registration desk.</p>` +
    referenceBlock_(record.registrationId) +
    detailsTable_([
      ['Paid attendees', record.paidAttendees],
      ['Children under five', record.childrenUnderFive],
      ['Fee per paid attendee', formatWon_(record.feePerAttendee)],
      ['Expected payment', formatWon_(record.expectedAmount)]
    ]) +
    paymentBlock_() + eventBlock_() +
    `<p style="font-size:13px;color:#667085;margin:20px 0 0;">This email acknowledges your registration. It is not proof of payment. A separate confirmation will be sent after the ISRK team verifies your payment.</p>`
  );
  sendHtmlEmail_(record.email, subject, body, html);
}

function sendPaymentEmail_(record) {
  const subject = `[DEEPOTSAV 2026] Payment confirmed - ${record.registrationId}${record.isResend ? ' (resent)' : ''}`;
  const statusBlock = emailStatusBlock_('Payment confirmed', 'Your registration is complete', '#17823b', '#edf8f0');
  const body = `Dear ${record.fullName},\n\nYour Deepotsav 2026 payment has been verified.\nReference: ${record.registrationId}\nAmount confirmed: ${formatWon_(record.paidAmount)}\n\nPlease present this reference at the registration desk.\n\n${eventPlainText_()}\n\nISRK Team`;
  const html = emailShell_(
    `Dear ${escapeHtml_(record.fullName)},`,
    statusBlock +
    `<p style="margin:20px 0 8px;color:#344054;">We have verified your payment. Your Deepotsav 2026 registration is now complete.</p>` +
    referenceBlock_(record.registrationId) +
    detailsTable_([
      ['Amount confirmed', formatWon_(record.paidAmount)],
      ['Paid attendees', record.paidAttendees],
      ['Children under five', record.childrenUnderFive]
    ]) + eventBlock_() +
    `<p style="font-size:14px;color:#344054;margin:20px 0 0;"><strong>Please present this reference number at the registration desk.</strong></p>`
  );
  sendHtmlEmail_(record.email, subject, body, html);
}

function sendHtmlEmail_(to, subject, body, htmlBody) {
  enforceTestRecipient_(to);
  const options = {
    to: to,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: 'ISRK Team',
    replyTo: CONFIG.REPLY_TO
  };
  try {
    options.inlineImages = { isrkLogo: DriveApp.getFileById(CONFIG.LOGO_FILE_ID).getBlob().setName('isrk-logo.png') };
  } catch (error) {
    console.warn(`Logo could not be embedded: ${error.message}`);
  }
  MailApp.sendEmail(options);
}

function emailShell_(greeting, content) {
  return `<!doctype html><html><head><meta charset="UTF-8"></head><body style="margin:0;background:#f3f5f9;font-family:Arial,sans-serif;color:#182230;">` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f9;padding:28px 12px;"><tr><td align="center">` +
    `<table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background:#ffffff;border:1px solid #dfe3eb;border-radius:8px;overflow:hidden;">` +
    `<tr><td style="background:#071c4a;padding:22px 28px;text-align:center;">` +
    `<img src="cid:isrkLogo" alt="ISRK" width="145" style="display:inline-block;max-width:145px;height:auto;background:#fff;border-radius:4px;padding:7px;">` +
    `<div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:12px;">Deepotsav 2026</div>` +
    `<div style="height:4px;margin:16px -28px -22px;background:linear-gradient(90deg,#f47b20 0 33%,#ffffff 33% 66%,#17823b 66%);"></div></td></tr>` +
    `<tr><td style="padding:28px;"><p style="font-size:17px;margin:0 0 18px;color:#182230;">${greeting}</p>${content}</td></tr>` +
    `<tr><td style="background:#f7f8fb;border-top:1px solid #e4e7ec;padding:20px 28px;font-size:12px;line-height:1.6;color:#667085;">` +
    `<strong style="color:#071c4a;">ISRK Team</strong><br>Indian Students and Researchers in Korea<br>` +
    `${escapeHtml_(CONFIG.CONTACT_LINE)}<br><a href="mailto:${CONFIG.REPLY_TO}" style="color:#244982;">${CONFIG.REPLY_TO}</a> &middot; <a href="https://www.isrk.in" style="color:#244982;">www.isrk.in</a>` +
    `</td></tr></table></td></tr></table></body></html>`;
}

function emailStatusBlock_(title, subtitle, accent, background) {
  return `<div style="border-left:4px solid ${accent};background:${background};padding:13px 16px;margin-bottom:18px;">` +
    `<div style="font-size:17px;font-weight:700;color:#182230;">${title}</div>` +
    `<div style="font-size:13px;color:#667085;margin-top:3px;">${subtitle}</div></div>`;
}

function referenceBlock_(registrationId) {
  return `<div style="background:#071c4a;color:#ffffff;text-align:center;padding:18px;margin:20px 0;border-radius:6px;">` +
    `<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#b9c6df;">Registration reference</div>` +
    `<div style="font-size:28px;font-weight:700;letter-spacing:1px;margin-top:5px;">${escapeHtml_(registrationId)}</div></div>`;
}

function detailsTable_(rows) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:18px 0;">` +
    rows.map((row) => `<tr><td style="padding:9px 8px;border-bottom:1px solid #e4e7ec;color:#667085;font-size:13px;">${escapeHtml_(String(row[0]))}</td>` +
      `<td align="right" style="padding:9px 8px;border-bottom:1px solid #e4e7ec;color:#182230;font-size:13px;font-weight:700;">${escapeHtml_(String(row[1]))}</td></tr>`).join('') +
    `</table>`;
}

function paymentBlock_() {
  return `<div style="border:1px solid #dfe3eb;border-radius:6px;padding:16px;margin:20px 0;">` +
    `<div style="font-weight:700;color:#071c4a;margin-bottom:8px;">Payment details</div>` +
    `<div style="font-size:14px;line-height:1.7;color:#344054;"><strong>${CONFIG.BANK_NAME}</strong><br>${CONFIG.BANK_ACCOUNT}<br>${escapeHtml_(CONFIG.BANK_HOLDER)}</div>` +
    `<div style="font-size:12px;color:#667085;margin-top:8px;">Please transfer using the bank-account holder name entered in your registration.</div></div>`;
}

function eventBlock_() {
  return `<div style="margin-top:22px;"><div style="font-weight:700;color:#071c4a;margin-bottom:8px;">Event details</div>` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.6;color:#344054;">` +
    `<tr><td style="width:74px;padding:3px 0;color:#667085;">Date</td><td style="padding:3px 0;font-weight:600;">${CONFIG.EVENT_DATE}</td></tr>` +
    `<tr><td style="padding:3px 0;color:#667085;">Time</td><td style="padding:3px 0;font-weight:600;">${CONFIG.EVENT_TIME}</td></tr>` +
    `<tr><td style="padding:3px 0;color:#667085;">Venue</td><td style="padding:3px 0;font-weight:600;">${CONFIG.VENUE}</td></tr>` +
    `<tr><td style="padding:3px 0;color:#667085;">Address</td><td style="padding:3px 0;">${CONFIG.ADDRESS_EN}<br>${CONFIG.ADDRESS_KO}</td></tr>` +
    `</table></div>`;
}

function eventPlainText_() {
  return `${CONFIG.EVENT_DATE}\n${CONFIG.EVENT_TIME}\n${CONFIG.VENUE}\n${CONFIG.ADDRESS_EN}\n${CONFIG.ADDRESS_KO}`;
}

function formatWon_(value) {
  return `${Number(value || 0).toLocaleString('en-US')} KRW`;
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safeErrorMessage_(error) {
  return error && error.message ? String(error.message).slice(0, 300) : 'An unexpected error occurred.';
}

function responsePage_(status, message) {
  const payload = JSON.stringify({ type: 'deepotsav-registration', status: status, message: message }).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    `<!doctype html><html><body><p>${escapeHtml_(message)}</p><script>window.top.postMessage(${payload}, '*');</script></body></html>`
  ).setTitle('Deepotsav 2026 Registration');
}
