// MyJudgmentDocument.js
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import title from "../../assets/DASHTitle/Title.png";

// Register fonts

const styles = StyleSheet.create({
  
  page: {
    padding: 40,
    backgroundColor: "#ececec",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    textAlign: "justify",
    lineHeight: 1.5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  mainHeading: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeading: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },
  metaDataSection: {
    marginBottom: 15,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 10,
  },
  metaData: {
    fontSize: 11,
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  judgmentSection: {
    marginTop: 20,
    paddingTop: 10,
  },
  judgmentHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 11,
    textAlign: "justify",
    lineHeight: 1.5,
    marginBottom: 8,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paraNumber: {
    width: "auto",
    marginRight: 5,
  },
  paraText: {
    flex: 1,
    flexWrap: "wrap",
  },
  counselSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  counselText: {
    fontSize: 12,
    marginBottom: 5,
  },
  citationSection: {
    marginTop: 10,
    paddingLeft: 20,
  },
  citationText: {
    fontSize: 11,
    marginBottom: 3,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    right: 20,
    color: "#666",
  },
  paraWrapper: {
    margin: "10 0",
  },
  paraRow: {
    display: "flex",
    flexDirection: "row",
  },
  numberCol: {
    width: "auto",
    marginRight: 5,
    fontSize: 10,
  },
  textCol: {
    flex: 1,
    flexWrap: "wrap",
    fontSize: 12,
    textAlign: "justify",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  timestamp: {
    fontSize: 8,
    color: "#666",
    position: "absolute",
    top: 10,
    right: 40,
    whiteSpace: "nowrap",
    width: "auto",
  },
  logo: {
    width: 170,
    height: 30,
    alignSelf: "center",
    marginBottom: 10,
    filter: "brightness(0) invert(1)",
  },
  table: {
    width: "100%",
    marginVertical: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#000",
    minHeight: 20,
  },
  tableCellText: {
    fontSize: 8,
    textAlign: "center",
    margin: "2 0",
  },
});

const ParagraphWithNumber = ({ number, text }) => {
  // Function to check if text contains HTML
  const isHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);

  // Function to parse and render table
  const renderTable = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const tables = doc.getElementsByTagName("table");

    if (tables.length > 0) {
      return Array.from(tables).map((table, tableIndex) => {
        const rows = Array.from(table.rows);
        return (
          <View key={tableIndex} style={styles.table}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {Array.from(row.cells).map((cell, cellIndex) => {
                  // Split cell text into words for wrapping
                  const cellText = cell.textContent.trim();
                  const words = cellText.split(" ");
                  const lines = [];
                  let currentLine = "";

                  words.forEach((word) => {
                    if ((currentLine + " " + word).length > 100) {
                      lines.push(currentLine);
                      currentLine = word;
                    } else {
                      currentLine = currentLine
                        ? `${currentLine} ${word}`
                        : word;
                    }
                  });
                  if (currentLine) {
                    lines.push(currentLine);
                  }

                  return (
                    <View key={cellIndex} style={styles.tableCell}>
                      {lines.map((line, lineIndex) => (
                        <Text key={lineIndex} style={styles.tableCellText}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        );
      });
    }
    return null;
  };

  // Split text into words for regular paragraphs
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  if (isHtml(text)) {
    return (
      <View style={styles.paraWrapper}>
        <View style={styles.paraRow}>
          <View style={styles.numberCol}>
            <Text>{number}.</Text>
          </View>
          <View style={styles.textCol}>{renderTable(text)}</View>
        </View>
      </View>
    );
  }

  // Handle regular text
  words.forEach((word) => {
    if ((currentLine + " " + word).length > 90) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  return (
    <View style={styles.paraWrapper}>
      <View style={styles.paraRow}>
        <View style={styles.numberCol}>
          <Text>{number}.</Text>
        </View>
        <View style={styles.textCol}>
          {lines.map((line, index) => (
            <Text key={index}>{line}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const MyJudgmentDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Logo and Timestamp Section */}
      <View style={styles.headerSection}>
        <Image
          src={title} // Make sure the path is correct
        />
        <Text style={styles.timestamp}>
          {new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </Text>
      </View>

      {/* Court and Citation Header */}
      <Text style={styles.mainHeading}>{data.judgmentCourtText}</Text>

      {/* Meta Data Section */}
      <View style={styles.metaDataSection}>
        <Text style={styles.metaData}>Citation: {data.judgmentCitation}</Text>
        <Text style={styles.metaData}>
          Date of Judgment: {data.judgmentDOJ}
        </Text>
        <Text style={styles.metaData}>
          Petitioner: {data.judgmentPetitioner}
        </Text>
        <Text style={styles.metaData}>
          Respondent: {data.judgmentRespondent}
        </Text>
        <Text style={styles.metaData}>Judges: {data.judgmentJudges}</Text>
      </View>

      {/* Counsel Section */}
      <View style={styles.counselSection}>
        {data.judgmentPetitionerCouncil && (
          <Text style={styles.counselText}>
            Petitioner Counsel: {data.judgmentPetitionerCouncil}
          </Text>
        )}
        {data.judgmentRespondentCouncil && (
          <Text style={styles.counselText}>
            Respondent Counsel: {data.judgmentRespondentCouncil}
          </Text>
        )}
      </View>

      {/* Judgment Text Sections */}
      {data.JudgmentTexts.map((text, idx) => (
        <View key={idx} style={styles.judgmentSection}>
          {/* Judgment Paragraphs */}
          {text.JudgmentTextParas.map((para, index) => (
            <ParagraphWithNumber
              key={index}
              number={para.judgementTextParaNo}
              text={para.judgementTextParaText}
            />
          ))}

          {/* Citations Section */}
          {text.judgmentsCiteds && text.judgmentsCiteds.length > 0 && (
            <View style={styles.citationSection}>
              <Text style={styles.subHeading}>Cases Cited:</Text>
              {text.judgmentsCiteds.map((citation, index) => (
                <Text key={index} style={styles.citationText}>
                  {citation.judgmentsCitedParties}{" "}
                  {citation.judgmentsCitedRefferedCitation}
                  {citation.judgmentsCitedEqualCitation &&
                    `, ${citation.judgmentsCitedEqualCitation}`}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.judgmentHeader}>
            Delivered By: {text.judgementTextDeliveredBy}
          </Text>
        </View>
      ))}

      {/* Page Numbers */}
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </Page>
  </Document>
);

export default MyJudgmentDocument;
