interface userTestCase {
  testId: string;
  testName: string;
  precondition: string;
  first_name: string;
  last_name: string;
  dob: string;
  address: string;
  city: string;
  country: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  password: string;
  expectedResult: string;
}

export default userTestCase;