import React from "react";
import { Container, Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = () => {
  return (
    <Container-fluid className="mt-4">
      {/* Bootstrap Carousel */}
      <Carousel class="Carousel-height">
        <Carousel.Item>
          <img
            className="d-block w-100 "
            src="/assets/Denim.jpg" // Path to image
            alt="Topwear"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 "
            src="/assets/Jogger_pants.jpg" // Path to image
            alt="Bottomwear"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 "
            src="/assets/Polo.jpg" // Path to image
            alt="Footwear"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 "
            src="/assets/T-Shirt.jpg" // Path to image
            alt="Accessories"
          />
        </Carousel.Item>
      </Carousel>
    </Container-fluid>
  );
};

export default HomePage;
