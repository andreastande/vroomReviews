import { gql } from '@apollo/client';

// All queries used in the application are defined here

export const GET_CAR = gql`
  query GetCar($company: String!, $model: String!) {
    car(company: $company, model: $model) {
      id
      company
      model
      image
      horsepower
      transmissionType
      drivetrain
      numOfDoors
      price
      year
      carBody
      engineType
      numOfCylinders
      rating
    }
  }
`;

export const GET_CARS_BY_COMPANY = gql`
  query GetCarsByCompany($company: String!) {
    carsByCompany(company: $company) {
      id
      company
      model
      image
    }
  }
`;

export const GET_CARS = gql`
  query GetCars(
    $filters: carsFilters
    $offset: Int
    $orderBy: orderByArg
    $searchTerm: String
    $limit: Int
    $priceRange: [Int]
    $yearRange: [Int]
  ) {
    cars(
      filters: $filters
      offset: $offset
      orderBy: $orderBy
      searchTerm: $searchTerm
      limit: $limit
      priceRange: $priceRange
      yearRange: $yearRange
    ) {
      cars {
        id
        company
        model
        image
        rating
      }
      totalCount
      carBodies
      carCompanies
    }
  }
`;

export const GET_FAVORITE_CARS = gql`
  query GetFavoriteCars($userID: Int!) {
    favoriteCars(userID: $userID) {
      car {
        id
        company
        model
        image
      }
    }
  }
`;

export const GET_CAR_REVIEWS = gql`
  query GetCarReviews($car: ID!) {
    carReviews(car: $car) {
      userID
      rating
      review
      username
    }
  }
`;

export const GET_USER_REVIEWS = gql`
  query GetUserReviews($userID: Int!) {
    userReviews(userID: $userID) {
      rating
      review
      car {
        company
        model
        image
      }
    }
  }
`;

export const GET_USER_REVIEW_FOR_CAR = gql`
  query GetUserReviewForCar($userID: Int!, $car: ID!) {
    userReviewForCar(userID: $userID, car: $car) {
      userID
      rating
      review
      username
    }
  }
`;

export const GET_USER_COUNT = gql`
  query GetUserCount {
    userCount
  }
`;

export const GET_COMPANIES = gql`
  query GetCompanies($offset: Int, $limit: Int) {
    companies(offset: $offset, limit: $limit) {
      companies {
        name
        logo
      }
      totalCount
    }
  }
`;

export const GET_COMPANY_BY_NAME = gql`
  query GetCompanyByName($name: String!) {
    company(name: $name) {
      logo
    }
  }
`;
