import React, { useState } from 'react';
import { 
  useStripe, 
  useElements, 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement 
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  isYearly: boolean;
  planName: string;
}

// List of countries for the dropdown
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  // Add more countries as needed
];

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  isYearly,
  planName
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Personal information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Business information
  const [companyName, setCompanyName] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  
  // Billing address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  
  // Terms agreement
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Form state
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [invoiceEmailError, setInvoiceEmailError] = useState('');
  const [addressLine1Error, setAddressLine1Error] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [postalCodeError, setPostalCodeError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardExpiryError, setCardExpiryError] = useState('');
  const [cardCvcError, setCardCvcError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Card element styling
  const cardElementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  // Handle card element changes
  const handleCardNumberChange = (event: any) => {
    setCardNumberError(event.error ? event.error.message : '');
  };

  const handleCardExpiryChange = (event: any) => {
    setCardExpiryError(event.error ? event.error.message : '');
  };

  const handleCardCvcChange = (event: any) => {
    setCardCvcError(event.error ? event.error.message : '');
  };

  // Validate the form
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset all errors
    setNameError('');
    setEmailError('');
    setInvoiceEmailError('');
    setAddressLine1Error('');
    setCityError('');
    setStateError('');
    setPostalCodeError('');
    setCountryError('');
    setTermsError('');
    setGeneralError('');

    // Validate personal information
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }

    // Validate invoice email if provided
    if (invoiceEmail && !/\S+@\S+\.\S+/.test(invoiceEmail)) {
      setInvoiceEmailError('Invoice email is invalid');
      isValid = false;
    }

    // Validate billing address
    if (!addressLine1.trim()) {
      setAddressLine1Error('Address is required');
      isValid = false;
    }

    if (!city.trim()) {
      setCityError('City is required');
      isValid = false;
    }

    if (!state.trim()) {
      setStateError('State/Province is required');
      isValid = false;
    }

    if (!postalCode.trim()) {
      setPostalCodeError('Postal code is required');
      isValid = false;
    }

    if (!country) {
      setCountryError('Country is required');
      isValid = false;
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      setTermsError('You must agree to the terms and conditions');
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setGeneralError('');

    // Get the card elements
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setGeneralError('Card elements not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method with all the details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name,
          email,
          address: {
            line1: addressLine1,
            line2: addressLine2 || undefined,
            city,
            state,
            postal_code: postalCode,
            country,
          },
        },
      });

      if (error) {
        setGeneralError(error.message || 'An error occurred with your payment');
        setIsProcessing(false);
        return;
      }

      if (paymentMethod) {
        // Add metadata for company information if provided
        const metadata: Record<string, string> = {};
        
        if (companyName) {
          metadata.company_name = companyName;
        }
        
        if (invoiceEmail) {
          metadata.invoice_email = invoiceEmail;
        }
        
        if (taxId) {
          metadata.tax_id = taxId;
        }

        // Call the onSuccess callback with the payment method ID
        onSuccess(paymentMethod.id);
      } else {
        onError('Failed to create payment method');
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className={nameError ? 'border-red-500' : ''}
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={emailError ? 'border-red-500' : ''}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>
      </div>

      {/* Business Information Section (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Business Information (Optional)</h3>
        
        <div>
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
          />
        </div>

        <div>
          <Label htmlFor="invoice-email">Invoice Email</Label>
          <Input
            id="invoice-email"
            type="email"
            value={invoiceEmail}
            onChange={(e) => setInvoiceEmail(e.target.value)}
            placeholder="billing@example.com"
            className={invoiceEmailError ? 'border-red-500' : ''}
          />
          {invoiceEmailError && <p className="text-red-500 text-sm mt-1">{invoiceEmailError}</p>}
        </div>

        <div>
          <Label htmlFor="tax-id">Tax ID / VAT Number (Optional)</Label>
          <Input
            id="tax-id"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="Tax ID or VAT number"
          />
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Billing Address</h3>
        
        <div>
          <Label htmlFor="address-line1">Address Line 1</Label>
          <Input
            id="address-line1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="123 Main St"
            className={addressLine1Error ? 'border-red-500' : ''}
          />
          {addressLine1Error && <p className="text-red-500 text-sm mt-1">{addressLine1Error}</p>}
        </div>

        <div>
          <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
          <Input
            id="address-line2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apt 4B"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York"
              className={cityError ? 'border-red-500' : ''}
            />
            {cityError && <p className="text-red-500 text-sm mt-1">{cityError}</p>}
          </div>

          <div>
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="NY"
              className={stateError ? 'border-red-500' : ''}
            />
            {stateError && <p className="text-red-500 text-sm mt-1">{stateError}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postal-code">Postal Code</Label>
            <Input
              id="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="10001"
              className={postalCodeError ? 'border-red-500' : ''}
            />
            {postalCodeError && <p className="text-red-500 text-sm mt-1">{postalCodeError}</p>}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`w-full h-10 px-3 py-2 border rounded-md ${
                countryError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              {COUNTRIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            {countryError && <p className="text-red-500 text-sm mt-1">{countryError}</p>}
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Information</h3>
        
        <div>
          <Label htmlFor="card-number">Card Number</Label>
          <div
            className={`border rounded-md p-3 ${
              cardNumberError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <CardNumberElement 
              id="card-number" 
              options={cardElementStyle}
              onChange={handleCardNumberChange}
            />
          </div>
          {cardNumberError && <p className="text-red-500 text-sm mt-1">{cardNumberError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="card-expiry">Expiration Date</Label>
            <div
              className={`border rounded-md p-3 ${
                cardExpiryError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <CardExpiryElement 
                id="card-expiry" 
                options={cardElementStyle}
                onChange={handleCardExpiryChange}
              />
            </div>
            {cardExpiryError && <p className="text-red-500 text-sm mt-1">{cardExpiryError}</p>}
          </div>

          <div>
            <Label htmlFor="card-cvc">CVC</Label>
            <div
              className={`border rounded-md p-3 ${
                cardCvcError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <CardCvcElement 
                id="card-cvc" 
                options={cardElementStyle}
                onChange={handleCardCvcChange}
              />
            </div>
            {cardCvcError && <p className="text-red-500 text-sm mt-1">{cardCvcError}</p>}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center space-x-2 mt-6">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
        />
        <label
          htmlFor="terms"
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            termsError ? 'text-red-500' : ''
          }`}
        >
          I agree to the{' '}
          <a href="/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>
      {termsError && <p className="text-red-500 text-sm">{termsError}</p>}

      {/* General Error Message */}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-500">{generalError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isProcessing || !stripe}
        >
          {isProcessing
            ? 'Processing...'
            : isYearly
            ? `Pay $${amount} for 1 year`
            : `Pay $${amount} per month`}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-2">
          You can cancel anytime
        </p>
      </div>
    </form>
  );
};

export default StripePaymentForm;
