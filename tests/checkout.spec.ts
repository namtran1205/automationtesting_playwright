import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import checkoutTestCase from '../utils/checkoutTestCase';
import { parse } from 'csv-parse/sync';

const baseURL = 'http://localhost:4200/#/';

// Hàm đọc dữ liệu từ CSV
function readTestCasesFromCSV(): checkoutTestCase[] {
  const fileContent = fs.readFileSync('checkout_testcases.csv', { encoding: 'utf8' });
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  return records as checkoutTestCase[];
}

// Hàm đăng nhập
async function login(page: Page): Promise<void> {
  await page.goto(`${baseURL}auth/login`);
  await page.locator('[data-test="email"]').fill('customer2@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.click('[data-test="login-submit"]');
  await page.waitForTimeout(3000);
  await expect(page.locator('[data-test="page-title"]')).toHaveText('My account');
}

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(page: Page): Promise<void> {
  await page.goto(`${baseURL}product/1`);

  await page.click('[data-test="add-to-cart"]');
}

// Helper function to validate expected messages
async function validateMessage(page: Page, selector: string, expectedText: string, messageType: 'success' | 'error'): Promise<void> {
  const messageLocator = page.locator(selector);
  
  try {
    await messageLocator.waitFor({ state: 'visible', timeout: 5000 });
    const actualText = await messageLocator.textContent();
    
    if (actualText?.includes(expectedText)) {
      console.log(`${messageType} message validation passed: "${expectedText}"`);
    } else {
      throw new Error(`Expected ${messageType} message to contain "${expectedText}" but got "${actualText}"`);
    }
  } catch (error) {
    throw new Error(`Expected ${messageType} message "${expectedText}" was not displayed`);
  }
}

// Helper function to parse expected error from result string
function parseExpectedError(expectedResult: string): string | null {
  if (!expectedResult.toLowerCase().includes('error')) return null;
  
  return expectedResult
    .split(':')[1]
    ?.replace(/\.$/, '')
    .trim() || '';
}

// Helper function to check if test should stop early (billing address errors)
function shouldStopAfterBilling(expectedResult: string): boolean {
  return expectedResult.toLowerCase().includes('error') && 
         !expectedResult.toLowerCase().includes('account');
}

// Helper to fill multiple form fields
async function fillFormFields(page: Page, data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    const locator = page.locator(`[data-test="${key}"]`);
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }
}

// Hàm nhập dữ liệu Billing Address
async function fillBillingAddressForm(page: Page, testCase: checkoutTestCase): Promise<void> {
  const billingData = {
    address:  testCase.address  || '',
    city:     testCase.city     || '',
    state:    testCase.state    || '',
    country:  testCase.country  || '',
    postcode: testCase.postcode || ''
  };
  await fillFormFields(page, billingData);
}

// Hàm nhập dữ liệu Payment
async function fillPaymentForm(page: Page, testCase: checkoutTestCase): Promise<void> {
  const paymentData = {
    'account-name':    testCase.account_name   || '',
    'account-number':  testCase.account_number || ''
  };
  await page.locator('[data-test="payment-method"]').selectOption(testCase.payment_method);
  await fillFormFields(page, paymentData);
}


// Hàm thực thi test case checkout
async function executeCheckoutTestCase(page: Page, testCase: checkoutTestCase): Promise<void> {
  // Đăng nhập (nếu cần)
  if (testCase.precondition.includes('logged in')) {
    await login(page);
  } else {
    await page.context().addInitScript({ path: 'auth.json' });
  }

  // Thêm sản phẩm vào giỏ hàng
  await addToCart(page);

  // Điều hướng đến trang checkout
  await page.goto(`${baseURL}checkout`);
  await page.click('[data-test="proceed-1"]');

  const loggedInMessage = page.locator('p:has-text("already logged in. You can proceed to checkout.")');
  
  if (await loggedInMessage.isVisible()) {
    console.log('User is already logged in, proceeding to checkout.');
  } else {
    console.log('User is not logged in, logging in now.');
    await login(page);
  }

  await page.click('[data-test="proceed-2"]');

  // Nhập dữ liệu Billing Address
  await fillBillingAddressForm(page, testCase);

  const expectedError = parseExpectedError(testCase.expectedResult);
  
  // Kiểm tra lỗi ở bước billing address (nếu có)
  if (expectedError && shouldStopAfterBilling(testCase.expectedResult)) {
    await validateMessage(page, '.alert.alert-danger', expectedError, 'error');
    return; // Test stops here for billing errors
  }

  await page.click('[data-test="proceed-3"]');
  await fillPaymentForm(page, testCase);
  await page.click('[data-test="finish"]');
  
  await page.screenshot({ path: `screenshots/checkout/checkout-${testCase.testId}.png`, fullPage: true });

  // Kiểm tra kết quả cuối cùng
  if (testCase.expectedResult.includes('successfully')) {
    await validateMessage(page, '.alert.alert-success', testCase.expectedResult, 'success');
  } else if (expectedError) {
    await validateMessage(page, '.alert.alert-danger', expectedError, 'error');
  }
}

// Tạo test cases từ CSV
async function runCheckoutTests(): Promise<void> {
  const testCases = readTestCasesFromCSV();
  for (const testCase of testCases) {
    test(`${testCase.testId}: ${testCase.testName}`, async ({ page }) => {
      await executeCheckoutTestCase(page, testCase);
    });
  }
}

runCheckoutTests().catch(error => console.error('Error running checkout tests:', error));
