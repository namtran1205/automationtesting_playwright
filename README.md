# Installation and Setup Guide

## Requirements
- Node.js (version 12 or higher)
- npm or yarn

## Installation

1. **Clone the repository (if not already cloned):**
    ```bash
    git clone https://github.com/namtran1205/automationtesting_playwright
    cd your-repo-directory
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```
    Or if using yarn:
    ```bash
    yarn install
    ```

3. **Install Playwright (if not already installed):**
    ```bash
    npx playwright install
    ```

## Running the Project

### Running tests with Playwright

#### Standard Test Execution
Run all tests in headless mode:
```bash
npx playwright test
```

#### Running in Headed Mode
Use the --headed flag to run tests with a visible browser UI:
```bash
npx playwright test --headed
```

#### Enabling Tracing
Run tests with tracing enabled to capture trace data for debugging:
```bash
npx playwright test --trace on
```
#### Viewing Trace Reports

After running tests with tracing enabled, you can generate and view the trace report using the command below:
```bash
npx playwright show-trace [trace_file.zip]
```
Replace [trace_file.zip] with the actual path to your generated trace file.

### Excel to CSV Conversion

This project includes a utility to convert Excel test case files to CSV format for easier processing by the test automation framework.

#### Overview
The `excel-to-csv.ts` utility converts Excel files containing test cases into CSV format. It specifically handles:
- Parsing complex input strings from Excel cells
- Converting structured test case data into CSV format
- Supporting multiple sheets within an Excel workbook

#### Usage

1. **Place your Excel file in the project root directory**
   - The default Excel file should be named `22127420_Testcases.xlsx`
   - Ensure your Excel file contains the required columns: ID, Test case name, Precondition, Input, Expected Result

2. **Run the conversion script:**
   ```bash
   npx ts-node excel-to-csv.ts
   ```

3. **Generated CSV files:**
   - `customer_registration_testcases.csv` - Generated from "Feature1 CustomerRegistration" sheet
   - `checkout_testcases.csv` - Generated from "Feature2 Checkout" sheet

#### Configuration
To convert different sheets or files, modify the `excel-to-csv.ts` file:

```typescript
// For customer registration tests
convertExcelToCSV('22127420_Testcases.xlsx', 'customer_registration_testcases.csv', 'Feature1 CustomerRegistration');

// For checkout tests  
convertExcelToCSV('22127420_Testcases.xlsx', 'checkout_testcases.csv', 'Feature2 Checkout');
```

#### Input Format
The Excel file should contain columns with the following structure:
- **ID**: Test case identifier
- **Test case name**: Descriptive name of the test case
- **Precondition**: Prerequisites for the test
- **Input**: Test input data (can contain complex key=value pairs)
- **Expected Result**: Expected outcome of the test

#### Dependencies
The conversion utility requires the following dependencies (already included in package.json):
- `xlsx`: For reading Excel files
- `@types/xlsx`: TypeScript definitions for xlsx
- `fs`: For file system operations (built-in Node.js module)
