import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles for consolidated PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2pt solid #000000',
    paddingBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#666666'
  },
  padSeparator: {
    marginTop: 25,
    marginBottom: 15,
    borderTop: '1pt solid #cccccc',
    paddingTop: 15
  },
  padHeader: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 15,
    border: '1pt solid #dee2e6'
  },
  padTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  searchContext: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    marginBottom: 15,
    border: '1pt solid #bbdefb'
  },
  searchContextTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6
  },
  searchContextText: {
    fontSize: 10,
    marginBottom: 3
  },
  tableContainer: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderBottom: '1pt solid #000000'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #cccccc',
    padding: 4,
    minHeight: 25
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    padding: 2,
    textAlign: 'left'
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    padding: 2,
    textAlign: 'center'
  },
  slNoCell: {
    width: 30,
    textAlign: 'center'
  },
  dateCell: {
    width: 70
  },
  citationCell: {
    width: 100
  },
  partiesCell: {
    flex: 2
  },
  courtCell: {
    flex: 1
  },
  footer: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTop: '0.5pt solid #cccccc',
    paddingTop: 10
  },
  summaryBox: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    marginBottom: 20,
    border: '1pt solid #4a90e2'
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8
  },
  summaryText: {
    fontSize: 10,
    marginBottom: 4
  }
});

const AllPadsPrintDocument = ({ allPadsData, timestamp }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return dateString;
    const day = dateString.slice(0, 2);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(4, 8);
    return `${day}-${month}-${year}`;
  };

  const getTotalResults = () => {
    return allPadsData.reduce((total, pad) => total + (pad.resultCount || 0), 0);
  };

  const getSearchTypesSummary = () => {
    const searchTypes = allPadsData.map(pad => pad.searchContext?.type || 'Unknown');
    const uniqueTypes = [...new Set(searchTypes)];
    return uniqueTypes.join(', ');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Main Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Consolidated Pad Report
          </Text>
          <Text style={styles.subtitle}>
            All Saved Searches and Results
          </Text>
          <Text>Generated on: {timestamp}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Report Summary</Text>
          <Text style={styles.summaryText}>Total Pads: {allPadsData.length}</Text>
          <Text style={styles.summaryText}>Total Results: {getTotalResults()}</Text>
          <Text style={styles.summaryText}>Search Types: {getSearchTypesSummary()}</Text>
          <Text style={styles.summaryText}>
            Date Range: {allPadsData.length > 0 ? 
              `${new Date(Math.min(...allPadsData.map(p => new Date(p.savedAt)))).toLocaleDateString()} - ${new Date(Math.max(...allPadsData.map(p => new Date(p.savedAt)))).toLocaleDateString()}` 
              : 'N/A'}
          </Text>
        </View>

        {/* Individual Pads */}
        {allPadsData.map((pad, padIndex) => (
          <View key={pad.id} style={padIndex > 0 ? styles.padSeparator : {}}>
            {/* Pad Header */}
            <View style={styles.padHeader}>
              <Text style={styles.padTitle}>
                Pad {padIndex + 1} - {pad.resultCount} Results
              </Text>
              <Text style={{ fontSize: 10 }}>
                Saved: {new Date(pad.savedAt).toLocaleString()}
              </Text>
            </View>

            {/* Search Context */}
            {pad.searchContext && (
              <View style={styles.searchContext}>
                <Text style={styles.searchContextTitle}>Search Context</Text>
                <Text style={styles.searchContextText}>
                  Type: {pad.searchContext.type || 'Unknown'}
                </Text>
                <Text style={styles.searchContextText}>
                  Criteria: {pad.searchContext.displayText || 'No criteria'}
                </Text>
                <Text style={styles.searchContextText}>
                  Search Time: {pad.searchContext.timestamp ? 
                    new Date(pad.searchContext.timestamp).toLocaleString() : 'Unknown'}
                </Text>
              </View>
            )}

            {/* Results Table */}
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, styles.slNoCell]}>SL</Text>
                <Text style={[styles.tableCellHeader, styles.dateCell]}>Date</Text>
                <Text style={[styles.tableCellHeader, styles.citationCell]}>Citation</Text>
                <Text style={[styles.tableCellHeader, styles.partiesCell]}>Parties</Text>
                <Text style={[styles.tableCellHeader, styles.courtCell]}>Court</Text>
              </View>

              {/* Table Rows */}
              {pad.results && pad.results.length > 0 ? (
                pad.results.slice(0, 20).map((judgment, index) => ( // Limit to first 20 results per pad
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.slNoCell]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.tableCell, styles.dateCell]}>
                      {formatDate(judgment.judgmentDOJ)}
                    </Text>
                    <Text style={[styles.tableCell, styles.citationCell]}>
                      {judgment.judgmentCitation || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.partiesCell]}>
                      {judgment.judgmentParties || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.courtCell]}>
                      {judgment.courtName || 'N/A'}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { textAlign: 'center', flex: 1 }]}>
                    No data available
                  </Text>
                </View>
              )}

              {/* Show truncation notice if more than 20 results */}
              {pad.results && pad.results.length > 20 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { textAlign: 'center', flex: 1, fontStyle: 'italic' }]}>
                    ... and {pad.results.length - 20} more results (showing first 20)
                  </Text>
                </View>
              )}
            </View>

            {/* Pad Footer */}
            <View style={styles.footer}>
              <Text>
                Pad {padIndex + 1} Results: {pad.resultCount} | 
                Search: {pad.searchContext?.displayText || 'No criteria'}
              </Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default AllPadsPrintDocument;
