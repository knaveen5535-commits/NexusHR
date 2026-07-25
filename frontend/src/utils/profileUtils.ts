import type { Employee } from '../types';

export const calculateProfileCompletion = (profile: Employee | null, editForm?: any) => {
  if (!profile) return 0;
  
  // Use editForm data if provided, otherwise fallback to profile data
  const data = editForm || profile;
  
  const fields = [
    profile.firstName, // first name is typically not editable in the form
    profile.email,     // email is typically not editable
    data.phone !== undefined ? data.phone : profile.phone,
    data.address !== undefined ? data.address : profile.address,
    data.emergencyContactName !== undefined ? data.emergencyContactName : profile.emergencyContactName,
    data.emergencyContactNumber !== undefined ? data.emergencyContactNumber : profile.emergencyContactNumber,
    data.dateOfBirth !== undefined ? data.dateOfBirth : profile.dateOfBirth,
    data.gender !== undefined ? data.gender : profile.gender
  ];
  
  const filledFields = fields.filter(f => f && String(f).trim() !== '');
  const documentCount = profile.documents ? profile.documents.length : 0;
  const docsToCount = Math.min(documentCount, 3);
  
  const totalItems = fields.length + 3;
  const completedItems = filledFields.length + docsToCount;
  
  return Math.round((completedItems / totalItems) * 100);
};
