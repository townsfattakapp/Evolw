import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface CertificateData {
  id?: string;
  certId?: string;
  internName: string;
  role: string;
  startDate: string;
  endDate: string;
  performance: string;
}

const styles = StyleSheet.create({
  page: { 
    padding: 20, 
    fontFamily: 'Times-Roman',
    backgroundColor: '#fff',
    orientation: 'landscape'
  },
  borderOuter: {
    border: '4pt solid #1a202c',
    padding: 4,
    flex: 1, // Take full page height
  },
  borderInner: {
    border: '1pt solid #cbd5e1',
    flex: 1, // Take full height inside outer border
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  contentWrapper: {
    flex: 1, // Pushes footer to the bottom
    alignItems: 'center',
    paddingTop: 40,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    color: '#000',
    marginBottom: 5,
  },
  subLogo: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    letterSpacing: 2,
    color: '#666',
  },
  titleGroup: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 2,
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#64748b',
    letterSpacing: 1
  },
  presentedTo: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  nameBox: {
    width: '60%',
    borderBottom: '1pt solid #000',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 5,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  bodyTextContainer: {
    width: '80%',
    alignItems: 'center',
  },
  bodyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 1.8,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 50,
    paddingBottom: 40,
  },
  dateBlock: {
    width: 150,
    alignItems: 'center',
  },
  sealBlock: {
    width: 100,
    height: 100,
    borderRadius: 50,
    border: '3pt solid #ca8a04',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef08a'
  },
  sealText: {
    fontSize: 10,
    color: '#854d0e',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center'
  },
  signatureBlock: {
    width: 150,
    alignItems: 'center',
  },
  signatureLine: {
    borderTop: '1pt solid #000',
    width: '100%',
    paddingTop: 5,
    alignItems: 'center',
  },
  signatureName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  signatureTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#666',
    marginTop: 2
  },
  certId: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#94a3b8',
  }
});

export const CertificatePDF = ({ data }: { data: CertificateData }) => {
  const issueDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date());
  
  const formatDate = (d: string) => {
    if (!d) return '[Date]';
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(d));
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.borderInner}>
            
            <View style={styles.contentWrapper}>
              <View style={styles.headerGroup}>
                <Text style={styles.logo}>EVOLW</Text>
                <Text style={styles.subLogo}>INNOVATION. EXCELLENCE. GROWTH.</Text>
              </View>
              
              <View style={styles.titleGroup}>
                <Text style={styles.title}>CERTIFICATE OF COMPLETION</Text>
                <Text style={styles.subtitle}>INTERNSHIP PROGRAM</Text>
              </View>
              
              <Text style={styles.presentedTo}>This is proudly presented to</Text>
              
              <View style={styles.nameBox}>
                <Text style={styles.name}>{data.internName || '[Intern Name]'}</Text>
              </View>
              
              <View style={styles.bodyTextContainer}>
                <Text style={styles.bodyText}>
                  In recognition of their successful completion of the <Text style={styles.bold}>{data.role || '[Role]'}</Text> internship program at EVOLW. 
                  Their tenure from <Text style={styles.bold}>{formatDate(data.startDate)}</Text> to <Text style={styles.bold}>{formatDate(data.endDate)}</Text> 
                  was marked by dedication and excellent contribution. Their overall performance was rated as <Text style={styles.bold}>{data.performance}</Text>.
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.dateBlock}>
                <Text style={{ fontSize: 12, marginBottom: 5 }}>{issueDate}</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureName}>Date of Issue</Text>
                </View>
              </View>

              <View style={styles.sealBlock}>
                <Text style={styles.sealText}>EVOLW</Text>
                <Text style={styles.sealText}>VERIFIED</Text>
              </View>

              <View style={styles.signatureBlock}>
                <Text style={{ fontSize: 12, marginBottom: 5, color: '#fff' }}>HiddenText</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureName}>Authorized Signatory</Text>
                  <Text style={styles.signatureTitle}>Human Resources</Text>
                </View>
              </View>
            </View>

            <Text style={styles.certId}>ID: {data.certId || '[Pending Save]'} • Verify at evolw.in/verify</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
