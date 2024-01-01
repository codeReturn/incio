import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Dropdown, DropdownButton, Form, Button, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import { Line  } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Chart, registerables, defaults } from 'chart.js';

Chart.register(...registerables);

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoadingSpinner from '../UI/LoadingSpinner';

import 'chartjs-adapter-moment';
import moment from 'moment';

import ContentLoader from "react-content-loader";

import { AuthContext } from '../context/auth-context';

defaults.font.family = 'bold'

const MyLoader = (props) => (
  <ContentLoader 
    speed={2}
    width={'100%'}
    height={400}
    viewBox="0 0 100 400"
    backgroundColor="#fff"
    foregroundColor="#e8e8e8"
    {...props}
  >
    <rect x="0" y="0" rx="3" ry="3" width="100" height="400" />
  </ContentLoader>
)

const InvoiceStats = (props) => {
  const auth = useContext(AuthContext)
  const user = JSON.parse(localStorage.getItem('userData'));

  const [grossChartInstance, setGrossChartInstance] = useState(null);
  const [netChartInstance, setNetChartInstance] = useState(null);

  const [timeRange, setTimeRange] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const setTestData = () => {
    const labels = [];
    const grossVolumeData = [];
    const netVolumeData = [];
  
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= 31; i++) {
      const date = new Date(currentYear, 0, i); 
      const formattedDate = date.toLocaleDateString();
    
      labels.push(formattedDate);
    
      grossVolumeData.push(Math.floor(Math.random() * 100000));
      netVolumeData.push(Math.floor(Math.random() * 100000));
    }

    setGrossVolumeData({
      labels,
      datasets: [
        {
          label: 'Gross Volume',
          data: grossVolumeData,
          borderColor: '#BF5AF2',
          borderWidth: 2,
          fill: false,
        },
      ],
    });
  
    setNetVolumeData({
      labels,
      datasets: [
        {
          label: 'Net Volume',
          data: netVolumeData,
          borderColor: '#BF5AF2',
          borderWidth: 2,
          fill: false,
        },
      ],
    });
  
    // Update totalRevenue and totalRevenuePercentage
    const totalRevenue = grossVolumeData.reduce((acc, cur) => acc + cur, 0);
    const formattedTotalRevenue = totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 });
    
    const totalRevenuePercentage = Math.round(totalRevenue / 100000) + '%';
  
    setTotalRevenue(formattedTotalRevenue);
    setTotalRevenuePercentage(totalRevenuePercentage);
  }
  
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleDateString('en', { month: 'short' })
  );

  const defaultData = Array(12).fill(0);

  const [grossVolumeData, setGrossVolumeData] = useState({
    labels: monthLabels,
    datasets: [
      {
        label: 'Gross Volume',
        data: defaultData,
        borderColor: '#BF5AF2',
        borderWidth: 2,
        fill: false,
      },
    ],
  });

  const [netVolumeData, setNetVolumeData] = useState({
    labels: monthLabels,
    datasets: [
      {
        label: 'Net Volume',
        data: defaultData,
        borderColor: '#BF5AF2',
        borderWidth: 2,
        fill: false,
      },
    ],
  });

  const [totalRevenue, setTotalRevenue] = useState('0,000.00')
  const [totalRevenuePercentage, setTotalRevenuePercentage] = useState('0')

  const [isLoading, setIsLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false)

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const fetchData = async (e) => {
    if(e){
      e.preventDefault()
    }

    if (timeRange === 'empty') {
      alert('You must select a date range!');
      return;
    }

    if (timeRange === 'all' && (!startDate || !endDate)) {
      alert('You must select a date range!');
      return;
    }

    let calculatedStartDate, calculatedEndDate;

    if (timeRange === 'last7days') {
      const currentDate = moment();
      calculatedStartDate = currentDate.clone().subtract(7, 'days').startOf('day').subtract(1, 'day').format('YYYY-MM-DD');
      calculatedEndDate = currentDate.endOf('day').subtract(1, 'day').format('YYYY-MM-DD');
  } else if (timeRange === 'last30days') {
      const currentDate = moment();
      calculatedStartDate = currentDate.clone().subtract(30, 'days').startOf('day').subtract(1, 'day').format('YYYY-MM-DD');
      calculatedEndDate = currentDate.endOf('day').subtract(1, 'day').format('YYYY-MM-DD');
  } else if (timeRange === 'last365days') {
      const currentDate = moment();
      calculatedStartDate = currentDate.clone().subtract(365, 'days').startOf('day').subtract(1, 'day').format('YYYY-MM-DD');
      calculatedEndDate = currentDate.endOf('day').subtract(1, 'day').format('YYYY-MM-DD');
  } else if (timeRange === 'all') {
      calculatedStartDate = moment(startDate).startOf('day').format('YYYY-MM-DD');
      calculatedEndDate = moment(endDate).endOf('day').format('YYYY-MM-DD');
  } else {
      calculatedStartDate = '2023/01/01';
      calculatedEndDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
  }
  

    try {
      setGraphLoading(true);
      const response = await axios.get('http://localhost:5000/server/api/connect/getstripestats', {
        params: {
          timeRange: timeRange === 'all' ? 'custom' : timeRange, // Send 'custom' if 'all' is selected
          startDate: calculatedStartDate,
          endDate: calculatedEndDate,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
      });

      const grossChartData = {
        labels: response.data.labels,
        datasets: [
          {
            label: 'Gross Volume',
            data: response.data.grossVolume,
            borderColor: '#BF5AF2',
            borderWidth: 1,
            fill: false,
          },
        ],
      };
      setGrossVolumeData(grossChartData);

      const netChartData = {
        labels: response.data.labels,
        datasets: [
          {
            label: 'Net Volume',
            data: response.data.netVolume,
            borderColor: '#BF5AF2',
            borderWidth: 1,
            fill: false,
          },
        ],
      };
      setNetVolumeData(netChartData);

      setGraphLoading(false);
    } catch (error) {
      // toast.error(error.message, { position: toast.POSITION.BOTTOM_CENTER });
      console.log(error)
      setGraphLoading(false);
    }
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM.DD.YY',
            month: 'MM.DD.YY',
          },
        },
        grid: {
          display: auth.windowWidth < 650,
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          maxTicksLimit: auth.windowWidth < 650 ? 4 : 15,
          callback: (value, index, values) => {
            const formattedDate = moment(value).format('MM.DD.YY');
            const parsedDate = moment(formattedDate, 'MM.DD.YY', true);
            if (parsedDate.isValid()) {
              return formattedDate;
            } else {
              return '';
            }
          },
          display: (context) => {
            // Custom function to check if there are any ticks to display
            return context.chart.data.datasets.some(dataset => dataset.data.some(value => value !== 0));
          },
        },
      },
      y: {
        grid: {
          display: auth.windowWidth < 650,
        },
        ticks: {
          maxTicksLimit: 10,
          stepSize: 10000,
          callback: (value, index, values) => {
            if (value === 0) {
              return value;
            } else if (Math.abs(value) >= 1e6) {
              return value / 1e6 + 'm';
            } else if (Math.abs(value) >= 1e3) {
              return value / 1e3 + 'k';
            } else {
              return value;
            }
          },
          display: (context) => {
            return context.chart.data.datasets.some(dataset => dataset.data.some(value => value !== 0));
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        intersect: false,
      },
      font: {
        family: 'bold',
      },
    },
    pointRadius: 0,
  };
    
  useEffect(() => {
    fetchData()
  }, []);

  useEffect(() => {
    const updateTestData = () => {
        const test = localStorage.getItem('testdata');
        if (test === 'true') {
            setTestData()
        } 
    };

    // Initial cart count update
    updateTestData();

    // Listen for the custom event to update the cart count when the cart is updated
    window.addEventListener('testCalled', updateTestData);

    return () => {
    window.removeEventListener('testCalled', updateTestData);
    };
  }, []);

    
  return (
    <>
      {isLoading && <LoadingSpinner asOverlay={true} />}
      
      {!props.single && (
        <>
        <Form className="global-form" onSubmit={fetchData}>
          <Row>
            <Col sm={6}>
              <div className="d-flex align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="dark" id="dropdown-time">
                    {timeRange === 'last7days' && 'Last 7 days'}
                    {timeRange === 'last30days' && 'Last 30 days'}
                    {timeRange === 'last365days' && 'Last 365 days'}
                    {timeRange === 'all' && 'All time'}
                    {timeRange === 'empty' && 'Select time'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item active={timeRange === 'empty'} onClick={() => handleTimeRangeChange('empty')}>
                      Select time
                    </Dropdown.Item>
                    <Dropdown.Item active={timeRange === 'all'} onClick={() => handleTimeRangeChange('all')}>
                      All time
                    </Dropdown.Item>
                    <Dropdown.Item active={timeRange === 'last7days'} onClick={() => handleTimeRangeChange('last7days')}>
                      Last 7 days
                    </Dropdown.Item>
                    <Dropdown.Item active={timeRange === 'last30days'} onClick={() => handleTimeRangeChange('last30days')}>
                      Last 30 days
                    </Dropdown.Item>
                    <Dropdown.Item active={timeRange === 'last365days'} onClick={() => handleTimeRangeChange('last365days')}>
                      Last 365 days
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Button variant="light" className="mx-2" type="submit">
                  <i className="fa-brands fa-searchengin"></i>
                </Button>
              </div>

              {timeRange === 'all' && (
                <Row className="my-2">
                  <Col xs={6}>
                    <Form.Group controlId="startDate">
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min="2023/01/01" 
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group controlId="endDate">
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min="2023/01/01" 
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Col>
            <Col sm={6}></Col>
          </Row>
        </Form>
        </>
      )}

      <Row className="my-4">
        {props.single ? (
          <>
          <Col sm={12}>
            <div className="graph-block py-0">

            <div className="filter-side">
              <div className="graph-filter">
                <ButtonGroup aria-label="graph-filter" className="hide-on-mobile-device">
                  <Button variant="secondary" active={timeRange === 'last7days'} onClick={() => handleTimeRangeChange('last7days')}>7D</Button>
                  <Button variant="secondary" active={timeRange === 'last30days'} onClick={() => handleTimeRangeChange('last30days')}>30D</Button>
                  <Button variant="secondary" active={timeRange === 'last365days'} onClick={() => handleTimeRangeChange('last365days')}>1Y</Button>
                  <Button variant="secondary" active={timeRange === 'all'} onClick={() => handleTimeRangeChange('all')}>ALL</Button>
                </ButtonGroup>

                <div className="graph-filter-mobile">
                <DropdownButton id="dropdown-basic-button" title="Quarterly" className="display-on-mobile-device">
                  <Dropdown.Item href="#" active={timeRange === 'last7days'} onClick={() => handleTimeRangeChange('last7days')}>7D</Dropdown.Item>
                  <Dropdown.Item href="#" active={timeRange === 'last30days'} onClick={() => handleTimeRangeChange('last30days')}>30D</Dropdown.Item>
                  <Dropdown.Item href="#" active={timeRange === 'last365days'} onClick={() => handleTimeRangeChange('last365days')}>1Y</Dropdown.Item>
                  <Dropdown.Item href="#" active={timeRange === 'all'} onClick={() => handleTimeRangeChange('all')}>ALL</Dropdown.Item>
                </DropdownButton>
                </div>
              </div>

            </div>

            <h3 className="total-revenue">Total Revenue 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.83333 5.5V7.16667H3.66667V16.3333H12.8333V12.1667H14.5V17.1667C14.5 17.6269 14.1269 18 13.6667 18H2.83333C2.3731 18 2 17.6269 2 17.1667V6.33333C2 5.8731 2.3731 5.5 2.83333 5.5H7.83333ZM17 3V9.66667H15.3333L15.3333 5.84417L8.83925 12.3393L7.66074 11.1608L14.1541 4.66667H10.3333V3H17Z" fill="#AFAFAF"/>
              </svg>
            </h3>

            <div className="graph-total-price">
              <div>
                <svg width="17" height="26" viewBox="0 0 17 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="dollar-svg">
                <path d="M13.6645 12.332C14.5605 12.696 15.2605 13.256 15.8205 13.984C16.3805 14.712 16.6605 15.692 16.6605 16.924C16.6605 18.52 16.0725 19.864 14.9525 20.984C13.8325 22.104 12.3485 22.804 10.5565 23.056V25.996H7.08449V23C5.23648 22.692 3.72448 21.964 2.60448 20.788C1.48448 19.612 0.896484 18.212 0.896484 16.56L5.01248 16.616C5.06848 17.596 5.46048 18.38 6.18848 18.968C6.91648 19.556 7.86848 19.836 9.07248 19.836C10.0525 19.836 10.8645 19.64 11.4805 19.22C12.0965 18.8 12.4325 18.212 12.4325 17.456C12.4325 16.952 12.2365 16.532 11.9005 16.224C11.5645 15.916 11.0605 15.664 10.4445 15.496C9.82848 15.328 8.84848 15.104 7.56048 14.824C6.27248 14.6 5.18048 14.292 4.31248 13.9C3.41648 13.508 2.71648 12.948 2.15648 12.192C1.59648 11.436 1.34448 10.428 1.34448 9.16798C1.34448 7.68398 1.84848 6.39598 2.91248 5.33198C3.97648 4.26798 5.34848 3.62398 7.08449 3.34398V0.375977H10.5565V3.39998C12.2365 3.73598 13.5805 4.43598 14.6445 5.49998C15.6805 6.59198 16.2125 7.87998 16.2685 9.39198H12.1525C12.0405 8.55198 11.7045 7.87998 11.0885 7.37598C10.4725 6.87198 9.66049 6.59198 8.65248 6.59198C7.70048 6.59198 6.97248 6.78798 6.41248 7.17998C5.85248 7.57198 5.57248 8.13198 5.57248 8.85998C5.57248 9.39198 5.74048 9.81198 6.07648 10.092C6.41248 10.372 6.88848 10.624 7.50448 10.792C8.12049 10.96 9.07248 11.184 10.3605 11.408C11.6485 11.66 12.7685 11.968 13.6645 12.332Z" fill="#212121"/>
                </svg>

                <b>{totalRevenue}</b>
              </div> 
              <div className="customrevenue"><small>USD</small> {totalRevenuePercentage !== '0' && <span>( {totalRevenuePercentage} )</span>}</div>
            </div>
            {graphLoading ? <MyLoader /> : (
              <>
              {grossVolumeData && grossVolumeData.labels && grossVolumeData.labels.length > 0 ? (
              <>
              <div className="revenue-block">
                {props.zoom === false && (
                  <>
                  <div className="zoom-connect-dialog">
                    <h3>Connect your Stripe</h3>
                    <p>You need to connect your Stripe account to see real data.</p>

                    <Link to='/account?opensocials=on'>
                    <Button variant='dark' className='w-100'>
                      Connect Stripe

                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.5247 5.46749L7.77469 1.71749C7.63969 1.57499 7.45219 1.49249 7.24219 1.49249C6.82969 1.49249 6.49219 1.82999 6.49219 2.24249C6.49219 2.45249 6.57469 2.63999 6.70969 2.77499L9.17719 5.24249H1.99219C1.57969 5.24249 1.24219 5.57999 1.24219 5.99249C1.24219 6.40499 1.57969 6.74249 1.99219 6.74249H9.18469L6.71719 9.20999C6.58219 9.34499 6.49969 9.53249 6.49969 9.74249C6.49969 10.155 6.83719 10.4925 7.24969 10.4925C7.45969 10.4925 7.64719 10.41 7.78219 10.275L11.5322 6.52499C11.6672 6.38999 11.7497 6.20249 11.7497 5.99249C11.7497 5.78249 11.6597 5.60249 11.5247 5.46749Z" fill="white"/>
                      </svg>
                    </Button>
                    </Link>

                  </div>
                  </>
                )}
              </div>

              <Line
              style={{ maxHeight: "390px" }}
              data={grossVolumeData}
              options={options}
              key="grossVolumeChart"
              getElementAtEvent={() => {}}
              ref={(chart) => {
                if (grossChartInstance) {
                  grossChartInstance.destroy();
                }
                setGrossChartInstance(chart && chart.chartInstance);
              }}
              />
              </>
              ) : (
                <p>No data</p>
              )}
              </>
            )}
            </div>
          </Col>
          </>
        ) : (
          <>
          <Col sm={6}>
            <div className={props.mobile === false ? "graph-block" : "graph-block-mobile"}>
            <h3>Gross Volume Sales</h3>
            {graphLoading ? <MyLoader /> : (
              <>
              {grossVolumeData && grossVolumeData.labels && grossVolumeData.labels.length > 0 ? (
                <Line
                  data={grossVolumeData}
                  options={options}
                  key="grossVolumeChart"
                  getElementAtEvent={() => {}}
                  ref={(chart) => {
                    if (grossChartInstance) {
                      grossChartInstance.destroy();
                    }
                    setGrossChartInstance(chart && chart.chartInstance);
                  }}
                />
              ) : (
                <p>No data</p>
              )}
              </>
            )}
            </div>
          </Col>
          <Col sm={6}>
            <div className={props.mobile === false ? "graph-block" : "graph-block-mobile"}>
            <h3>Net Volume Sales</h3>
            {graphLoading ? <MyLoader /> : (
              <>
              {netVolumeData && netVolumeData.labels && netVolumeData.labels.length > 0 ? (
                <Line
                  data={netVolumeData}
                  options={options}
                  key="netVolumeChart"
                  getElementAtEvent={() => {}}
                  ref={(chart) => {
                    if (netChartInstance) {
                      netChartInstance.destroy();
                    }
                    setNetChartInstance(chart && chart.chartInstance);
                  }}
                />
              ) : (
                <p>No data</p>
              )}
              </>
            )}
            </div>
          </Col>
          </>
        )}
      </Row>
    </>
  );
};

export default InvoiceStats;
