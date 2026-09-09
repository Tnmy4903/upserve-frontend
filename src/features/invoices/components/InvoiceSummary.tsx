type InvoiceSummaryProps = { totalValue: number; totalPaid: number; outstanding: number; currency: string };
const money = (value: number, currency: string) => value.toLocaleString(undefined, { style: 'currency', currency, maximumFractionDigits: 2 });

export function InvoiceSummary({ totalValue, totalPaid, outstanding, currency }: InvoiceSummaryProps) {
  return <div className="invoice-financial-summary" aria-label="Invoice financial summary"><div><span>Project value</span><strong>{money(totalValue, currency)}</strong><small>Agreed commercial value</small></div><div className="invoice-summary-paid"><span>Paid</span><strong>{money(totalPaid, currency)}</strong><small>Confirmed payments</small></div><div className={outstanding > 0 ? 'invoice-summary-outstanding' : 'invoice-summary-settled'}><span>{outstanding > 0 ? 'Outstanding' : 'Balance settled'}</span><strong>{money(outstanding, currency)}</strong><small>{outstanding > 0 ? 'Awaiting payment' : 'No balance remaining'}</small></div></div>;
}
