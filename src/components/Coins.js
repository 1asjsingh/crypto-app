import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axios";
import "./Coins.css";
import { getCurrencies } from "./requests.js";
import Loading from "./Loading";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { Col, Container, Row, Dropdown } from "react-bootstrap";
import {
  BsFillArrowUpCircleFill,
  BsFillArrowDownCircleFill,
} from "react-icons/bs";

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
          alert(e.message);
        });
    }
    getData();
  }, []);

  const switchView = () => {
    setOrder("");
    if (tableView) {
      setTableView(false);
    } else {
      setTableView(true);
    }
  };

  const sortTable = (col, gridOrder) => {
    let currOrder;
    if (!gridOrder) {
      currOrder = sortCol === col && order === "ASC" ? "DSC" : "ASC";
      setSortCol(col);
      setOrder(currOrder);
    } else {
      currOrder = gridOrder;
    }
    if (currOrder === "ASC") {
      if (col === "current_price") {
        setCoins(
          [...coins].sort((a, b) =>
            parseFloat(a[col]) > parseFloat(b[col]) ? 1 : -1
          )
        );
      } else {
        setCoins(
          [...coins].sort((a, b) =>
            a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1
          )
        );
      }
    }

    if (currOrder === "DSC") {
      if (col === "current_price") {
        setCoins(
          [...coins].sort((a, b) =>
            parseFloat(a[col]) > parseFloat(b[col]) ? -1 : 1
          )
        );
      } else {
        setCoins(
          [...coins].sort((a, b) =>
            a[col].toLowerCase() > b[col].toLowerCase() ? -1 : 1
          )
        );
      }
    }
  };

  const handleGridSort = (val) => {
    const selectedCol = val.substring(3)
    const selectedOrd = val.substring(0, 3)

    sortTable(selectedCol, selectedOrd);
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
              <th onClick={() => sortTable("name")}>
                Name{" "}
                {sortCol === "name" ? (
                  order === "ASC" ? (
                    <BsFillArrowUpCircleFill />
                  ) : (
                    <BsFillArrowDownCircleFill />
                  )
                ) : (
                  ""
                )}
              </th>
              <th onClick={() => sortTable("symbol")}>
                Symbol{" "}
                {sortCol === "symbol" ? (
                  order === "ASC" ? (
                    <BsFillArrowUpCircleFill />
                  ) : (
                    <BsFillArrowDownCircleFill />
                  )
                ) : (
                  ""
                )}
              </th>
              <th onClick={() => sortTable("current_price")}>
                Price{" "}
                {sortCol === "current_price" ? (
                  order === "ASC" ? (
                    <BsFillArrowUpCircleFill />
                  ) : (
                    <BsFillArrowDownCircleFill />
                  )
                ) : (
                  ""
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {coins
              .filter((term) => {
                if (search === "") {
                  return true;
                } else if (
                  term.name.toLowerCase().includes(search.toLowerCase()) ||
                  term.symbol.toLowerCase().includes(search.toLowerCase())
                ) {
                  return true;
                }
                return false;
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
        <Row>
          <Dropdown onSelect={handleGridSort}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Sort
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey={"DSCcurrent_price"}>
                Price (Highest)
              </Dropdown.Item>
              <Dropdown.Item eventKey={"ASCcurrent_price"}>
                Price (Lowest)
              </Dropdown.Item>
              <Dropdown.Item eventKey={"ASCname"}>Name (A-Z)</Dropdown.Item>
              <Dropdown.Item eventKey={"DSCname"}>Name (Z-A)</Dropdown.Item>
              <Dropdown.Item eventKey={"ASCsymbol"}>Symbol (A-Z)</Dropdown.Item>
              <Dropdown.Item eventKey={"DSCsymbol"}>Symbol (Z-A)</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {coins
            .filter((term) => {
              if (search === "") {
                return true;
              } else if (
                term.name.toLowerCase().includes(search.toLowerCase()) ||
                term.symbol.toLowerCase().includes(search.toLowerCase())
              ) {
                return true;
              }
              return false;
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
        </Row>
      )}
    </Container>
  );
}

export default Coins;
