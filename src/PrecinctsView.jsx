import React from 'react';
import mapboxgl from 'mapbox-gl';
import { debounce } from 'lodash';

import { Responsive, Button, Popup } from 'semantic-ui-react';

import FilterPanel from './FilterPanel';
import PrecinctData from './PrecinctData';
import { minDate, maxDate } from './utils/searchTerms';
import { toOrdinal } from './utils/ordinals';
import { filterData } from './utils/dataUtils';

import './PrecinctsView.scss';

const center = [-73.9905, 40.73925];
const precincts = [];

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

class PrecinctsView extends React.Component {
  state = {
    isMapLoaded: false,
    mode: 'officers',
    filters: {
      fromDate: minDate,
      toDate: maxDate,
      categories: [],
      complainant_ethnicity: [],
      complainant_gender: [],
      complainant_age_incident: [],
      mos_ethnicity: [],
      mos_gender: [],
      board_disposition: [],
    },
    selectedPrecinct: null,
    precinctsData: {},
    allegationsCount: 0,
    complaintsCount: 0,
    officersCount: 0,
    isMobilePopupOpen: false,
  };

  componentDidUpdate(prevProps) {
    const { isDataLoaded } = this.props;
    if (prevProps.isDataLoaded !== isDataLoaded) {
      this.setState({ isDataLoaded: isDataLoaded }, this.loadPrecincts);
    }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/theweekendest/ck1fhati848311cp6ezdzj5cm?optimize=true',
      center: center,
      minZoom: 9,
      zoom: 10,
      hash: false,
      maxBounds: [
        [-74.8113, 40.1797],
        [-73.3584, 41.1247]
      ],
      maxPitch: 0,
    });

    this.hoveredStateId = null;

    this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    this.map.on('load', () => {
      this.setState({ isMapLoaded: true }, this.loadPrecincts);
    });
  }

  loadPrecincts() {
    const { isMapLoaded } = this.state;
    const { isDataLoaded } = this.props;

    if (!isMapLoaded || !isDataLoaded) {
      return;
    }

    import('./data/precincts.json')
      .then(data => {
        data.features.forEach((d) => {
          d['id'] = d.properties.precinct;
          precincts.push(d.properties.precinct);
          return d;
        })
        const geoJson = {
          "type": "geojson",
          "data": data
        };
        this.map.addSource('data', geoJson);
        this.map.addLayer({
          'id': 'data',
          'type': 'fill',
          'source': 'data',
          'paint': {
            'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#db2828',
            '#54c8ff'
            ],
            'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
            ]
          }
        });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        this.map.on('mousemove', 'data', (e) => {
          if (e.features.length > 0) {
            if (this.hoveredStateId) {
              this.map.setFeatureState(
                { source: 'data', id: this.hoveredStateId },
                { hover: false }
              );
            }
            this.hoveredStateId = e.features[0].id;
            this.map.setFeatureState(
              { source: 'data', id: this.hoveredStateId },
              { hover: true }
            );
          }
        });

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });
         
        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        this.map.on('mouseleave', 'data', () => {
          this.map.getCanvas().style.cursor = '';
          if (this.hoveredStateId) {
            this.map.setFeatureState(
              { source: 'data', id: this.hoveredStateId },
              { hover: false }
            );
          }
          this.hoveredStateId = null;
          popup.remove();
        });

        this.map.on('mouseenter', 'data', ((e) => {
          this.map.getCanvas().style.cursor = 'pointer';

          const coordinates = e.lngLat;
          const description = this.generatePopup(e.features[0].properties.precinct);

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Populate the popup and set its coordinates
          // based on the feature found.
          popup
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(this.map);
        }));

        this.map.on('mousemove', 'data', ((e) => {
          const coordinates = e.lngLat;
          const description = this.generatePopup(e.features[0].properties.precinct);
          popup
            .setLngLat(coordinates)
            .setHTML(description);
        }));

        this.map.on('click', 'data', e => {
          this.debounceSelectPrecinct(e.features[0].id);
        });

        this.map.on('click', e => {
          this.debounceSelectPrecinct(null);
        });

        this.refreshMap();
      })
  }

  generatePopup(precinct) {
    const { precinctsData } = this.state;
    const data = precinctsData[precinct];

    return `<h5>${toOrdinal(precinct)} Precinct</h5>
      <ul>
        <li>Officers with Complaints: ${data.officers.length}</li>
        <li>Complaints: ${data.complaints.size}</li>
        <li>Allegations: ${data.allegations.size}</li>
      </ul>`;
  }

  refreshMap() {
    const { data } = this.props;
    const { mode, filters } = this.state;
    let allegationsCount = 0;
    const complaints = new Set();
    const officers = new Set();
    const officersData = {};
    const allegationsPrecinct = {};
    const complaintsPrecinct = {};
    const officersPrecinct = {};
    const precinctsData = {};

    precincts.forEach((p) => {
      allegationsPrecinct[p] = new Set();
      officersPrecinct[p] = new Set();
      complaintsPrecinct[p] = new Set();
    })

    let max = 1;

    // Reset
    precincts.forEach((id) => {
      this.map.setFeatureState(
        { source: 'data', id: id },
        { count: 0 }
      );
    })

    filterData(data, filters).forEach((d) => {
      if (officersPrecinct[d.precinct]) {
        officersPrecinct[d.precinct].add(d.unique_mos_id);
        complaintsPrecinct[d.precinct].add(d.complaint_id);
        allegationsPrecinct[d.precinct].add(d.id);
      }
      allegationsCount++;
      officers.add(d.unique_mos_id);
      complaints.add(d.complaint_id);
      if (!officersData[d.unique_mos_id]) {
        officersData[d.unique_mos_id] = {
          'unique_mos_id': d.unique_mos_id,
          'first_name': d.first_name,
          'last_name': d.last_name,
          'shield_no': d.shield_no,
          'command_now': d.command_now,
          'rank_now': d.rank_now,
          'complaints': new Set(),
          'allegations': new Set(),
        };
      }
      officersData[d.unique_mos_id].allegations.add(d.id);
      officersData[d.unique_mos_id].complaints.add(d.complaint_id);
    });

    precincts.forEach((id) => {
      const officersPrecinctData = [...officersPrecinct[id]].map((officerId) => officersData[officerId]);
      let count = officersPrecinctData.length

      if (mode === 'allegations') {
        count = allegationsPrecinct[id].size;
      } else if (mode === 'complaints') {
        count = complaintsPrecinct[id].size;
      }

      this.map.setFeatureState(
        { source: 'data', id: id },
        { count: count }
      );

      if (count > max) {
        max = count;
      }

      precinctsData[id] = {
        'allegations': allegationsPrecinct[id],
        'complaints': complaintsPrecinct[id],
        'officers': officersPrecinctData,
      };
    })

    this.map.setPaintProperty('data', 'fill-opacity', [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      ['*', ['/', ['feature-state', 'count'], max], 0.8]
      ]
    );

    this.setState({ precinctsData: precinctsData, allegationsCount: allegationsCount, complaintsCount: complaints.size, officersCount: officers.size });
  }

  selectPrecinct(precinct) {
    const { selectedPrecinct } = this.state;

    this.map.setFeatureState(
      { source: 'data', id: selectedPrecinct },
      { selected: false }
    );

    this.map.setFeatureState(
      { source: 'data', id: precinct },
      { selected: true }
    );

    this.setState({ selectedPrecinct: precinct, isMobilePopupOpen: false });
  }

  debounceSelectPrecinct = debounce((precinct) => {
    this.selectPrecinct(precinct);
  }, 300, {
    'leading': true,
    'trailing': false
  });

  handleUnselectPrecinct = () => this.selectPrecinct(null);

  handleModeClick = (e, { name }) => this.setState({ mode: name }, this.refreshMap);

  handleFromDateChange = (date) => {
    const { filters } = this.state;
    filters.fromDate = date;
    this.setState({ filters }, this.refreshMap);
  }

  handleToDateChange = (date) => {
    const { filters } = this.state;
    filters.toDate = date;
    this.setState({ filters }, this.refreshMap);
  }

  handleFilterChange = (e, { name, value }) => {
    const selectedPrimaries = value.filter((v) => v.indexOf(':') === -1);
    const { filters } = this.state;
    filters[name] = value.filter((v) => v.indexOf(':') === -1 || !selectedPrimaries.some((t) => v.startsWith(`${t}:`)));
    this.setState({ filters }, this.refreshMap);
  };

  handleReset = () => {
    this.setState({
      filters: {
        fromDate: minDate,
        toDate: maxDate,
        categories: [],
        complainant_ethnicity: [],
        complainant_gender: [],
        complainant_age_incident: [],
        mos_ethnicity: [],
        mos_gender: [],
        board_disposition: [],
      },
      isMobilePopupOpen: false,
    }, this.refreshMap);
  };

  handleToggleMobilePopup = () => {
    const { isMobilePopupOpen } = this.state;
    this.setState({ isMobilePopupOpen: !isMobilePopupOpen });
  }

  render() {
    const {
      mode, fromDate, toDate, categories, selectedPrecinct, precinctsData, isMobilePopupOpen,
      allegationsCount, complaintsCount, officersCount,
      filters
    } = this.state;
    return (
      <>
        { !selectedPrecinct &&
          <Responsive open={isMobilePopupOpen}
            as={Popup} trigger={<Responsive as={Button} basic inverted fluid {...Responsive.onlyMobile} className={isMobilePopupOpen ? 'open popup-btn' : 'popup-btn'} onClick={this.handleToggleMobilePopup}>Filters</Responsive>}
            on='click' position='bottom center' flowing inverted style={{padding: 0, height: '455px', overflowY: 'scroll'}}
          >
            <FilterPanel minWidth={Responsive.onlyTablet.minWidth}
              mode={mode} fromDate={fromDate} toDate={toDate} filters={filters}
              allegationsCount={allegationsCount} complaintsCount={complaintsCount} officersCount={officersCount}
              handleFromDateChange={this.handleFromDateChange} handleToDateChange={this.handleToDateChange}
              handleFilterChange={this.handleFilterChange}
              handleModeClick={this.handleModeClick} handleReset={this.handleReset}
            />
          </Responsive>
        }
        { selectedPrecinct &&
          <Responsive open={isMobilePopupOpen}
            as={Popup} trigger={<Responsive as={Button} basic inverted fluid {...Responsive.onlyMobile}  className={isMobilePopupOpen ? 'open popup-btn' : 'popup-btn'} onClick={this.handleToggleMobilePopup}>{toOrdinal(selectedPrecinct)} Precinct Data</Responsive>}
            on='click' position='bottom center' flowing inverted style={{padding: 0, height: '455px', overflowY: 'scroll'}}
          >
            <PrecinctData minWidth={Responsive.onlyTablet.minWidth} isMobile
            selectedPrecinct={selectedPrecinct} fromDate={fromDate} toDate={toDate} selectedCategories={categories}
            filters={filters}
            data={precinctsData[selectedPrecinct]} handleUnselectPrecinct={this.handleUnselectPrecinct}
          />
          </Responsive>
        }
        <div ref={el => this.mapContainer = el} className='map-container'>
        </div>
        { !selectedPrecinct &&
          <Responsive as={FilterPanel} minWidth={Responsive.onlyTablet.minWidth}
            mode={mode} fromDate={fromDate} toDate={toDate} filters={filters}
            allegationsCount={allegationsCount} complaintsCount={complaintsCount} officersCount={officersCount}
            handleFromDateChange={this.handleFromDateChange} handleToDateChange={this.handleToDateChange}
            handleFilterChange={this.handleFilterChange}
            handleModeClick={this.handleModeClick} handleReset={this.handleReset}
          />
        }
        { selectedPrecinct &&
          <Responsive as={PrecinctData} minWidth={Responsive.onlyTablet.minWidth}
            selectedPrecinct={selectedPrecinct} fromDate={fromDate} toDate={toDate} selectedCategories={categories}
            filters={filters}
            data={precinctsData[selectedPrecinct]} handleUnselectPrecinct={this.handleUnselectPrecinct}
          />
        }
      </>
    );
  }
}

export default PrecinctsView;