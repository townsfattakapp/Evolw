import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface OfferData {
  id?: string;
  refId?: string;
  employmentType: 'Full-Time' | 'Internship';
  candidateName: string;
  address: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  doj: string;
  probation: string;
  notice: string;
  reportingTo: string;
  annualCtc: string;
  basic: string;
  hra: string;
  pf: string;
  specialAllowance: string;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.5, color: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', lineHeight: 1, marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666', lineHeight: 1 },
  headerRight: { textAlign: 'right', fontSize: 10, color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  subject: { textAlign: 'center', fontWeight: 'bold', fontSize: 14, textDecoration: 'underline', marginVertical: 20 },
  paragraph: { marginBottom: 10, textAlign: 'justify' },
  section: { marginLeft: 15, marginBottom: 10 },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50, width: '100%' },
  signBlock: { width: 150 },
  line: { borderTop: '1px solid #000', marginTop: 40, marginBottom: 5 },
  table: { display: "flex", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: '#000', borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row", width: "100%" },
  tableColHeader: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderColor: '#000', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f3f4f6' },
  tableCol: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderColor: '#000', borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
  tableCell: { margin: 5, fontSize: 10 },
  tableCellRight: { margin: 5, fontSize: 10, textAlign: 'right' },
  note: { fontSize: 9, color: '#666', marginTop: 10, textAlign: 'justify' }
});

const formatCurrency = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 'Rs 0';
  return 'Rs ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
};

export const OfferLetterPDF = ({ data }: { data: OfferData }) => {
  const currentDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date());
  const formattedDoj = data.doj ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(data.doj)) : '[Date of Joining]';
  const isIntern = data.employmentType === 'Internship';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EVOLW</Text>
            <Text style={styles.subtitle}>Waraseoni, Dist Balaghat, M.P, India</Text>
          </View>
          <View style={styles.headerRight}>
            <Text>contact@evolw.in</Text>
            <Text>www.evolw.in</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text>Date: {currentDate}</Text>
          <Text>Ref: {data.refId || '[Pending Save]'}</Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text>To,</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 5 }}>{data.candidateName || '[Candidate Name]'}</Text>
          <Text>{data.address || '[Candidate Address]'}</Text>
          <Text>Email: {data.email || '[Candidate Email]'}</Text>
          <Text>Phone: {data.phone || '[Candidate Phone]'}</Text>
        </View>

        <Text style={styles.subject}>Subject: Offer of {isIntern ? 'Internship' : 'Employment'}</Text>

        <Text style={styles.paragraph}>Dear {data.candidateName ? data.candidateName.split(' ')[0] : '[Name]'},</Text>
        
        <Text style={styles.paragraph}>
          We are pleased to offer you the position of {data.designation || '[Designation]'} at EVOLW in the {data.department || '[Department]'} department. We feel that your skills and background will be valuable assets to our team.
        </Text>

        <Text style={styles.paragraph}>
          Your scheduled date of joining will be {formattedDoj}. You will be reporting directly to the {data.reportingTo || '[Reporting Manager]'}.
        </Text>

        <View style={styles.section}>
          {isIntern ? (
            <Text style={styles.paragraph}>1. Stipend: Your consolidated monthly stipend will be {formatCurrency(data.annualCtc)}.</Text>
          ) : (
            <Text style={styles.paragraph}>1. Compensation: Your Annual Cost to Company (CTC) will be {formatCurrency(data.annualCtc)}. The detailed breakdown of your salary is provided in Annexure A.</Text>
          )}

          {!isIntern && (
            <Text style={styles.paragraph}>2. Probation: You will be on a probation period of {data.probation || '6'} months from your date of joining. Upon successful completion, your employment will be confirmed.</Text>
          )}

          <Text style={styles.paragraph}>{isIntern ? '2' : '3'}. Notice Period: {isIntern ? 'Either' : 'During probation or after confirmation, either'} party may terminate this agreement by providing {data.notice || '30'} days of written notice.</Text>
          
          <Text style={styles.paragraph}>{isIntern ? '3' : '4'}. Confidentiality: You will be required to sign a Non-Disclosure Agreement (NDA) ensuring the confidentiality of all proprietary company information.</Text>
        </View>

        <Text style={styles.paragraph}>
          Please signify your acceptance of these terms and conditions by signing and returning the duplicate copy of this letter. We look forward to welcoming you to the EVOLW family.
        </Text>

        <View style={styles.signatures}>
          <View style={styles.signBlock}>
            <Text>For EVOLW,</Text>
            <View style={styles.line} />
            <Text style={{ fontWeight: 'bold' }}>Authorized Signatory</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>Human Resources Dept.</Text>
          </View>
          <View style={styles.signBlock}>
            <Text>Accepted By,</Text>
            <View style={styles.line} />
            <Text style={{ fontWeight: 'bold' }}>{data.candidateName || '[Candidate Name]'}</Text>
            <Text style={{ fontSize: 9, color: '#666' }}>Date: ________________</Text>
          </View>
        </View>
      </Page>

      {!isIntern && (
        <Page size="A4" style={styles.page}>
          <Text style={[styles.subject, { marginTop: 0 }]}>Annexure A: Compensation Breakdown</Text>
          
          <View style={styles.row}>
            <Text><Text style={{ fontWeight: 'bold' }}>Name: </Text>{data.candidateName || '[Candidate Name]'}</Text>
            <Text><Text style={{ fontWeight: 'bold' }}>Designation: </Text>{data.designation || '[Designation]'}</Text>
          </View>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Salary Components</Text></View>
              <View style={styles.tableColHeader}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Monthly</Text></View>
              <View style={styles.tableColHeader}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Annually</Text></View>
            </View>
            {/* Basic */}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Basic Salary</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(parseFloat(data.basic) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(data.basic)}</Text></View>
            </View>
            {/* HRA */}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>House Rent Allowance (HRA)</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(parseFloat(data.hra) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(data.hra)}</Text></View>
            </View>
            {/* Special */}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Special Allowance</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(parseFloat(data.specialAllowance) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(data.specialAllowance)}</Text></View>
            </View>
            {/* Gross */}
            <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
              <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Gross Salary (A)</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency((parseFloat(data.basic) + parseFloat(data.hra) + parseFloat(data.specialAllowance)) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(parseFloat(data.basic) + parseFloat(data.hra) + parseFloat(data.specialAllowance))}</Text></View>
            </View>
            
            {/* Employer Contributions */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%', backgroundColor: '#f3f4f6' }]}><Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'center' }]}>Employer Contributions</Text></View>
            </View>
            
            {/* PF */}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Provident Fund (PF)</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(parseFloat(data.pf) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellRight}>{formatCurrency(data.pf)}</Text></View>
            </View>
            {/* Total Benefits */}
            <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
              <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Total Benefits (B)</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(parseFloat(data.pf) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(data.pf)}</Text></View>
            </View>

            {/* CTC */}
            <View style={[styles.tableRow, { backgroundColor: '#000', color: '#fff' }]}>
              <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Cost To Company (A + B)</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(parseFloat(data.annualCtc) / 12)}</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(data.annualCtc)}</Text></View>
            </View>
          </View>

          <Text style={styles.note}>
            * Note: Income Tax and other statutory deductions will be applicable as per prevailing government laws. The employee is responsible for their own tax declarations. 
          </Text>
          <Text style={styles.note}>
            * Gratuity is payable as per the Payment of Gratuity Act, 1972 upon completion of 5 continuous years of service. It is not calculated in the immediate monthly gross above but is a statutory benefit.
          </Text>
          
          <Text style={{ textAlign: 'center', fontSize: 8, color: '#999', marginTop: 40 }}>CONFIDENTIAL - INTERNAL PURPOSES ONLY</Text>
        </Page>
      )}
    </Document>
  );
};
