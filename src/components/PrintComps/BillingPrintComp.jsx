import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  subheader: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 10,
    color: '#666',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    textAlign: 'left',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    wordWrap: 'break-word',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

const BillingPrintComp = ({ data, timestamp }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Billing Users Report</Text>
      <Text style={styles.subheader}>Generated on: {timestamp}</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { width: '20%' }]}>First Name</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Last Name</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Phone</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>City</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Pay Method</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Payment Status</Text>
        </View>
        {/* Table Rows */}
        {data.map((bill, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={[styles.tableCell, { width: '20%' }]}>{bill.firstName}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>{bill.lastName}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{bill.phone}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{bill.city}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{bill.paymentMethod}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{bill.payment}</Text>
          </View>
        ))}
      </View>
      <Text fixed style={styles.footer}>© 2024 Billing Report. All rights reserved.</Text>
    </Page>
  </Document>
);

export default BillingPrintComp;