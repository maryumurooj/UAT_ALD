import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a hyphenation callback to prevent unwanted word breaks
Font.registerHyphenationCallback(() => []);

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    backgroundColor: '#f9f9f9', // Light background for the page
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50', // Dark blue-gray for the header
  },
  subheader: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 9,
    color: '#7f8c8d', // Gray for the subheader
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#bdc3c7', // Light gray for borders
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: '#ffffff', // White background for the table
  },
  tableRow: {
    flexDirection: 'row',
    borderColor: '#bdc3c7',
  },
  tableHead: {
    flexDirection: 'row',
    fontWeight: 'bold',
    borderColor: '#bdc3c7',
    backgroundColor: '#f0f0f0', // Blue background for the header row
    color: '#ffffff', // White text for the header row
  },
  wide: {
    width: '28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bdc3c7',
  },
  small: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bdc3c7',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    padding: 10,
    fontSize: 8,
    borderColor: '#bdc3c7',
    color: '#2c3e50', // Dark blue-gray for text
    textAlign: 'center',
    wordWrap: 'break-word',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#7f8c8d', // Gray for the footer
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 10,
    right: 5,
    textAlign: 'center',
    color: '#7f8c8d', // Gray for the page number
  },
  timestamp: {
    position: 'absolute',
    right: 5,
    top: 5,
    fontSize: 9,
    color: '#7f8c8d', // Gray for the timestamp
  },
});

// MyDocument Component for Subscription Table
const MyDocument = ({ data, timestamp }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>Subscription Data</Text>
        <Text style={styles.subheader}>Number of Subscriptions: {data.length}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHead}>
            <View style={styles.wide}><Text style={styles.tableCell}>Username</Text></View>
            <View style={styles.wide}><Text style={styles.tableCell}>Plan</Text></View>
            <View style={styles.small}><Text style={styles.tableCell}>Status</Text></View>
            <View style={styles.small}><Text style={styles.tableCell}>Price</Text></View>
            <View style={styles.small}><Text style={styles.tableCell}>Duration (Days)</Text></View>
            <View style={styles.small}><Text style={styles.tableCell}>Creation Date</Text></View>
            <View style={styles.small}><Text style={styles.tableCell}>Ending Date</Text></View>
          </View>

          {/* Table Rows */}
          {data.map((sub, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <View style={styles.wide}><Text style={styles.tableCell}>{sub.username}</Text></View>
              <View style={styles.wide}><Text style={styles.tableCell}>{sub.planName}</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>{sub.subscriptionStatus}</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>{sub.price}</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>{sub.duration}</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>{sub.creationDate}</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>{sub.endingDate}</Text></View>
            </View>
          ))}
        </View>

        {/* Page Number and Footer */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        <Text fixed style={styles.footer}>© 2024 Project B. All rights reserved.</Text>
      </Page>
    </Document>
  );
};

export default MyDocument;