import React from 'react';
import mapboxgl from 'mapbox-gl';
import { debounce } from 'lodash';

import MapConfig from './MapConfig';
import PrecinctData from './PrecinctData';
import { minDate, maxDate } from './utils/searchTerms';

import './PrecinctsView.scss';

const center = [-73.9905, 40.73925];
const precincts = [];

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

class PrecinctsView extends React.Component {
  state = {
    isMapLoaded: false,
    fromDate: minDate,
    toDate: maxDate,
    mode: 'officers',
    categories: [],
    complainant_ethnicity: [],
    complainant_gender: [],
    complainant_age_incident: [],
    mos_ethnicity: [],
    mos_gender: [],
    board_disposition: [],
    selectedPrecinct: null,
    precinctsData: {},
    allegationsCount: 0,
    complaintsCount: 0,
    officersCount: 0,
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
        const features = data.features.map((d) => {
          d['id'] = d.properties.precinct;
          precincts.push(d.properties.precinct);
        })
        const dataWithId = {
          "type": "FeatureCollection",
          "features": features,
        };
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
        });
        this.map.on('mouseenter', 'data', (() => {
          this.map.getCanvas().style.cursor = 'pointer';
        }).bind(this));

        this.map.on('click', 'data', e => {
          this.debounceSelectPrecinct(e.features[0].id);
        });

        this.map.on('click', e => {
          this.debounceSelectPrecinct(null);
        });

        this.refreshMap();
      })
  }

  refreshMap() {
    const { data } = this.props;
    const { mode, fromDate, toDate, categories, complainant_age_incident } = this.state;
    let allegationsCount = 0;
    const complaints = new Set();
    const officers = new Set();
    const officersData = {};
    const allegationsPrecinct = {};
    const complaintsPrecinct = {};
    const officersPrecinct = {};
    const precinctsData = {};
    const primaryCategories = categories.filter((c) => c.indexOf(':') === -1);
    const secondaryCategories = categories.filter((c) => c.indexOf(':') !== -1);

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

    data.filter((d) => {
      const date = new Date(`${d.year_received}/${d.month_received}/01`);
      return date >= fromDate && date <= toDate;
    }).filter((d) => {
      return categories.length === 0 || primaryCategories.includes(d.fado_type) || secondaryCategories.some((c) => {
        const array = c.split(':');
        const primary = array[0];
        const secondary = array[1];
        return d.fado_type === primary && d.allegation === secondary;
      });
    }).filter((d) => {
      return ['complainant_ethnicity', 'complainant_gender', 'mos_ethnicity', 'mos_gender', 'board_disposition'].every((name) => {
        return this.state[name].length === 0 || this.state[name].includes(d[name]);
      })
    }).filter((d) => {
      return complainant_age_incident.length === 0 || complainant_age_incident.some((ageGroup) => {
        const array = ageGroup.split(':');
        const min = array[0];
        const max = array[1];

        return d.complainant_age_incident >= min && d.complainant_age_incident <= max;
      })
    }).forEach((d) => {
      if (officersPrecinct[d.precinct]) {
        officersPrecinct[d.precinct].add(d.unique_mos_id);
        complaintsPrecinct[d.precinct].add(d.complaint_id);
        allegationsPrecinct[d.precinct].add(`${d.complaint_id}:${d.fado_type}:${d.allegation}`);
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
      officersData[d.unique_mos_id].allegations.add(`${d.complaint_id}:${d.fado_type}:${d.allegation}`);
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

    this.setState({ selectedPrecinct: precinct });
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
    this.setState({ fromDate: date}, this.refreshMap);
  }

  handleToDateChange = (date) => {
    this.setState({ toDate: date}, this.refreshMap);
  }

  handleCategoryFilterChange = (e, { value }) => {
    const selectedPrimaries = value.filter((v) => v.indexOf(':') === -1);

    this.setState({ categories: value.filter((v) => !selectedPrimaries.some((t) => v.startsWith(`${t}:`))) }, this.refreshMap);
  };

  handleFilterChange = (e, { name, value }) => {
    this.setState({ [name]: value }, this.refreshMap);
  };

  render() {
    const {
      mode, fromDate, toDate, categories, selectedPrecinct, precinctsData,
      allegationsCount, complaintsCount, officersCount,
      complainant_ethnicity, complainant_gender, complainant_age_incident, mos_ethnicity, mos_gender, board_disposition
    } = this.state;
    return (
      <>
        <div ref={el => this.mapContainer = el} className='map-container'>
        </div>
        { !selectedPrecinct &&
          <MapConfig mode={mode} fromDate={fromDate} toDate={toDate} selectedCategories={categories}
            allegationsCount={allegationsCount} complaintsCount={complaintsCount} officersCount={officersCount}
            handleFromDateChange={this.handleFromDateChange} handleToDateChange={this.handleToDateChange}
            handleCategoryFilterChange={this.handleCategoryFilterChange} handleFilterChange={this.handleFilterChange}
            handleModeClick={this.handleModeClick}
          />
        }
        { selectedPrecinct &&
          <PrecinctData selectedPrecinct={selectedPrecinct} fromDate={fromDate} toDate={toDate} selectedCategories={categories}
            complainant_ethnicity={complainant_ethnicity} complainant_gender={complainant_gender} complainant_age_incident={complainant_age_incident}
            mos_ethnicity={mos_ethnicity} mos_gender={mos_gender} board_disposition={board_disposition}
            data={precinctsData[selectedPrecinct]} handleUnselectPrecinct={this.handleUnselectPrecinct}
          />
        }
      </>
    );
  }
}

export default PrecinctsView;