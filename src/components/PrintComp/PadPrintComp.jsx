import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
Font.registerHyphenationCallback(word => [word]);

// Create styles EXACTLY like your working example
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subheader: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 9,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#E34A3E',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderColor: '#E34A3E',
  },
  tableHead: {
    flexDirection: 'row',
    fontWeight: 'bold',
    borderColor: '#E34A3E',
  },
  
  // Column styles - exactly like your pattern with different names
  serialCol: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E34A3E',
  },
  dateCol: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E34A3E',
  },
  citationCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E34A3E',
  },
  partiesCol: {
    width: '35%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E34A3E',
  },
  courtCol: {
    width: '17%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E34A3E',
  },
  
  // EXACT tableCell from your working example
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    padding: 2,
    fontSize: 8,
    borderColor: '#E34A3E',
    color: 'black',
    hyphenationCallback: () => [],
  },
  
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 10,
    right: 5,
    textAlign: 'center',
  },
  timestamp: {
    position: 'absolute',
    right: 5,
    top: 5,
    fontSize: 9,
  },
  
  // Header styles
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 170,
    height: 'auto',
  },
});

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const PadPrintDocument = ({ padData, timestamp, user = null, aldlogo = null }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return dateString;
    const day = dateString.slice(0, 2);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(4, 8);
    return `${day}-${month}-${year}`;
  };

  const searchQueryText = padData.searchContext 
    ? `${padData.searchContext.type}: ${padData.searchContext.displayText}`
    : '';

  const results = padData.results || [];
  const dataChunks = chunkArray(results, 12);

  return (
    <Document>
      {dataChunks.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header section */}
          <View style={styles.headerRow}>
            {aldlogo ? (
              <Image style={styles.logo} src={aldlogo} />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>ALD Online</Text>
            )}
          </View>
          
          {/* Timestamp - exactly like your example */}
          <Text style={styles.timestamp}>{timestamp}</Text>
          
          {/* Title and search info - exactly like your structure */}
          <Text style={styles.header}>
            <Text>Pad Results</Text>
          </Text>
          <Text style={styles.subheader}>Search Query:</Text>
          <Text style={styles.subheader}>
            {searchQueryText && <Text> {searchQueryText}</Text>}
          </Text>
          <Text style={styles.subheader}>No of Results: {results.length}</Text>
          
          {/* Table - EXACTLY like your working structure */}
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <View style={styles.serialCol}><Text style={styles.tableCell}>SL</Text></View>
              <View style={styles.dateCol}><Text style={styles.tableCell}>Date of Judgment</Text></View>
              <View style={styles.citationCol}><Text style={styles.tableCell}>Citation</Text></View>
              <View style={styles.partiesCol}><Text style={styles.tableCell}>Parties</Text></View>
              <View style={styles.courtCol}><Text style={styles.tableCell}>Court</Text></View>
            </View>
            {chunk.map((judgment, rowIndex) => (
              <View style={styles.tableRow} key={rowIndex}>
                <View style={styles.serialCol}><Text style={styles.tableCell}>{pageIndex * 12 + rowIndex + 1}</Text></View>
                <View style={styles.dateCol}><Text style={styles.tableCell}>{formatDate(judgment.judgmentDOJ)}</Text></View>
                <View style={styles.citationCol}><Text style={styles.tableCell}>{judgment.judgmentCitation || 'N/A'}</Text></View>
                <View style={styles.partiesCol}><Text style={styles.tableCell}>{judgment.judgmentParties || 'N/A'}</Text></View>
                <View style={styles.courtCol}><Text style={styles.tableCell}>{judgment.courtName || 'N/A'}</Text></View>
              </View>
            ))}
          </View>
          
          {/* Page number - exactly like your example */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
          
          {/* Footer */}
          <Text fixed style={styles.footer}>Licensed to {user?.displayName || 'User'} | Copyright © Andhra Legal Decisions</Text>
        </Page>
      ))}
    </Document>
  );
};

export default PadPrintDocument;
