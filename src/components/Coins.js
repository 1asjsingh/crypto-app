import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axios";
import "./Coins.css";
import { getCurrencies } from "./requests.js";
import Loading from "./Loading";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { Col, Container, Row } from "react-bootstrap";
import { BsFillArrowUpCircleFill, BsFillArrowDownCircleFill } from "react-icons/bs";

function Coins() {
  const [coins, setCoins] = useState([]);
  const [tableView, setTableView] = useState(false);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("");
  const [order, setOrder] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      await axios
        .get(getCurrencies(localStorage.getItem("currency").substring(0, 3)))
        .then((req) => {
          setCoins(req.data);
        })
        .catch((e) => {
          alert(e);
        });
    }
    getData();
  }, []);

  const switchView = () => {
    if (tableView) {
      setTableView(false);
    } else {
      setTableView(true);
    }
  };

  const sortTable = (col) => {
    const currOrder = sortCol === col && order === "ASC" ? "DESC" : "ASC";
    setSortCol(col);
    setOrder(currOrder)
    if (currOrder === "ASC") {
      if (col === "current_price") {
        setCoins(
          [...coins].sort((a, b) =>
            parseFloat(a[col]) > parseFloat(b[col]) ? 1 : -1
          )
        );
      } else {
        setCoins([...coins].sort((a, b) => (a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1)));
      }
    }
    
    if (currOrder === "DESC") {
      if (col === "current_price") {
        setCoins(
          [...coins].sort((a, b) =>
            parseFloat(a[col]) > parseFloat(b[col]) ? -1 : 1
          )
        );
      } else {
        setCoins([...coins].sort((a, b) => (a[col].toLowerCase() > b[col].toLowerCase() ? -1 : 1)));
      }
    }
  };

  if (coins.length === 0) return <Loading />;

  return (
    <Container>
      <Row>
        <Col>
          <Button
            variant="primary"
            onClick={switchView}
            style={{ background: "red", border: "red", borderRadius: "25px" }}
          >
            Switch View
          </Button>
        </Col>

        <Col>
          <input
            className="form-control"
            placeholder="Search"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </Col>
      </Row>
      {tableView ? (
        <Table responsive className="coin-table" style={{ color: "white" }}>
          <thead>
            <tr>
              <th>Icon</th>
              <th onClick={() => sortTable("name")}>Name {sortCol === "name" ? (order === "ASC" ? <BsFillArrowUpCircleFill /> : <BsFillArrowDownCircleFill />) : ''}</th>
              <th onClick={() => sortTable("symbol")}>
                Symbol {sortCol === "symbol" ? (order === "ASC" ? <BsFillArrowUpCircleFill /> : <BsFillArrowDownCircleFill />) : ''}
              </th>
              <th onClick={() => sortTable("current_price")}>Price {sortCol === "current_price" ? (order === "ASC" ? <BsFillArrowUpCircleFill /> : <BsFillArrowDownCircleFill />) : ''}</th>
            </tr>
          </thead>
          <tbody>
            {coins
              .filter((term) => {
                if (search === "") {
                  return term;
                } else if (
                  term.name.toLowerCase().includes(search.toLowerCase()) ||
                  term.symbol.toLowerCase().includes(search.toLowerCase())
                ) {
                  return term;
                }
              })
              .map((coin) => (
                <tr
                  className="tableRow"
                  key={coin.symbol}
                  onClick={() => navigate(`/${coin.id}`)}
                >
                  <td>
                    <img
                      className="card-img"
                      src={coin.image}
                      alt="currency icon"
                    />
                  </td>
                  <td>{coin.name}</td>
                  <td>{coin.symbol.toUpperCase()}</td>
                  <td>
                    {localStorage.getItem("currency").substring(3, 4)}
                    {coin.current_price.toLocaleString("en-GB", {
                      maximumFractionDigits: 20,
                    })}
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      ) : (
        <div className="row">
          {coins
            .filter((term) => {
              if (search === "") {
                return term;
              } else if (
                term.name.toLowerCase().includes(search.toLowerCase()) ||
                term.symbol.toLowerCase().includes(search.toLowerCase())
              ) {
                return term;
              }
            })
            .map((coin) => (
              <div className="card" key={coin.symbol}>
                <div className="card-body">
                  <img
                    className="card-img"
                    src={coin.image}
                    alt="currency icon"
                  />
                  <h5 className="card-title">{coin.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {coin.symbol.toUpperCase()}
                  </h6>
                  <p className="card-text price">
                    {localStorage.getItem("currency").substring(3, 4)}
                    {coin.current_price.toLocaleString("en-GB", {
                      maximumFractionDigits: 20,
                    })}
                  </p>
                  <button
                    type="button"
                    className="btn more-button"
                    onClick={() => navigate(`/${coin.id}`)}
                  >
                    More
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </Container>
  );
}

export default Coins;
