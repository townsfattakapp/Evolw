import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import {
  docStyles as s,
  formatDocDate,
  formatInr,
  formatAddress,
  resolveClient,
  resolveCompany,
} from './documentStyles';

interface QuotationPDFProps {
  quotation: any;
  companySettings: any;
}

export function QuotationPDF({ quotation, companySettings }: QuotationPDFProps) {
  const company = resolveCompany(quotation, companySettings);
  const client = resolveClient(quotation);
  const companyLines = formatAddress(company);
  const clientLines = formatAddress(client);
  const currency = quotation.currency || 'INR';
  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const terms =
    quotation.terms_conditions ||
    company.default_terms ||
    companySettings?.default_terms ||
    '';

  return (
    <Document title={`Quotation ${quotation.quotation_number || 'Draft'}`} author="EVOLW">
      <Page size="A4" style={s.page}>
        <View style={s.accentBar} fixed />

        <View style={s.header}>
          <View>
            {company.logo_url ? (
              <Image style={{ width: 100, marginBottom: 6 }} src={company.logo_url} />
            ) : (
              <Text style={s.brand}>{company.brand_name || 'EVOLW'}</Text>
            )}
            <Text style={s.brandSub}>{company.legal_name || company.brand_name || 'EVOLW'}</Text>
            {companyLines.map((line, i) => (
              <Text key={i} style={s.brandSub}>
                {line}
              </Text>
            ))}
            {company.gstin ? <Text style={s.brandSub}>GSTIN: {company.gstin}</Text> : null}
            {company.email ? <Text style={s.brandSub}>{company.email}</Text> : null}
            {company.phone ? <Text style={s.brandSub}>{company.phone}</Text> : null}
          </View>

          <View>
            <Text style={s.docTitle}>QUOTATION</Text>
            <Text style={s.docNumber}>{quotation.quotation_number || 'DRAFT'}</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaValue}>{formatDocDate(quotation.date)}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Valid until</Text>
              <Text style={s.metaValue}>{formatDocDate(quotation.valid_until)}</Text>
            </View>
            {quotation.place_of_supply ? (
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Place of supply</Text>
                <Text style={s.metaValue}>{quotation.place_of_supply}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={s.parties}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Prepared for</Text>
            <Text style={s.partyName}>{client.company_name || quotation.client_name || 'Client'}</Text>
            {client.contact_person ? <Text style={s.partyLine}>{client.contact_person}</Text> : null}
            {clientLines.map((line, i) => (
              <Text key={i} style={s.partyLine}>
                {line}
              </Text>
            ))}
            {client.gstin ? <Text style={s.partyLine}>GSTIN: {client.gstin}</Text> : null}
            {client.email ? <Text style={s.partyLine}>{client.email}</Text> : null}
            {client.phone ? <Text style={s.partyLine}>{client.phone}</Text> : null}
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>From</Text>
            <Text style={s.partyName}>{company.legal_name || company.brand_name || 'EVOLW'}</Text>
            {company.website ? <Text style={s.partyLine}>{company.website}</Text> : null}
            {quotation.payment_terms ? (
              <Text style={[s.partyLine, { marginTop: 8 }]}>
                Payment terms: {quotation.payment_terms}
              </Text>
            ) : null}
          </View>
        </View>

        {quotation.subject ? (
          <View style={s.subject}>
            <Text style={s.subjectLabel}>Subject</Text>
            <Text style={s.subjectText}>{quotation.subject}</Text>
          </View>
        ) : null}

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, s.colSl]}>#</Text>
            <Text style={[s.th, s.colItem]}>Item / Description</Text>
            <Text style={[s.th, s.colHsn]}>HSN/SAC</Text>
            <Text style={[s.th, s.colQty]}>Qty</Text>
            <Text style={[s.th, s.colRate]}>Rate</Text>
            <Text style={[s.th, s.colTax]}>Tax %</Text>
            <Text style={[s.th, s.colAmt]}>Amount</Text>
          </View>
          {items.map((item: any, i: number) => {
            const amount =
              item.total != null
                ? Number(item.total)
                : Math.max(0, Number(item.quantity || 0) * Number(item.rate || 0) - Number(item.discount || 0));
            return (
              <View key={i} style={i % 2 === 1 ? [s.tableRow, s.tableRowAlt] : s.tableRow} wrap={false}>
                <Text style={[s.td, s.colSl]}>{i + 1}</Text>
                <View style={s.colItem}>
                  <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>{item.name}</Text>
                  {item.description ? <Text style={s.tdMuted}>{item.description}</Text> : null}
                </View>
                <Text style={[s.td, s.colHsn]}>{item.hsn_sac || '—'}</Text>
                <Text style={[s.td, s.colQty]}>
                  {item.quantity} {item.unit && item.unit !== 'Item' ? item.unit : ''}
                </Text>
                <Text style={[s.td, s.colRate]}>{formatInr(item.rate, currency)}</Text>
                <Text style={[s.td, s.colTax]}>{Number(item.tax_percentage || 0)}%</Text>
                <Text style={[s.td, s.colAmt]}>{formatInr(amount, currency)}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.totalsWrap}>
          <View style={s.bankBox}>
            <Text style={s.bankTitle}>Bank details</Text>
            {company.bank_name || company.account_number ? (
              <>
                {company.bank_name ? <Text style={s.partyLine}>Bank: {company.bank_name}</Text> : null}
                {company.account_holder ? (
                  <Text style={s.partyLine}>A/c name: {company.account_holder}</Text>
                ) : null}
                {company.account_number ? (
                  <Text style={s.partyLine}>A/c no: {company.account_number}</Text>
                ) : null}
                {company.ifsc_code ? <Text style={s.partyLine}>IFSC: {company.ifsc_code}</Text> : null}
                {company.upi_id ? <Text style={s.partyLine}>UPI: {company.upi_id}</Text> : null}
              </>
            ) : (
              <Text style={s.partyLine}>Add bank details in Billing Settings for client payments.</Text>
            )}
          </View>

          <View style={s.summaryBox}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryValue}>{formatInr(quotation.subtotal, currency)}</Text>
            </View>
            {Number(quotation.overall_discount_amount) > 0 ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Discount</Text>
                <Text style={s.summaryValue}>
                  − {formatInr(quotation.overall_discount_amount, currency)}
                </Text>
              </View>
            ) : null}
            {Number(quotation.cgst_amount) > 0 ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>CGST</Text>
                <Text style={s.summaryValue}>{formatInr(quotation.cgst_amount, currency)}</Text>
              </View>
            ) : null}
            {Number(quotation.sgst_amount) > 0 ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>SGST</Text>
                <Text style={s.summaryValue}>{formatInr(quotation.sgst_amount, currency)}</Text>
              </View>
            ) : null}
            {Number(quotation.igst_amount) > 0 ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>IGST</Text>
                <Text style={s.summaryValue}>{formatInr(quotation.igst_amount, currency)}</Text>
              </View>
            ) : null}
            {Number(quotation.total_tax) > 0 &&
            !Number(quotation.cgst_amount) &&
            !Number(quotation.igst_amount) ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Tax</Text>
                <Text style={s.summaryValue}>{formatInr(quotation.total_tax, currency)}</Text>
              </View>
            ) : null}
            {Number(quotation.adjustment) !== 0 ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Adjustment</Text>
                <Text style={s.summaryValue}>{formatInr(quotation.adjustment, currency)}</Text>
              </View>
            ) : null}
            <View style={s.grandRow}>
              <Text style={s.grandLabel}>Grand Total</Text>
              <Text style={s.grandValue}>
                {formatInr(quotation.grand_total ?? quotation.total, currency)}
              </Text>
            </View>
          </View>
        </View>

        {terms ? (
          <View style={s.terms}>
            <Text style={s.termsTitle}>Terms & conditions</Text>
            <Text style={s.termsBody}>{terms}</Text>
          </View>
        ) : null}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Thank you for considering EVOLW.</Text>
          <Text style={s.footerText}>Computer-generated quotation · www.evolw.in</Text>
        </View>
      </Page>
    </Document>
  );
}
