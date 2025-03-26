// src/utils/dataTransformer.ts
import { Company } from "@/types/company";

export const transformCompanyData = (rawData: any): Company => {
  // Check if the data is already in the expected format with nested objects
  const hasNestedFormat = rawData.visitorAddress && 
                         typeof rawData.visitorAddress === 'object' &&
                         rawData.postalAddress && 
                         typeof rawData.postalAddress === 'object';

  if (hasNestedFormat) {
    // Data is already in the correct format, just ensure all required fields are present
    return {
      companyId: rawData.companyId,
      organisationNumber: rawData.organisationNumber,
      name: rawData.name,
      displayName: rawData.displayName || rawData.name,
      businessUnitId: rawData.businessUnitId,
      visitorAddress: {
        addressLine: rawData.visitorAddress.addressLine,
        zipCode: rawData.visitorAddress.zipCode,
        postPlace: rawData.visitorAddress.postPlace,
      },
      postalAddress: {
        addressLine: rawData.postalAddress.addressLine,
        zipCode: rawData.postalAddress.zipCode,
        postPlace: rawData.postalAddress.postPlace,
      },
      contact: {
        email: rawData.contact?.email || "",
        telephoneNumber: rawData.contact?.telephoneNumber || "",
        mobilePhone: rawData.contact?.mobilePhone,
        faxNumber: rawData.contact?.faxNumber,
        homePage: rawData.contact?.homePage,
      },
      location: {
        countryPart: rawData.location?.countryPart,
        county: rawData.location?.county,
        municipality: rawData.location?.municipality,
        coordinates: rawData.location?.coordinates,
      },
      financials: {
        revenue: typeof rawData.financials?.revenue === 'string' 
          ? parseFloat(rawData.financials.revenue) 
          : rawData.financials?.revenue,
        profit: typeof rawData.financials?.profit === 'string' 
          ? parseFloat(rawData.financials.profit) 
          : rawData.financials?.profit,
        currency: rawData.financials?.currency,
        companyAccountsLastUpdatedDate: rawData.financials?.companyAccountsLastUpdatedDate,
      },
      info: {
        foundationYear: rawData.info?.foundationYear,
        foundationDate: rawData.info?.foundationDate,
        numberOfEmployees: rawData.info?.numberOfEmployees,
        status: rawData.info?.status ? {
          status: rawData.info.status.status,
          description: rawData.info.status.description,
          statusDate: rawData.info.status.statusDate,
        } : undefined,
        naceCategories: rawData.info?.naceCategories,
        proffIndustries: rawData.info?.proffIndustries,
      },
      roles: {
        companyRoles: rawData.roles?.companyRoles,
        personRoles: rawData.roles?.personRoles,
      },
      marketingProtection: typeof rawData.marketingProtection === 'string' 
        ? rawData.marketingProtection === "True" 
        : !!rawData.marketingProtection,
      mainOffice: rawData.mainOffice,
      secretData: rawData.secretData,
      stakeholders: rawData.stakeholders || [],
    };
  } else {
    // Handle the flattened format (original implementation)
    return {
      companyId: rawData.companyId,
      organisationNumber: rawData.organisationNumber,
      name: rawData.name,
      displayName: rawData.displayName,
      businessUnitId: rawData.businessUnitId,
      visitorAddress: {
        addressLine: rawData.visitorAddress_addressLine,
        zipCode: rawData.visitorAddress_zipCode,
        postPlace: rawData.visitorAddress_postPlace,
      },
      postalAddress: {
        addressLine: rawData.postalAddress_addressLine,
        zipCode: rawData.postalAddress_zipCode,
        postPlace: rawData.postalAddress_postPlace,
      },
      contact: {
        email: rawData.email,
        telephoneNumber: rawData.telephoneNumber,
        mobilePhone: rawData.mobilePhone,
        faxNumber: rawData.faxNumber,
        homePage: rawData.homePage,
      },
      location: {
        countryPart: rawData.location_countryPart,
        county: rawData.location_county,
        municipality: rawData.location_municipality,
        coordinates: rawData.location_coordinates,
      },
      financials: {
        revenue: parseFloat(rawData.revenue) || undefined,
        profit: parseFloat(rawData.profit) || undefined,
        currency: rawData.currency,
        companyAccountsLastUpdatedDate: rawData.companyAccountsLastUpdatedDate,
      },
      info: {
        foundationYear: rawData.foundationYear,
        foundationDate: rawData.foundationDate,
        numberOfEmployees: rawData.numberOfEmployees,
        status: {
          status: rawData.status_status,
          description: rawData.status_description,
          statusDate: rawData.status_statusDate,
        },
        naceCategories: rawData.naceCategories,
        proffIndustries: rawData.proffIndustries,
      },
      roles: {
        companyRoles: rawData.companyRoles,
        personRoles: rawData.personRoles,
      },
      marketingProtection: rawData.marketingProtection === "True",
      mainOffice: rawData.mainOffice,
      secretData: rawData.secretData,
      stakeholders: [],
    };
  }
};

export const transformCompaniesArray = (rawDataArray: any[]): Company[] => {
  return rawDataArray.map(item => transformCompanyData(item));
};
