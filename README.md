# Installation and Setup Guide

## Requirements
- Node.js (version 12 or higher)
- npm or yarn

## Installation

1. **Clone the repository (if not already cloned):**
    ```bash
    git clone https://github.com/namtran1205/Playwright
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
