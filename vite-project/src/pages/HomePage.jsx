import React from "react";
import { Container, Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import TrendingProducts from "../components/recommendations/TrendingProducts";
import PopularProducts from "../components/recommendations/PopularProducts";
import RecentlyViewed from "../components/recommendations/RecentlyViewed";

const HomePage = () => {
  return (
    <div className="mt-4">
      {/* Bootstrap Carousel */}
      <Container fluid>
        <Carousel className="Carousel-height">
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/assets/Denim.jpg"
              alt="Topwear"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/assets/Jogger_pants.jpg"
              alt="Bottomwear"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/assets/Polo.jpg"
              alt="Footwear"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/assets/T-Shirt.jpg"
              alt="Accessories"
            />
          </Carousel.Item>
        </Carousel>
      </Container>

      {/* Product Sections */}
      <Container className="mt-5">
        <h3>🔥 Trending Products</h3>
        <TrendingProducts />
      </Container>

      <Container className="mt-5">
        <h3>⭐ Popular Products</h3>
        <PopularProducts />
      </Container>

      <Container className="mt-5 mb-5">
        <h3>🕒 Recently Viewed</h3>
        <RecentlyViewed />
      </Container>
    </div>
  );
};

export default HomePage;
