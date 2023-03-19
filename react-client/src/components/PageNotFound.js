import React from "react";
import { Container, Row } from "react-bootstrap";

function PageNotFound() {
  return (
    <Container>
      <Row>
        <h1 className="text-center">404</h1>
      </Row>
      <Row>
        <h1 className="text-center">Page Not Found</h1>
      </Row>
    </Container>
  );
}

export default PageNotFound;
