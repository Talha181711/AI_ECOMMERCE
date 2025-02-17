import React from "react";
import { Container, Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = () => {
  return (
    <Container className="mt-4">
      {/* Bootstrap Carousel */}
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/images/topwear.jpg" // Path to image
            alt="Topwear"
          />
          <Carousel.Caption>
            <h3>Topwear</h3>
            <p>Explore the latest styles in topwear for every occasion.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/images/bottomwear.jpg" // Path to image
            alt="Bottomwear"
          />
          <Carousel.Caption>
            <h3>Bottomwear</h3>
            <p>Discover trendy and comfortable bottomwear for all seasons.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/images/footwear.jpg" // Path to image
            alt="Footwear"
          />
          <Carousel.Caption>
            <h3>Footwear</h3>
            <p>Find the perfect pair of shoes for every outfit and occasion.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/images/accessories.jpg" // Path to image
            alt="Accessories"
          />
          <Carousel.Caption>
            <h3>Accessories</h3>
            <p>Complete your look with our stylish accessories.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </Container>
  );
};

export default HomePage;
