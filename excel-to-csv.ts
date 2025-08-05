
import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Interface cho dữ liệu đầu vào từ Excel
interface ExcelRow {
  ID: string;
  'Test case name': string;
  Precondition: string;
  Input: string;
  'Expected Result': string;
}

// Interface cho dữ liệu sau khi xử lý
interface ProcessedRow {
  testId: string;
  testName: string;
  precondition: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  address?: string;
  city?: string;
  country?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  password?: string;
  state?: string;
  expectedResult: string;
}

// Hàm chuyển đổi Excel sang CSV
function convertExcelToCSV(excelFilePath: string, csvFilePath: string, sheetName: string): void {
  // Đọc file Excel
  const workbook = XLSX.readFile(excelFilePath);
  const sheet = workbook.Sheets[sheetName];
  const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  // Tách cột Input thành các cột riêng
  const csvData: ProcessedRow[] = jsonData.map((row: ExcelRow) => {
    const inputs: Partial<ProcessedRow> = {};
    
    // Xử lý chuỗi input phức tạp
    const inputString = row.Input;
    
    // Tách bằng dấu phẩy nhưng chú ý đến dấu ngoặc kép
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString[i];
      const nextChar = inputString[i + 1];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === ',' && !inQuotes) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
      } else if (char === '\r' || char === '\n') {
        // Bỏ qua ký tự xuống dòng
        continue;
      } else {
        current += char;
      }
    }
    
    // Thêm phần cuối cùng
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    // Parse từng phần
    parts.forEach((part: string) => {
      const equalIndex = part.indexOf('=');
      if (equalIndex > -1) {
        const key = part.substring(0, equalIndex).trim();
        let value = part.substring(equalIndex + 1).trim();
        
        // Loại bỏ dấu ngoặc kép ở đầu và cuối
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        inputs[key as keyof ProcessedRow] = value;
      }
    });
    
    return {
      testId: row.ID,
      testName: row['Test case name'],
      precondition: row.Precondition,
      ...inputs,
      expectedResult: row['Expected Result'],
    };
  });

  // Chuyển thành CSV
  const csv = XLSX.utils.json_to_sheet(csvData);
  writeFileSync(csvFilePath, XLSX.utils.sheet_to_csv(csv));
}

// Chạy hàm
//convertExcelToCSV('22127420_Testcases.xlsx', 'customer_registration_testcases.csv', 'Feature1 CustomerRegistration');

convertExcelToCSV('22127420_Testcases.xlsx', 'checkout_testcases.csv', 'Feature2 Checkout');