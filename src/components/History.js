import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { getDocs, collection } from "firebase/firestore";
import Loading from "./Loading";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { Container } from "react-bootstrap";

function History() {
  const { authedUser } = useAuthentication();
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(transactions)

  useEffect(() => {
    async function getPort() {
      const res = await getDocs(
        collection(db, "crypto-accounts", authedUser.uid, "transactions")
      );
      return res;
    }

    async function fetchData() {
      await getPort().then((transactions) => {
        const transHistory = transactions.docs.map((data) => ({
          coin: data.id,
          ...data.data(),
        }));

        transHistory.sort(function (x, y) {
          // ------------------------------------------
          return new Date(x.time) - new Date(y.time);
        });
        setTransactions(transHistory);
        console.log(transactions)
        setLoading(false);
      });
    }
    if (authedUser.uid && loading) {
      // IS THIS OK---------------------------
      fetchData();
    }
  });

  if (loading) return <Loading />;

  return (
    <Container>
      <Container>
        <h1>History</h1>
      </Container>

      {transactions.map((transaction) => (
        transaction.coin
      ))}
    </Container>
  );
}

export default History;
