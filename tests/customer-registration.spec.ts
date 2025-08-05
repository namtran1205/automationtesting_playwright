import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import userTestCase from '../utils/userTestCase';
import { parse } from 'csv-parse/sync';

const baseURL = 'http://localhost:4200/#/';
// Hàm đọc dữ liệu từ CSV
function readTestCasesFromCSV(): userTestCase[] {
  const fileContent = fs.readFileSync('customer_registration_testcases.csv', { encoding: 'utf8' });
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  return records as userTestCase[];
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

// Helper to fill multiple form fields
async function fillFormFields(page: Page, data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      const locator = page.locator(`[data-test="${key}"]`);
      await locator.waitFor({ state: 'visible' });
      
      // Handle select elements differently
      if (key === 'country') {
        await locator.selectOption(value);
      } else {
        await locator.fill(value);
      }
    }
  }
}

// Hàm helper để điền form registration
async function fillRegistrationForm(page: Page, testData: userTestCase): Promise<void> {
  const formData = {
    'first-name': testData.first_name || '',
    'last-name': testData.last_name || '',
    'email': testData.email || '',
    'password': testData.password || '',
    'dob': testData.dob || '',
    'address': testData.address || '',
    'city': testData.city || '',
    'state': testData.country || '',
    'country': testData.state || '',
    'postcode': testData.postcode || '',
    'phone': testData.phone || ''
  };
  
  await fillFormFields(page, formData);
}

// Hàm thực thi test case registration
async function executeRegistrationTestCase(page: Page, testCase: userTestCase): Promise<void> {
  // Điều hướng đến trang đăng ký
  await page.goto(`${baseURL}auth/register`);
  
  // Điền form đăng ký
  await fillRegistrationForm(page, testCase);
  
  // Submit form
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForTimeout(1500);
  
  // Chụp màn hình
  await page.screenshot({ 
    path: `screenshots/registration/registration-${testCase.testId}.png`, 
    fullPage: true 
  });
  
  const expectedError = parseExpectedError(testCase.expectedResult);
  
  // Kiểm tra kết quả
  if (testCase.expectedResult.toLowerCase().includes('successful')) {
    // Kiểm tra chuyển hướng đến trang login
    try {
      await expect(page).toHaveURL(/#\/auth\/login/);
      console.log('✓ Registration successful - redirected to login');
    } catch (error) {
      throw new Error('Expected page to navigate to "/auth/login", but it did not.');
    }
  } else if (expectedError) {
    // Kiểm tra thông báo lỗi
    await validateMessage(page, '.alert.alert-danger', expectedError, 'error');
  }
}

// Tạo test cases từ CSV
async function runRegistrationTests(): Promise<void> {
  const testCases = readTestCasesFromCSV();
  for (const testCase of testCases) {
    test(`${testCase.testId}: ${testCase.testName}`, async ({ page }) => {
      await executeRegistrationTestCase(page, testCase);
    });
  }
}

runRegistrationTests().catch(error => console.error('Error running registration tests:', error));