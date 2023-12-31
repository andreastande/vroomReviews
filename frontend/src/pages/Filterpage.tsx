import DropdownMenu from '../components/DropdownMenu';
import { useState, useEffect } from 'react';
import '../assets/FilterPage.css';
import CardForCar from '../components/CardForCar';
import { GET_CARS } from '../graphQL/queries';
import { useQuery } from '@apollo/client';
import { CarCard } from '../types/CarCard';
import Slider from '@mui/material/Slider';
import ShowNameCheckbox from '../components/ShowNameCheckbox';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/configureStore';

const Filterpage = () => {
  // Initialize filters
  const [filters, setFilters] = useState([
    {
      name: 'Brand',
      options: [],
    },
    {
      name: 'Body',
      options: [],
    },
    {
      name: 'Sort by',
      options: [
        'Years, asc',
        'Years, desc',
        'Price, asc',
        'Price, desc',
        'Rating, asc',
        'Rating, desc',
      ],
    },
  ]);

  // Get selected filters from sessionStorage or set to default
  const [selectedFilters, setSelectedFilters] = useState({
    Brand: sessionStorage.getItem('Brand') || 'All',
    Body: sessionStorage.getItem('Body') || 'All',
    SortBy: sessionStorage.getItem('Sort by') || 'All',
  });

  // Initialize each dropdownMenu to be false, meaning options are not shown
  const [dropdownVisibility, setDropdownVisibility] = useState(
    filters.map(() => false),
  );

  const [updateOptionsCounter, setUpdateOptionsCounter] = useState({
    Brand: false,
    Body: false,
    SortBy: false,
  });

  // Initialize amount of visible cars to 12
  const [visibleCars, setVisibleCars] = useState(12);

  const [shownCars, setShownCars] = useState<CarCard['car'][]>([]);

  // Get search term from sessionStorage or set to empty string
  const [searchTerm, setSearchTerm] = useState(
    sessionStorage.getItem('searchTerm') || '',
  );

  // Get amount of visible cars from sessionStorage or set to 12
  const [limit, setLimit] = useState(
    parseInt(sessionStorage.getItem('visibleCars') || '12'),
  );

  const [totalCount, setTotalCount] = useState(0);

  // Get price range from sessionStorage or set to default
  const [priceRange, setPriceRange] = useState<number[]>(
    JSON.parse(sessionStorage.getItem('priceRange') || '[0, 100000]'),
  );

  // Get year range from sessionStorage or set to default
  const [yearRange, setYearRange] = useState<number[]>(
    JSON.parse(sessionStorage.getItem('yearRange') || '[1943, 2023]'),
  );

  const showCarname = useSelector((state: RootState) => state.showName.value);

  // Get cars from backend
  const { error, data } = useQuery(GET_CARS, {
    variables: {
      filters: {
        company: selectedFilters.Brand !== 'All' ? selectedFilters.Brand : null,
        carBody: selectedFilters.Body !== 'All' ? selectedFilters.Body : null,
      },
      offset: visibleCars - 12,
      orderBy: {
        year: !selectedFilters.SortBy.includes('Years')
          ? null
          : selectedFilters.SortBy.includes('asc')
          ? 'asc'
          : 'desc',
        price: !selectedFilters.SortBy.includes('Price')
          ? null
          : selectedFilters.SortBy.includes('asc')
          ? 'asc'
          : 'desc',
        rating: !selectedFilters.SortBy.includes('Rating')
          ? null
          : selectedFilters.SortBy.includes('asc')
          ? 'asc'
          : 'desc',
      },
      searchTerm: searchTerm,
      limit: limit,
      priceRange: priceRange,
      yearRange: yearRange,
    },
  });

  // Add cars to shownCars when data is fetched
  useEffect(() => {
    if (data?.cars?.cars) {
      setShownCars((prevShownCars) => prevShownCars?.concat(data?.cars?.cars));
      setTotalCount(data?.cars?.totalCount);
      setFilters((prevFilters) =>
        prevFilters.map((filter) =>
          filter.name === 'Body'
            ? { ...filter, options: data?.cars?.carBodies }
            : filter,
        ),
      );
      setFilters((prevFilters) =>
        prevFilters.map((filter) =>
          filter.name === 'Brand'
            ? { ...filter, options: data?.cars?.carCompanies }
            : filter,
        ),
      );
      setUpdateOptionsCounter({ Brand: false, Body: false, SortBy: false });
    }
  }, [data]);

  // Set search term in sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem('priceRange', JSON.stringify(priceRange));
    sessionStorage.setItem('yearRange', JSON.stringify(yearRange));
  }, [priceRange, yearRange]);

  // Set selected filters and if not initial load, reset shownCars and amount of visibleCars
  const handleFilterChange = (
    filterName: string,
    selectedValue: string,
    initialLoad: boolean,
  ) => {
    setSelectedFilters((prevSelectedFilters) => ({
      ...prevSelectedFilters,
      [filterName === 'Sort by' ? 'SortBy' : filterName]: selectedValue,
    }));
    if (!initialLoad) {
      setUpdateOptionsCounter({
        Brand: filterName !== 'Brand',
        Body: filterName !== 'Body',
        SortBy: false,
      });
      setShownCars([]);
      setVisibleCars(12);
      setLimit(12);
      sessionStorage.setItem('visibleCars', '12');
    }
  };

  // Display dropdown for dropdownMenu clicked. The rest is set to false, meaning they are closed.
  // This ensures that only 1 dropdown can be open at a time.
  const toggleDropdown = (index: number) => {
    setDropdownVisibility(
      dropdownVisibility.map((item, i) => (i === index ? !item : false)),
    );
  };

  // Set price range when user changes slider
  const handlePriceChange = (
    _event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (JSON.stringify(priceRange) == JSON.stringify([0, 5000])) {
      if (activeThumb === 1 && newValue[1] > 5000) {
        // do nothing
      } else {
        return;
      }
    }

    if (JSON.stringify(priceRange) == JSON.stringify([95000, 100000])) {
      if (activeThumb === 0 && newValue[0] < 95000) {
        // do nothing
      } else {
        return;
      }
    }

    setShownCars([]);
    setVisibleCars(12);
    setLimit(12);
    sessionStorage.setItem('visibleCars', '12');

    const minDistance = 5000;

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100000 - minDistance);
        setPriceRange([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setPriceRange([clamped - minDistance, clamped]);
      }
    } else {
      setPriceRange(newValue as number[]);
    }
  };

  // Set year range when user changes slider
  const handleYearChange = (
    _event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (JSON.stringify(yearRange) == JSON.stringify([1943, 1948])) {
      if (activeThumb === 1 && newValue[1] > 1948) {
        // do nothing
      } else {
        return;
      }
    }

    if (JSON.stringify(yearRange) == JSON.stringify([2018, 2023])) {
      if (activeThumb === 0 && newValue[0] < 2018) {
        // do nothing
      } else {
        return;
      }
    }

    setShownCars([]);
    setVisibleCars(12);
    setLimit(12);
    sessionStorage.setItem('visibleCars', '12');

    const minDistance = 5;

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 2023 - minDistance);
        setYearRange([clamped, clamped + minDistance]);
      } else {
        if (yearRange[0] != 1943) {
          const clamped = Math.max(newValue[1], minDistance);
          setYearRange([clamped - minDistance, clamped]);
        }
      }
    } else {
      setYearRange(newValue as number[]);
    }
  };

  const valueLabelFormat = (value: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const formattedValue = formatter.format(value);
    return value === 100000 ? `${formattedValue}+` : formattedValue;
  };

  let typingTimer: NodeJS.Timeout;

  // Set search term when user types in search bar only after 250ms, to avoid unnecessary calls to the backend
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      const value = e.target.value;
      setShownCars([]);
      setVisibleCars(12);
      setLimit(12);
      sessionStorage.setItem('visibleCars', '12');
      setUpdateOptionsCounter({ Brand: true, Body: true, SortBy: false });
      setSearchTerm(value);
    }, 250);
  };

  // Close dropdowns when user clicks outside of them
  const handleFocus = () => {
    if (dropdownVisibility.includes(true)) {
      setDropdownVisibility(dropdownVisibility.map(() => false));
    }
  };

  // Load more cars when user clicks "View more"
  const handleViewMore = () => {
    setVisibleCars((prevVisibleCars) => prevVisibleCars + limit);
    const newVisibleCars = limit + visibleCars;
    sessionStorage.setItem('visibleCars', newVisibleCars.toString());
    setLimit(12);
  };

  if (error) console.log(error);

  return (
    <>
      <div className="search-bar">
        <div className="search-bar-wrapper">
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search for car"
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
            />
          </div>
        </div>
      </div>
      <div className="filter-menu">
        {/* for each filter, show a dropdownMenu */}
        {filters.map((filter, index) => (
          <div className="dropdown-flex" key={index}>
            <DropdownMenu
              filter={filter.name}
              options={filter.options}
              isOpen={dropdownVisibility[index]}
              updateOptionCounter={
                updateOptionsCounter[
                  filter.name as keyof typeof updateOptionsCounter
                ]
              }
              toggleDropdown={() => toggleDropdown(index)}
              onSelect={(value, initialLoad) =>
                handleFilterChange(filter.name, value, initialLoad)
              }
            />
          </div>
        ))}
      </div>
      {/* show sliders for price and year range */}
      <div className="slider-menu">
        <div className="slider-wrapper">
          <div className="slider">
            <Slider
              color="error"
              getAriaLabel={() => 'Price range'}
              value={priceRange}
              min={0}
              max={100000}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              disableSwap
            />
          </div>
          <p>Price range</p>
        </div>
        <div className="slider-wrapper">
          <div className="slider">
            <Slider
              color="error"
              getAriaLabel={() => 'Year range'}
              value={yearRange}
              min={1943}
              max={2023}
              onChange={handleYearChange}
              valueLabelDisplay="auto"
              disableSwap
            />
          </div>
          <p>Year range</p>
        </div>
      </div>
      {/* show amount of cars found */}
      {totalCount !== 0 &&
        (searchTerm !== '' ||
          selectedFilters.Brand !== 'All' ||
          selectedFilters.Body !== 'All' ||
          JSON.stringify(priceRange) !== JSON.stringify([0, 100000]) ||
          JSON.stringify(yearRange) !== JSON.stringify([1943, 2023])) && (
          <div className="result-counter">
            <p>Found {totalCount} cars</p>
          </div>
        )}
      {/* show checkbox to show car name */}
      <div className="checkbox-container">
        <ShowNameCheckbox />
      </div>
      {/* show cars if there are not any cars, else show text */}
      {totalCount !== 0 ? (
        <div className="car-list">
          {shownCars.map((car) => (
            <div className="car" key={car.company + '-' + car.model}>
              <CardForCar
                brand={car.company}
                model={car.model}
                carIMG={car.image}
                showInfo={showCarname}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="no-results"
          style={{ marginTop: '100px', textAlign: 'center' }}
        >
          {searchTerm == '' ? (
            <div>
              <h1>No cars found!</h1>
              <h1> Try changing your filters</h1>
            </div>
          ) : searchTerm !== '' &&
            (selectedFilters.Brand !== 'All' ||
              selectedFilters.Body !== 'All' ||
              JSON.stringify(priceRange) !== JSON.stringify([0, 100000]) ||
              JSON.stringify(yearRange) !== JSON.stringify([1943, 2023])) ? (
            <div>
              <h1>No cars found!</h1>
              <h1>Try changing your filters</h1>
            </div>
          ) : (
            <div>
              <h1>No cars found!</h1>
              <h1>Try changing your searchterm</h1>
            </div>
          )}
        </div>
      )}
      {shownCars.length != 0 && totalCount > 12 && (
        <div className="result-counter">
          <p>
            Showing {shownCars.length} of {totalCount} cars
          </p>
        </div>
      )}
      <div className="view-more-button">
        {visibleCars < totalCount ? (
          <button onClick={handleViewMore}>
            <p>View more</p>
          </button>
        ) : null}
      </div>
    </>
  );
};

export default Filterpage;
