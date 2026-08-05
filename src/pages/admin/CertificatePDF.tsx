import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Image } from '@react-pdf/renderer';

interface CertificateData {
  id?: string;
  certId?: string;
  internName: string;
  role: string;
  startDate: string;
  endDate: string;
  performance: string;
  hrSignature?: string;
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
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundGraphics: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
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
  signatureImage: {
    width: 120,
    height: 40,
    objectFit: 'contain',
    marginBottom: 5,
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
            
            {/* Techy Background Design */}
            <View style={styles.backgroundGraphics}>
              <Svg viewBox="0 0 842 595" width="100%" height="100%" opacity={0.3}>
                {/* Left side tech circuit */}
                <Path d="M 0 100 L 150 100 L 200 150 L 200 250 L 250 300" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
                <Circle cx="250" cy="300" r="4" fill="#93c5fd" />
                
                <Path d="M 0 150 L 100 150 L 120 170 L 120 400 L 150 430" fill="none" stroke="#93c5fd" strokeWidth="0.5" />
                <Circle cx="150" cy="430" r="2" fill="#93c5fd" />
                
                <Path d="M 50 595 L 50 500 L 150 400 L 300 400 L 350 350" fill="none" stroke="#93c5fd" strokeWidth="1" />
                <Circle cx="350" cy="350" r="3" fill="none" stroke="#93c5fd" strokeWidth="1" />

                {/* Right side tech circuit */}
                <Path d="M 842 450 L 700 450 L 650 400 L 650 250 L 600 200" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
                <Circle cx="600" cy="200" r="4" fill="#93c5fd" />
                
                <Path d="M 842 500 L 750 500 L 700 450 L 700 200 L 650 150" fill="none" stroke="#93c5fd" strokeWidth="0.5" />
                <Circle cx="650" cy="150" r="2" fill="#93c5fd" />
                
                <Path d="M 750 0 L 750 100 L 650 200 L 500 200 L 450 250" fill="none" stroke="#93c5fd" strokeWidth="1" />
                <Circle cx="450" cy="250" r="3" fill="none" stroke="#93c5fd" strokeWidth="1" />
                
                {/* Geometric accents / dots */}
                <Circle cx="50" cy="50" r="1" fill="#e2e8f0" />
                <Circle cx="90" cy="50" r="1" fill="#e2e8f0" />
                <Circle cx="130" cy="50" r="1" fill="#e2e8f0" />
                <Circle cx="170" cy="50" r="1" fill="#e2e8f0" />
                <Circle cx="210" cy="50" r="1" fill="#e2e8f0" />
                
                <Circle cx="630" cy="550" r="1" fill="#e2e8f0" />
                <Circle cx="670" cy="550" r="1" fill="#e2e8f0" />
                <Circle cx="710" cy="550" r="1" fill="#e2e8f0" />
                <Circle cx="750" cy="550" r="1" fill="#e2e8f0" />
                <Circle cx="790" cy="550" r="1" fill="#e2e8f0" />
                
                {/* Subtitle Tech Box */}
                <Path d="M 350 480 L 492 480 L 492 500 L 350 500 Z" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                <Path d="M 352 482 L 358 482 M 490 498 L 484 498" fill="none" stroke="#93c5fd" strokeWidth="1" />
              </Svg>
            </View>

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
                {data.hrSignature ? (
                  <Image src={data.hrSignature} style={styles.signatureImage} />
                ) : (
                  <Text style={{ fontSize: 12, marginBottom: 5, color: '#fff' }}>HiddenText</Text>
                )}
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
