import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import userTestCase from '../utils/userTestCase';
import { parse } from 'csv-parse/sync';

// Hàm đọc dữ liệu từ CSV
function readTestCasesFromCSV(): userTestCase[] {
  const fileContent = fs.readFileSync('customer_registration_testcases.csv', { encoding: 'utf8' });
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  return records as userTestCase[];
}

// Hàm helper để điền form registration
async function fillRegistrationForm(page: Page, testData: userTestCase) {
  // Sử dụng selector thực tế từ website Practice Software Testing
  
  if (testData.first_name) {
    await page.locator('[data-test="first-name"]').fill(testData.first_name);
  }
  
  if (testData.last_name) {
    await page.locator('[data-test="last-name"]').fill(testData.last_name);
  }
  
  if (testData.email) {
    await page.locator('[data-test="email"]').fill(testData.email);
  }
  
  if (testData.password) {
    await page.locator('[data-test="password"]').fill(testData.password);
  }
  
  if (testData.dob) {
    await page.locator('[data-test="dob"]').fill(testData.dob);
  }
  
  if (testData.address) {
    await page.locator('[data-test="address"]').fill(testData.address);
  }
  
  if (testData.city) {
    await page.locator('[data-test="city"]').fill(testData.city);
  }
  
  if (testData.state) {
    await page.locator('[data-test="country"]').selectOption(testData.state);
  }
  
  if (testData.postcode) {
    await page.locator('[data-test="postcode"]').fill(testData.postcode);
  }
  
  if (testData.phone) {
    await page.locator('[data-test="phone"]').fill(testData.phone);
  }
  
  if (testData.country) {
    await page.locator('[data-test="state"]').fill(testData.country);
  }
}

const testCases: userTestCase[] = readTestCasesFromCSV();
// CSV Data Driven Tests
// test.describe('Customer Registration CSV Tests', () => {

  

//   // Test cho Valid Registration
//   test('CR_EP_01: Valid Registration', async ({ page }) => {
//     const testCase = testCases.find((tc: userTestCase) => tc.testId === 'CR_EP_01');
//     if (!testCase) {
//       console.log('Test case CR_EP_01 not found in CSV');
//       return;
//     }
//     console.log(testCase);

//     await test.step('Navigate to registration page', async () => {
//       await page.goto('https://with-bugs.practicesoftwaretesting.com/#/auth/register');
//     });
    
//     await test.step('Fill registration form', async () => {
//       await fillRegistrationForm(page, testCase);
//     });
    
//     await test.step('Submit registration form', async () => {
//       await page.getByRole('button', { name: 'Register' }).click();
//     });

//     // Wait for navigation or success message
//     await page.waitForTimeout(2000);
    
//     // Capture and display the test screen
//     const screenshotPath = `screenshots/${testCase.testId}_${Date.now()}.png`;
//     await page.screenshot({ path: screenshotPath });
//     console.log(`Test screenshot saved at: ${screenshotPath}`);
    
//     if (testCase.expectedResult.toLowerCase().includes('successful')) {
//       // Check if redirected to login or success message appears
//       const url = page.url();
//       if (url.includes('login')) {
//         console.log('✓ Registration successful - redirected to login');
//       } else {
//         // Look for a success indicator on the page
//         const successElements = await page.locator('text=/success|registered|welcome/i').count();
//         if (successElements > 0) {
//           console.log('✓ Registration successful - success message found');
//         }
//       }
//     }
//   });

//   // Other test cases can be added here (currently commented out)
// });


// Utility test to run all CSV test cases sequentially
// Load CSV 1 lần trước khi chạy test suite
// Chạy toàn bộ test case từ CSV trong 1 test




test.describe('Registration Test Cases from CSV', () => {
  for (const testCase of testCases) 
   {

    test(`${testCase.testId} - ${testCase.testName}`, async ({ page }) => {
      await page.goto('http://localhost:4200/#/auth/register');
      await fillRegistrationForm(page, testCase);
      await page.getByRole('button', { name: 'Register' }).click();
      await page.waitForTimeout(1500);

      // fix screenshot path (remove extra '}' )
      const screenshotPath = `screenshots/registration/${testCase.testId}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      if (testCase.expectedResult.toLowerCase().includes('successful')) {
        // wait for navigation and check URL includes '/auth/login'
        try {
          await expect(page).toHaveURL(/#\/auth\/login/);
        } catch (error) {
          throw new Error('Expected page to navigate to "/auth/login", but it did not.');
        }
        
      } else if (testCase.expectedResult.toLowerCase().includes('error')) {
        // Split on ':' and trim off any trailing period
        const expectedError = testCase.expectedResult
          .split(':')[1]
          ?.replace(/\.$/, '')
          .trim() || '';

        // only pick the alert that contains the expected text
        console.log(`${testCase.testId} - Expected error:`, expectedError);
        const errorMessageLocator = page.locator('.alert.alert-danger');
        await expect(errorMessageLocator).toBeVisible();
        const actualErrorText = (await errorMessageLocator.textContent());
        if (actualErrorText && actualErrorText.includes(expectedError)) {
          console.log("Error message validation passed.");
        } else {
          throw new Error(`Expected error message to contain "${expectedError}" but got "${actualErrorText}".`);
        }
      
        console.log(`Expected error message: ${expectedError}`);
        console.log(`Actual error message: ${actualErrorText}`);
      }
      
      
    });
  }
});