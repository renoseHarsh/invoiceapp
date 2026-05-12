import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToStream,

} from "@react-pdf/renderer";

import type { GetInvoiceData } from "shared";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
  },

  title: {
    fontSize: 24,
    marginBottom: 24,
  },

  section: {
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: 700,
  },

  tableRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  colDescription: {
    width: "40%",
  },

  colQty: {
    width: "20%",
  },

  colPrice: {
    width: "20%",
  },

  colTotal: {
    width: "20%",
  },
});

type Props = {
  invoice: GetInvoiceData
}

export function InvoicePdf({ invoice }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Invoice
        </Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Invoice Number</Text>
            <Text>{invoice.number}</Text>
          </View>

          <View style={styles.row}>
            <Text>Status</Text>
            <Text>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text>
            Customer: {invoice.customerName}
          </Text>

          <Text>
            Email: {invoice.customerEmail}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>
              Description
            </Text>

            <Text style={styles.colQty}>
              Qty
            </Text>

            <Text style={styles.colPrice}>
              Price
            </Text>

            <Text style={styles.colTotal}>
              Total
            </Text>
          </View>

          {invoice.lineItems.map((item, index) => (
            <View
              key={index}
              style={styles.tableRow}
            >
              <Text style={styles.colDescription}>
                {item.description}
              </Text>

              <Text style={styles.colQty}>
                {item.quantity}
              </Text>

              <Text style={styles.colPrice}>
                {item.unitPriceMinor / 100}
              </Text>

              <Text style={styles.colTotal}>
                {(item.quantity *
                  item.unitPriceMinor) /
                  100}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Subtotal</Text>

            <Text>
              {invoice.subtotalMinor / 100}{" "}
              {invoice.currency}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Tax</Text>

            <Text>
              {invoice.taxMinor / 100}{" "}
              {invoice.currency}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Total</Text>

            <Text>
              {invoice.totalMinor / 100}{" "}
              {invoice.currency}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export const generatePdfStream = async (invoiceData: GetInvoiceData) => {
  return await renderToStream(<InvoicePdf invoice={invoiceData} />);
};
