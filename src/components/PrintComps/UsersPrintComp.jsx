import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
Font.registerHyphenationCallback(() => []);

// Create styles (same as Project A)
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
    borderColor: 'grey',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderColor: 'grey',
  },
  tableHead: {
    flexDirection: 'row',
    fontWeight: 'bold',
    borderColor: 'grey',
  },
  small: {
    width: '14%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: 'grey',
    
  },
  wide: {
    width: '30%',
    padding: '10px',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: 'grey',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    padding: 2,
    fontSize: 8,
    borderColor: 'grey',
    color: 'black',
   hyphenationCallback: () => [], // Prevent hyphenation
  wordWrap: 'break-word',
 
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
});

// Helper to chunk data
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// MyDocument Component (Adapted for Project B)
const MyDocument = ({ data, timestamp }) => {
  const dataChunks = chunkArray(data, 13); // Adjust chunk size if needed

  return (
    <Document>
      {dataChunks.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Text style={styles.header}>
            <Text>User Table Data</Text>
          </Text>
          <Text style={styles.subheader}>Number of Users: {data.length}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>

          <View style={styles.table}>
            <View style={styles.tableHead}>
             
              <View style={styles.wide}><Text style={styles.tableCell}>Username</Text></View>
              <View style={styles.wide}><Text style={styles.tableCell}>Email</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>Role</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>Subscription</Text></View>
              <View style={styles.small}><Text style={styles.tableCell}>Creation Date</Text></View>
            </View>

            {chunk.map((user, rowIndex) => (
              <View style={styles.tableRow} key={rowIndex}>
                
                <View style={styles.wide}><Text style={styles.tableCell}>{user.username}</Text></View>
                <View style={styles.wide}><Text style={styles.tableCell}>{user.email}</Text></View>
                <View style={styles.small}><Text style={styles.tableCell}>{user.role}</Text></View>
                <View style={styles.small}><Text style={styles.tableCell}>{user.subscriptionStatus}</Text></View>
                <View style={styles.small}><Text style={styles.tableCell}>{user.creationDate}</Text></View>
              </View>
            ))}
          </View>

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
          <Text fixed style={styles.footer}>© 2024 Project B. All rights reserved.</Text>
        </Page>
      ))}
    </Document>
  );
};

export default MyDocument;
