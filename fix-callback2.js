const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'api-docs-content.tsx');
let content = fs.readFileSync(file, 'utf8');

const startMarker = 'const callbackEndpoints: EndpointDef[] = [';
const endMarker2 = '];\r\n\r\nconst paymentEndpoints';
const endMarker1 = '];\n\nconst paymentEndpoints';

const startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf(endMarker1, startIdx);
let eol = '\n';
if (endIdx === -1) {
  endIdx = content.indexOf(endMarker2, startIdx);
  eol = '\r\n';
}

fs.writeFileSync('debug.txt', 'start: ' + startIdx + ', end: ' + endIdx + ', eol: ' + JSON.stringify(eol) + '\n');

if (startIdx > -1 && endIdx > -1) {
  const endMarkerUsed = eol === '\n' ? endMarker1 : endMarker2;

  const newBlock = [
    'const callbackEndpoints: EndpointDef[] = [',
    '  {',
    '    id: "partner-callback",',
    '    name: "Partner Payment Callback",',
    '    method: "POST",',
    '    path: "https://your-domain.com/your-callback-url",',
    '    description:',
    '      "RexHub will send a POST request to your callback URL whenever a payment status changes. You must provide a publicly accessible POST endpoint that accepts the parameters below and returns a 202 Accepted response. You can add your callback URL in the Settings section of the RexHub Dashboard or share it via email to support@rexhub.com.",',
    '    auth: "none",',
    '    headers: [',
    '      { key: "Content-Type", value: "application/json" },',
    '    ],',
    '    requestBody: {',
    '      raw: JSON.stringify(',
    '        {',
    '          transactionId: "6e385829-1edf-4225-9c2f-38df924ceb3a",',
    '          externalTransactionId: "01000011-21978274-260326220859369",',
    '          amountTransferred: 49.00,',
    '          status: "SUCCESSFUL",',
    '          reason: "Payment completed",',
    '          callbackReceivedAt: "2026-03-26T22:10:01",',
    '        },',
    '        null,',
    '        2',
    '      ),',
    '      description:',
    '        "This is the payload RexHub sends TO your endpoint. Your server should process the notification and respond with a 202 status code.",',
    '    },',
    '    queryParams: [',
    '      { key: "transactionId", type: "String", required: true, description: "RexHub unique transaction reference (UUID)" },',
    '      { key: "externalTransactionId", type: "String", required: true, description: "The external/provider reference for the transaction" },',
    '      { key: "amountTransferred", type: "BigDecimal", required: true, description: "The amount that was transferred (in GHS)" },',
    '      { key: "status", type: "String", required: true, description: "Payment status: SUCCESSFUL, FAILED, or PENDING" },',
    '      { key: "reason", type: "String", required: true, description: "Reason or message - failure reason if failed, empty or descriptive if successful" },',
    '      { key: "callbackReceivedAt", type: "LocalDateTime", required: true, description: "Timestamp when the callback was received (ISO 8601 without timezone)" },',
    '    ],',
    '    responseExample: {',
    '      status: 202,',
    '      body: JSON.stringify(',
    '        {',
    '          message: "Accepted",',
    '        },',
    '        null,',
    '        2',
    '      ),',
    '      description: "Your endpoint must return HTTP 202 Accepted to acknowledge receipt of the callback.",',
    '    },',
    '    notes:',
    '      "Your callback URL must be a POST endpoint. RexHub expects a 202 Accepted response. If your endpoint is unreachable or returns an error, RexHub may retry the callback. Register your callback URL in Settings or email it to support@rexhub.com.",',
    '  },',
    '];',
    '',
    'const paymentEndpoints',
  ].join(eol);

  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx + endMarkerUsed.length);
  fs.writeFileSync(file, content, 'utf8');
  fs.appendFileSync('debug.txt', 'DONE\n');
} else {
  fs.appendFileSync('debug.txt', 'MARKERS NOT FOUND\n');
}

