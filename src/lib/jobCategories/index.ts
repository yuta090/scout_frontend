import { JobCategory } from './types';

// Import all category files
import { SALES_CATEGORIES } from './categories/sales';
import { PLANNING_CATEGORIES } from './categories/planning';
import { CORPORATE_CATEGORIES } from './categories/corporate';
import { SCM_CATEGORIES } from './categories/scm';
import { CLERICAL_CATEGORIES } from './categories/clerical';
import { RETAIL_CATEGORIES } from './categories/retail';
import { SERVICE_CATEGORIES } from './categories/service';
import { FOOD_CATEGORIES } from './categories/food';
import { CONSULTANT_CATEGORIES } from './categories/consultant';
import { IT_CATEGORIES } from './categories/it';
import { CREATIVE_CATEGORIES } from './categories/creative';
import { CONSTRUCTION_CATEGORIES } from './categories/construction';
import { REAL_ESTATE_CATEGORIES } from './categories/real_estate';
import { MECHANICAL_CATEGORIES } from './categories/mechanical';
import { CHEMICAL_CATEGORIES } from './categories/chemical';
import { COSMETICS_CATEGORIES } from './categories/cosmetics';
import { MEDICAL_CATEGORIES } from './categories/medical';
import { MEDICAL_DEVICE_CATEGORIES } from './categories/medical_device';
import { HEALTHCARE_CATEGORIES } from './categories/healthcare';
import { FINANCE_CATEGORIES } from './categories/finance';
import { FOOD_INDUSTRY_CATEGORIES } from './categories/food_industry';
import { MEDIA_ENTERTAINMENT_CATEGORIES } from './categories/media_entertainment';
import { INFRASTRUCTURE_CATEGORIES } from './categories/infrastructure';
import { TRANSPORTATION_CATEGORIES } from './categories/transportation';
import { HR_SERVICES_CATEGORIES } from './categories/hr_services';
import { EDUCATION_CATEGORIES } from './categories/education';
import { EXECUTIVE_CATEGORIES } from './categories/executive';
import { ACADEMIC_CATEGORIES } from './categories/academic';
import { PUBLIC_SERVICE_CATEGORIES } from './categories/public_service';

// Export all categories
export const JOB_CATEGORIES: JobCategory[] = [
  SALES_CATEGORIES,
  PLANNING_CATEGORIES,
  CORPORATE_CATEGORIES,
  SCM_CATEGORIES,
  CLERICAL_CATEGORIES,
  RETAIL_CATEGORIES,
  SERVICE_CATEGORIES,
  FOOD_CATEGORIES,
  CONSULTANT_CATEGORIES,
  IT_CATEGORIES,
  CREATIVE_CATEGORIES,
  CONSTRUCTION_CATEGORIES,
  REAL_ESTATE_CATEGORIES,
  MECHANICAL_CATEGORIES,
  CHEMICAL_CATEGORIES,
  COSMETICS_CATEGORIES,
  MEDICAL_CATEGORIES,
  MEDICAL_DEVICE_CATEGORIES,
  HEALTHCARE_CATEGORIES,
  FINANCE_CATEGORIES,
  FOOD_INDUSTRY_CATEGORIES,
  MEDIA_ENTERTAINMENT_CATEGORIES,
  INFRASTRUCTURE_CATEGORIES,
  TRANSPORTATION_CATEGORIES,
  HR_SERVICES_CATEGORIES,
  EDUCATION_CATEGORIES,
  EXECUTIVE_CATEGORIES,
  ACADEMIC_CATEGORIES,
  PUBLIC_SERVICE_CATEGORIES
];

// Export types and individual categories
export * from './types';
export * from './categories/sales';
export * from './categories/planning';
export * from './categories/corporate';
export * from './categories/scm';
export * from './categories/clerical';
export * from './categories/retail';
export * from './categories/service';
export * from './categories/food';
export * from './categories/consultant';
export * from './categories/it';
export * from './categories/creative';
export * from './categories/construction';
export * from './categories/real_estate';
export * from './categories/mechanical';
export * from './categories/chemical';
export * from './categories/cosmetics';
export * from './categories/medical';
export * from './categories/medical_device';
export * from './categories/healthcare';
export * from './categories/finance';
export * from './categories/food_industry';
export * from './categories/media_entertainment';
export * from './categories/infrastructure';
export * from './categories/transportation';
export * from './categories/hr_services';
export * from './categories/education';
export * from './categories/executive';
export * from './categories/academic';
export * from './categories/public_service';