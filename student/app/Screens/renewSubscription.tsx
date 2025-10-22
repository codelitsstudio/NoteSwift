import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "react-native-paper";

export default function RenewSubscription() {

  const bankCards = [
    {
      bank: "ADRBank",
      name: "Hillary Nevelin",
      number: "8763 2736 9873 0329",
      expiry: "10/28",
      balance: "$1340.50",
    },
    {
      bank: "NeoPay",
      name: "Mike Adams",
      number: "6273 9873 1122 4321",
      expiry: "09/26",
      balance: "$980.25",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section with Cards */}
      <View style={styles.header}>
    
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {bankCards.map((card, index) => (
            <Card
              key={index}
              style={styles.bankCard}
              mode="contained"
            >
              <Card.Content>
                <View style={styles.cardTop}>
                  <Text style={styles.bankName}>{card.bank}</Text>
                  <MaterialIcons name="refresh" size={20} color="white" />
                </View>

                <Text style={styles.balance}>{card.balance}</Text>

                <View style={{ marginTop: 20 }}>
                  <Text style={styles.cardHolder}>{card.name}</Text>
                  <Text style={styles.cardNumber}>{card.number}</Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.expiry}>{card.expiry}</Text>
                    <View style={{ flexDirection: "row" }}>
                      <MaterialIcons name="lens" size={20} color="#eb001b" />
                      <MaterialIcons
                        name="lens"
                        size={20}
                        color="#f79e1b"
                        style={{ marginLeft: -8 }}
                      />
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Price and Days Left */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>$19.00</Text>
        <Text style={styles.daysLeft}>2 days left</Text>
      </View>

      {/* Billing Details */}
      <Text style={styles.billingTitle}>BILLING DETAILS</Text>

      {/* Plan Detail */}
      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Plan Detail</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>Premium Plan</Text>
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment */}
      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Payment</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>•••• 4567</Text>
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Duration */}
      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Duration</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>1 Month</Text>
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Renew Button */}
      <TouchableOpacity style={styles.renewButton}>
        <Text style={styles.renewText}>Renew Subscription</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  header: {
    backgroundColor: "#121212",
    paddingBottom: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 16,
    paddingTop: 45,
  },
  
  bankCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 18,
    marginRight: 14,
    width: 300,
    paddingVertical: 7,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankName: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  balance: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 12,
  },
  cardHolder: {
    color: "white",
    fontWeight: "600",
  },
  cardNumber: {
    color: "#ccc",
    letterSpacing: 2,
    marginTop: 2,
    fontSize: 13,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  expiry: {
    color: "#999",
    fontSize: 13,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  price: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  daysLeft: {
    fontSize: 15,
    color: "#666",
  },
  billingTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 13,
    color: "#000",
    paddingHorizontal: 18,
  },
  detailBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 13,
    marginBottom: 13,
    marginHorizontal: 18,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  changeButton: {
    backgroundColor: "#E6E6E6",
    borderRadius: 11,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  changeText: {
    fontSize: 13,
    color: "#333",
  },
  renewButton: {
    backgroundColor: "#007AFF",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
    marginHorizontal: 18,
    marginBottom: 28,
  },
  renewText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
