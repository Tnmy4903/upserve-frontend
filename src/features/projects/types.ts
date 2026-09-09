export type ProjectStatus = 'pending' | 'in_progress' | 'testing' | 'deployment' | 'delivered' | 'completed';
export type ProjectInvoiceStage = 'advance' | 'milestone' | 'final';
export interface PaymentSchedule { advancePercentage: number; milestonePercentage: number; finalPercentage: number; }
export interface ProjectInvoiceSchedule { stage: ProjectInvoiceStage; percentage: number; amount: number; invoiceId?: string | null; status: string; isPaid: boolean; }
export interface Project { id: string; userId: string; title: string; description: string; deadline?: string | null; budget?: number | null; quotationId?: string | null; leadId?: string | null; assignedAdmin?: string | null; assignedSubAdmin?: string | null; status: ProjectStatus; progressPercentage?: number | null; totalDeliverables: number; completedDeliverables: number; cancelledDeliverables: number; totalProjectValue?: number; totalPaid?: number; outstandingAmount?: number; invoiceSchedule?: ProjectInvoiceSchedule[]; paymentSchedule?: PaymentSchedule; createdAt: string; updatedAt: string; }
export const projectStatuses: ProjectStatus[] = ['pending', 'in_progress', 'testing', 'deployment', 'delivered', 'completed'];
