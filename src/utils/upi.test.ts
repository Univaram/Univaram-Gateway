import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateUpiUri,
  isValidUpiId,
  validateSupportAmount,
  validateUsername,
  formatINR,
  getUpiAppIntent,
  UNIVARAM_UPI_ID,
  COFFEE_PRICE_INR,
  getCoffeeAmount,
} from './upi.js';


test('isValidUpiId correctly validates valid and invalid UPI VPAs', () => {
  assert.equal(isValidUpiId('divyanshu@oksbi'), true);
  assert.equal(isValidUpiId('creator.work@icici'), true);
  assert.equal(isValidUpiId('john-doe@paytm'), true);
  assert.equal(isValidUpiId('hello@upi'), true);

  assert.equal(isValidUpiId('invalidupi'), false);
  assert.equal(isValidUpiId(''), false);
  assert.equal(isValidUpiId('@bank'), false);
  assert.equal(isValidUpiId('user@'), false);
  assert.equal(isValidUpiId('user name@bank'), false);
});

test('validateSupportAmount validates bounds appropriately', () => {
  assert.equal(validateSupportAmount(1).valid, true);
  assert.equal(validateSupportAmount(500).valid, true);
  assert.equal(validateSupportAmount(100000).valid, true);

  assert.equal(validateSupportAmount(0).valid, false);
  assert.equal(validateSupportAmount(-50).valid, false);
  assert.equal(validateSupportAmount(100001).valid, false);
  assert.equal(validateSupportAmount(NaN).valid, false);
});

test('validateUsername enforces clean URL slugs', () => {
  assert.equal(validateUsername('divyanshu-verma').valid, true);
  assert.equal(validateUsername('aditi99').valid, true);
  assert.equal(validateUsername('creator-hub').valid, true);

  assert.equal(validateUsername('ab').valid, false); // too short
  assert.equal(validateUsername('-starts-hyphen').valid, false);
  assert.equal(validateUsername('ends-hyphen-').valid, false);
  assert.equal(validateUsername('has spaces').valid, false);
  assert.equal(validateUsername('Uppercase').valid, false);
});

test('generateUpiUri produces standard compliant upi URI', () => {
  const uri = generateUpiUri({
    upiId: 'divyanshu@oksbi',
    payeeName: 'Divyanshu Verma',
    amount: 250,
    note: 'Great podcast episode',
    transactionRef: 'TXN123456',
  });

  assert.match(uri, /^upi:\/\/pay\?/);
  assert.match(uri, /pa=divyanshu%40oksbi/);
  assert.match(uri, /pn=Divyanshu\+Verma/);
  assert.match(uri, /am=250\.00/);
  assert.match(uri, /cu=INR/);
  assert.match(uri, /tr=TXN123456/);
});

test('formatINR formats currency nicely', () => {
  const formatted500 = formatINR(500);
  assert.ok(formatted500.includes('500'));
  assert.ok(formatted500.includes('₹'));
});

test('getUpiAppIntent handles provider deep links', () => {
  const baseUri = 'upi://pay?pa=test%40upi&am=100.00';
  assert.equal(getUpiAppIntent('gpay', baseUri), 'gpay://upi/pay?pa=test%40upi&am=100.00');
  assert.equal(getUpiAppIntent('phonepe', baseUri), 'phonepe://pay?pa=test%40upi&am=100.00');
  assert.equal(getUpiAppIntent('generic', baseUri), baseUri);
});

test('Univaram Gateway coffee pricing in multiples of 18 and payee constants are valid', () => {
  assert.equal(UNIVARAM_UPI_ID, 'univaram@centralbank');
  assert.equal(isValidUpiId(UNIVARAM_UPI_ID), true);
  assert.equal(COFFEE_PRICE_INR, 18);
  assert.equal(getCoffeeAmount(1), 18);
  assert.equal(getCoffeeAmount(2), 36);
  assert.equal(getCoffeeAmount(3), 54);
  assert.equal(getCoffeeAmount(5), 90);
  assert.equal(getCoffeeAmount(10), 180);
});


