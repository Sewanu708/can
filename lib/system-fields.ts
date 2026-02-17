import { SystemField } from "./types";

export const SYSTEM_FIELDS: SystemField[] = [
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'firstName', label: 'First Name', required: true, type: 'text' },
  { key: 'lastName', label: 'Last Name', required: false, type: 'text' },
  { key: 'phone', label: 'Phone', required: false, type: 'phone' },
  { key: 'company', label: 'Company', required: false, type: 'text' },
  { key: 'title', label: 'Job Title', required: false, type: 'text' },
  { key: 'address', label: 'Address', required: false, type: 'text' },
  { key: 'city', label: 'City', required: false, type: 'text' },
  { key: 'state', label: 'State', required: false, type: 'text' },
  { key: 'country', label: 'Country', required: false, type: 'text' },
  { key: 'notes', label: 'Notes', required: false, type: 'text' },
];
