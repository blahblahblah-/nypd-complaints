import React from 'react';
import { Grid, Responsive, Segment, Dimmer, Loader, Header, Popup, Button } from 'semantic-ui-react';
import { Helmet } from "react-helmet";

import { minDate, maxDate } from './utils/searchTerms';
import { filterData } from './utils/dataUtils';
import { modes, categories, presets } from './utils/configs';

import FilterPanel from './FilterPanel';
import GraphConfigPanel from './GraphConfigPanel';
import BarGraph from './BarGraph';
import FiltersDisplay from './FiltersDisplay';

import './OverallView.scss';

class OverallView extends React.Component {
  state = {
    loaded: false,
    mode: 'officers',
    primaryCategory: 'rank_incident',
    limit: 10,
    secondaryCategory: null,
    filters: {
      fromDate: minDate,
      toDate: maxDate,
      categories: [],
      complainant_ethnicity: [],
      complainant_gender: [],
      complainant_age_incident: [],
      mos_ethnicity: [],
      mos_gender: [],
      command_at_incident: [],
      command_now: [],
      rank_incident: [],
      rank_now: [],
      precinct: [],
      board_disposition: [],
    },
    allegationsCount: 0,
    complaintsCount: 0,
    officersCount: 0,
    graphData: [],
    secondaryKeys: [],
    isMobilePopupOpen: false,
  };

  componentDidMount() {
    this.refreshData();
  }

  refreshData() {
    const { data } = this.props;
    const { filters, mode, primaryCategory, secondaryCategory } = this.state;
    let officersData = {};
    let countedData = {};
    let secondaryKeys = {};

    filterData(data, filters).forEach((d) => {
      let p = d[primaryCategory] || 'N/A';
      let s = secondaryCategory ? (d[secondaryCategory] || 'N/A') : 'value';

      if (primaryCategory === 'allegation' && p === 'Other') {
        p = `${d.fado_type} - ${p}`;
      }

      if (secondaryCategory === 'allegation' && s === 'Other') {
        s = `${d.fado_type} - ${s}`;
      }

      if (primaryCategory === 'board_disposition_primary') {
        p = d.board_disposition;

        if (p.startsWith('Substantiated')) {
          p = 'Substantiated';
        }
      }

      if (secondaryCategory === 'board_disposition_primary') {
        s = d.board_disposition;

        if (s.startsWith('Substantiated')) {
          s = 'Substantiated';
        }
      }



      if (!secondaryKeys[s]) {
        secondaryKeys[s] = 0;
      }
      secondaryKeys[s]++;

      if (!countedData[p]) {
        countedData[p] = {};
      }

      if (!countedData[p][s]) {
        countedData[p][s] = new Set();
      }

      let dataToCount;

      if (mode === 'officers') {
        dataToCount = d.unique_mos_id;
      } else if (mode === 'complaints') {
        dataToCount = d.complaint_id;
      } else {
        dataToCount = d.id;
      }

      countedData[p][s].add(dataToCount);

      if (['complaints_count', 'allegations_count'].includes(primaryCategory) || ['complaints_count', 'allegations_count'].includes(secondaryCategory)) {
        if (!officersData[d.unique_mos_id]) {
          officersData[d.unique_mos_id] = {
            'complaints': new Set(),
            'allegations': new Set(),
          };
        }
        officersData[d.unique_mos_id].allegations.add(d.id);
        officersData[d.unique_mos_id].complaints.add(d.complaint_id);
      }
    });

    if (['complaints_count', 'allegations_count'].includes(primaryCategory)) {
      const newCountedData = {};
      const field = primaryCategory.split('_')[0];
      Object.keys(countedData).forEach((k) => {
        Object.keys(countedData[k]).forEach((j) => {
          countedData[k][j].forEach((mosId) => {
            if (!newCountedData[officersData[mosId][field].size]) {
              newCountedData[officersData[mosId][field].size] = {'value': new Set()};
            }
            newCountedData[officersData[mosId][field].size].value.add(mosId);
          })
        });
      });
      countedData = newCountedData;
    }

    if (['complaints_count', 'allegations_count'].includes(secondaryCategory)) {
      const field = secondaryCategory.split('_')[0];
      secondaryKeys = {};

      Object.keys(countedData).forEach((k) => {
        const newObj = {};
        Object.keys(countedData[k]).forEach((j) => {
          countedData[k][j].forEach((mosId) => {
            if (!newObj[officersData[mosId][field].size]) {
              newObj[officersData[mosId][field].size] = new Set();
              secondaryKeys[officersData[mosId][field].size] = 0;
            }
            newObj[officersData[mosId][field].size].add(mosId);
            secondaryKeys[officersData[mosId][field].size]++;
          })
        });
        countedData[k] = newObj;
      });
    }

    const graphData = Object.keys(countedData).sort((a, b) => {
      if (['year_received','complaints_count', 'allegations_count'].includes(primaryCategory)) {
        return b - a;
      } else if (primaryCategory === 'complainant_age_incident') {
        return a - b;
      }
      return Object.keys(countedData[b]).map((k) => countedData[b][k].size).reduce((acc, cur) => acc + cur) - Object.keys(countedData[a]).map((k) => countedData[a][k].size).reduce((acc, cur) => acc + cur);
    }).map((key) => {
      const d = {
        [primaryCategory]: key,
      }

      const p = countedData[key];
      Object.keys(p).forEach((sKey) => {
        d[sKey] = p[sKey].size;
      });

      return d;
    });

    const orderedSecondaryKeys = Object.keys(secondaryKeys).sort((a, b) => {
      if (['year_received','complaints_count', 'allegations_count'].includes(secondaryCategory)) {
        return b - a;
      } else if (secondaryCategory === 'complainant_age_incident') {
        return a - b;
      }
      return secondaryKeys[b] - secondaryKeys[a];
    });

    this.setState({ data: graphData, graphData: graphData.slice(0, 50), secondaryKeys: orderedSecondaryKeys, loaded: true, limit: Math.min(30, graphData.length), maxLimit: graphData.length});
  }

  handleFromDateChange = (date) => {
    const { filters } = this.state;
    filters.fromDate = date;
    this.setState({ filters }, this.refreshData);
  }

  handleToDateChange = (date) => {
    const { filters } = this.state;
    filters.toDate = date;
    this.setState({ filters }, this.refreshData);
  }

  handleFilterChange = (e, { name, value }) => {
    const selectedPrimaries = value.filter((v) => v.indexOf(':') === -1);
    const { filters } = this.state;
    filters[name] = value.filter((v) => v.indexOf(':') === -1 || !selectedPrimaries.some((t) => v.startsWith(`${t}:`)));
    this.setState({ filters }, this.refreshData);
  };

  handleValueChange = (e, { name, value }) => {
    const { primaryCategory, secondaryCategory, mode } = this.state;
    if (name === 'mode' && value !== 'officers') {
      if (['complaints_count', 'allegations_count'].includes(primaryCategory)) {
        return this.setState({ [name]: value, 'primaryCategory': 'rank_incident' }, this.refreshData);
      } else if (['complaints_count', 'allegations_count'].includes(secondaryCategory)) {
        return this.setState({ [name]: value, 'secondaryCategory': null }, this.refreshData);
      }
    } else if (mode === 'officers' && name === 'primaryCategory' && ['complaints_count', 'allegations_count'].includes(value)) {
      return this.setState({ [name]: value, 'secondaryCategory': null }, this.refreshData);
    }
    this.setState({ [name]: value }, this.refreshData);
  };

  handleLimitChange = (e) => {
    const { data } = this.state;
    this.setState({ graphData: data.slice(0, e.target.value), limit: e.target.value });
  }

  handlePresetChange = (e, { value }) => {
    this.setState(presets[value], this.refreshData);
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
        command_at_incident: [],
        command_now: [],
        rank_incident: [],
        rank_now: [],
        precinct: [],
        board_disposition: [],
      },
      mode: 'officers',
      primaryCategory: 'rank_incident',
      secondaryCategory: null,
    }, this.refreshData);
  };

  handleToggleMobilePopup = () => {
    const { isMobilePopupOpen } = this.state;
    this.setState({ isMobilePopupOpen: !isMobilePopupOpen });
  }

  render() {
    const {
      loaded, isMobilePopupOpen,
      filters, mode, primaryCategory, secondaryCategory, graphData, secondaryKeys, maxLimit, limit,
    } = this.state;


    return (
      <>
        <Helmet>
          <title>NYPD Complaints - Overall Graph View</title>
          <meta property="og:url" content="https://www.nypdcomplaints.com/overall" />
          <meta name="twitter:url" content="https://www.nypdcomplaints.com/overall" />
          <link rel="canonical" href="https://www.nypdcomplaints.com/overall" />
          <meta property="og:title" content="NYPD Complaints - Overall Graph View" />
          <meta name="twitter:title" content="NYPD Complaints - Overall Graph View" />
        </Helmet>
        <Responsive as={Grid} centered minWidth={Responsive.onlyTablet.minWidth} className='officers-view'>
          <Grid.Column width={5}>
            <GraphConfigPanel
              mode={mode} primaryCategory={primaryCategory} secondaryCategory={secondaryCategory}
              maxLimit={maxLimit} limit={limit}
              handleValueChange={this.handleValueChange} handleLimitChange={this.handleLimitChange}
              handlePresetChange={this.handlePresetChange}
            />
            <FilterPanel filters={filters} showHeader
              handleFromDateChange={this.handleFromDateChange} handleToDateChange={this.handleToDateChange}
              handleFilterChange={this.handleFilterChange} handleReset={this.handleReset} />
          </Grid.Column>
          <Grid.Column width={11} floated='right'>
          {
            !loaded &&
            <Dimmer active>
              <Loader inverted></Loader>
            </Dimmer>
          }
            <Segment>
              <Grid>
                <Grid.Row className='graph-header'>
                  <Header as='h3'>{ modes[mode] } by { [primaryCategory, secondaryCategory].filter((c) => c).map((c) => categories[c]).join(' and ') }</Header>
                </Grid.Row>
                <Grid.Row className='graph-header'>
                  <FiltersDisplay filters={filters} />
                </Grid.Row>
                <Grid.Row style={{height: 'calc(100vh - 200px)'}}>
                  <BarGraph mode={mode} primaryCategory={primaryCategory} secondaryCategory={secondaryCategory} graphData={graphData} secondaryKeys={secondaryKeys} />
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>
        </Responsive>
        <Responsive open={isMobilePopupOpen} {...Responsive.onlyMobile}
            as={Popup} trigger={<Responsive as={Button} basic inverted fluid {...Responsive.onlyMobile} className={isMobilePopupOpen ? 'open popup-btn' : 'popup-btn'} onClick={this.handleToggleMobilePopup}>Options</Responsive>}
            on='click' position='bottom center' flowing inverted style={{padding: 0, height: '455px', overflowY: 'scroll'}}
        >
          <GraphConfigPanel
            mode={mode} primaryCategory={primaryCategory} secondaryCategory={secondaryCategory}
            maxLimit={maxLimit} limit={limit}
            handleValueChange={this.handleValueChange} handleLimitChange={this.handleLimitChange}
          />
          <FilterPanel filters={filters} showHeader
            handleFromDateChange={this.handleFromDateChange} handleToDateChange={this.handleToDateChange}
            handleFilterChange={this.handleFilterChange} handleReset={this.handleReset} />
        </Responsive>
        <Responsive as={Segment} className='mobile-segment' {...Responsive.onlyMobile}>
          <Grid>
            <Grid.Row className='graph-header'>
              <Header as='h3'>{ modes[mode] } by { [primaryCategory, secondaryCategory].filter((c) => c).map((c) => categories[c]).join(' and ') }</Header>
            </Grid.Row>
            <Grid.Row className='graph-header'>
              <FiltersDisplay filters={filters} />
            </Grid.Row>
            <Grid.Row style={{height: '100vh'}}>
              <BarGraph isMobile mode={mode} primaryCategory={primaryCategory} secondaryCategory={secondaryCategory} graphData={graphData} secondaryKeys={secondaryKeys} />
            </Grid.Row>
          </Grid>
        </Responsive>
      </>
    );
  }
}

export default OverallView;