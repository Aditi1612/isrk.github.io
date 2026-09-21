# Deepotsav 2026 registration automation

This Apps Script receives the private website form, writes registrations to the
`Registrations` tab, sends the registration acknowledgement, and sends a second
email when an organizer changes `Payment Status` to `Paid`.

## Test safeguards

- `TEST_MODE` is `true`.
- Only `mrbiswal13@gmail.com` and `cometomanas@gmail.com` can submit or receive mail.
- The website page is unlisted and marked `noindex, nofollow`.
- Do not switch `TEST_MODE` to `false` until the complete workflow is approved.

## Google Apps Script setup

1. Open the 2026 Google Sheet and select **Extensions > Apps Script**.
2. Replace the editor contents with `Code.gs`.
3. Set the project time zone to `Asia/Seoul`.
4. Run `setupProject` once and authorize the requested Sheets, Gmail, and Drive access.
5. Deploy as a Web app, executing as the deploying account, with access set to anyone.
6. Replace `REPLACE_WITH_DEPLOYMENT_ID` in the website form action with the deployment ID.

The logo is embedded from Drive file ID `1sFH5OAzQlhB3R9cdybzQDSju0Tf6gmhy`.

## Payment workflow

1. Confirm the bank transfer manually.
2. Enter the received amount in `Paid Amount (KRW)` if it differs from the expected amount.
3. Change `Payment Status` to `Paid`.
4. The installable edit trigger sends one confirmation and records its status and timestamp.
5. To retry a failed send, select the row and use **Deepotsav 2026 > Send/retry payment confirmation**.

If the initial registration acknowledgement fails, select the row and use
**Deepotsav 2026 > Send/retry registration acknowledgement**.
