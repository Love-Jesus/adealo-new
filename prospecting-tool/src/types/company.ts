// src/types/company.ts

export interface Company {
  companyId: string;
  organisationNumber: string;
  name: string;
  displayName: string;
  businessUnitId?: string;
  visitorAddress: {
    addressLine: string;
    zipCode: string;
    postPlace: string;
  };
  postalAddress: {
    addressLine: string;
    zipCode: string;
    postPlace: string;
  };
  contact: {
    email: string;
    telephoneNumber: string;
    mobilePhone?: string;
    faxNumber?: string;
    homePage?: string;
  };
  location: {
    countryPart?: string;
    county?: string;
    municipality?: string;
    coordinates?: string;
  };
  financials: {
    revenue?: number;
    profit?: number;
    currency?: string;
    companyAccountsLastUpdatedDate?: string;
  };
  info: {
    foundationYear?: string;
    foundationDate?: string;
    numberOfEmployees?: string;
    status?: {
      status: string;
      description?: string;
      statusDate?: string;
    };
    naceCategories?: string;
    proffIndustries?: string;
  };
  roles: {
    companyRoles?: string;
    personRoles?: string;
  };
  marketingProtection?: boolean;
  mainOffice?: string;
  secretData?: string;
  stakeholders?: Stakeholder[];
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  notes?: string;
  lastContactDate?: Date;
}
