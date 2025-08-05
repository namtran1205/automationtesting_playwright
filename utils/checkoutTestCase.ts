interface CheckoutTestCase {
  testId: string;
  testName: string;
  precondition: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  payment_method: string;
  account_name?: string;
  account_number?: string;
  expectedResult: string;
}

export default CheckoutTestCase;