export const recordDirectoryColumns: Record<string, string[]> = {
  Users: ['name', 'email', 'role', 'isActive'],
  Leads: ['contactPerson', 'email', 'companyName', 'stage', 'clientId', 'assignedTo'],
  Requirements: ['businessName', 'status', 'deadline'],
  Quotations: ['quotationNumber', 'clientId', 'leadId', 'status', 'totalAmount'],
  Projects: ['title', 'userId', 'quotationId', 'leadId', 'status', 'assignedSubAdmin'],
  Deliverables: ['title', 'projectId', 'status', 'dueDate'],
  Invoices: ['invoiceNumber', 'stage', 'projectId', 'clientId', 'quotationId', 'leadId', 'status', 'amount'],
};
