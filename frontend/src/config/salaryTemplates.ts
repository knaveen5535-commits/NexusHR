export interface TemplateComponent {
  name: string;
  componentType: 'EARNING' | 'DEDUCTION';
  valueType: 'FIXED' | 'PERCENTAGE';
  componentValue: number;
}

export const STANDARD_SALARY_TEMPLATE: TemplateComponent[] = [
  {
    name: 'House Rent Allowance (HRA)',
    componentType: 'EARNING',
    valueType: 'PERCENTAGE',
    componentValue: 40 // 40% of Basic
  },
  {
    name: 'Special Allowance',
    componentType: 'EARNING',
    valueType: 'PERCENTAGE',
    componentValue: 20 // 20% of Basic
  },
  {
    name: 'Provident Fund (PF)',
    componentType: 'DEDUCTION',
    valueType: 'PERCENTAGE',
    componentValue: 12 // 12% of Basic
  },
  {
    name: 'Professional Tax',
    componentType: 'DEDUCTION',
    valueType: 'FIXED',
    componentValue: 200 // Fixed 200 deduction
  }
];
