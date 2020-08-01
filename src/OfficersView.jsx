import React, { createRef } from 'react';
import { Grid, Segment, Table, Ref, Sticky, Dimmer, Loader, Menu, Icon } from 'semantic-ui-react';

import { minDate, maxDate, commands } from './utils/searchTerms';
import { filterData } from './utils/dataUtils';

import FilterPanel from './FilterPanel';

const paginationSize = 200;

class OfficersView extends React.Component {
  contextRef = createRef()

  state = {
    loaded: false,
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
      board_disposition: [],
    },
    allegationsCount: 0,
    complaintsCount: 0,
    officersCount: 0,
    officersData: {},
    page: 1,
  };

  componentDidMount() {
    this.refreshData();
  }

  refreshData() {
    const { data } = this.props;
    const { filters } = this.state;
    let allegationsCount = 0;
    const complaints = new Set();
    const officers = new Set();
    const officersData = {};

    filterData(data, filters).forEach((d) => {
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

    this.setState({ officersData: officersData, allegationsCount: allegationsCount, complaintsCount: complaints.size, officersCount: officers.size, loaded: true, page: 1});
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

  handleCategoryFilterChange = (e, { value }) => {
    const selectedPrimaries = value.filter((v) => v.indexOf(':') === -1);
    const { filters } = this.state;
    filters.categories = value.filter((v) => !selectedPrimaries.some((t) => v.startsWith(`${t}:`)));
    this.setState({ filters }, this.refreshData);
  };

  handleFilterChange = (e, { name, value }) => {
    const { filters } = this.state;
    filters[name] = value;
    this.setState({ filters }, this.refreshData);
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
        board_disposition: [],
      },
    }, this.refreshData);
  };

  handleBack = () => {
    const { page } = this.state;
    this.setState({ page: page - 1});
  }

  handleFoward = () => {
    const { page } = this.state;
    this.setState({ page: page + 1});
  }

  handleJump = (e, {name}) => {
    this.setState({ page: Number(name)});
  }

  renderRows() {
    const { officersData, page } = this.state;
    const officers = Object.keys(officersData).map((key) => officersData[key]);
    const sortedOfficers = [...officers].sort((a, b) => b.complaints.size - a.complaints.size).slice((page - 1) * paginationSize, page * paginationSize - 1);

    return sortedOfficers.map((officer) => {
      return (
        <Table.Row key={officer.unique_mos_id}>
          <Table.Cell>
            <a href={`https://projects.propublica.org/nypd-ccrb/officer/${officer.unique_mos_id}-${officer.first_name.toLowerCase()}-${officer.last_name.toLowerCase()}`} target='_blank' rel='noopener noreferrer'>
              {officer.first_name} {officer.last_name}
            </a>
          </Table.Cell>
          <Table.Cell>{officer.shield_no > 0 ? officer.shield_no : ''}</Table.Cell>
          <Table.Cell title={commands[officer.command_now]}>{officer.command_now}</Table.Cell>
          <Table.Cell>{officer.rank_now}</Table.Cell>
          <Table.Cell>{officer.complaints.size}</Table.Cell>
          <Table.Cell>{officer.allegations.size}</Table.Cell>
        </Table.Row>
      )
    });
  }

  renderPaginationButtons() {
    const { officersCount, page} = this.state;
    const items = [];

    for (let i = 1; i * paginationSize <= officersCount; i++) {
      items.push(<Menu.Item as='a' name={i + ''} key={i} disabled={i === page} onClick={this.handleJump}>{i}</Menu.Item>)
    }
    return (
      <>
        { items }
      </>
    );
  }

  render() {
    const {
      loaded,
      allegationsCount, complaintsCount, officersCount,
      filters, page
    } = this.state;

    return (
      <Grid centered>
        <Grid.Column width={5}>
        <Sticky context={this.contextRef}>
          <FilterPanel filters={filters}
            allegationsCount={allegationsCount} complaintsCount={complaintsCount} officersCount={officersCount}
            handleFromDateChange={this.handleFromDateChange} handleCategoryFilterChange={this.handleCategoryFilterChange}
            handleFilterChange={this.handleFilterChange} handleReset={this.handleReset} />
          }
        </Sticky>
        </Grid.Column>
        <Grid.Column width={11} floated='right'>
        {
          !loaded &&
          <Dimmer active>
            <Loader inverted></Loader>
          </Dimmer>
        }
          <Ref innerRef={this.contextRef}>
            <Segment inverted>
              <Table basic='very' size='small' unstackable fixed inverted>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Shield No.</Table.HeaderCell>
                    <Table.HeaderCell>Current Command</Table.HeaderCell>
                    <Table.HeaderCell>Current Rank</Table.HeaderCell>
                    <Table.HeaderCell>Complaints</Table.HeaderCell>
                    <Table.HeaderCell>Allegations</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  { this.renderRows() }
                </Table.Body>
                <Table.Footer>
                  { officersCount > paginationSize &&
                    <Table.Row>
                      <Table.HeaderCell colSpan='6'>
                        <Menu floated='right' pagination inverted>
                          <Menu.Item as='a' icon disabled={page === 1} onClick={this.handleBack}>
                            <Icon name='chevron left' />
                          </Menu.Item>
                          {
                            this.renderPaginationButtons()
                          }
                          <Menu.Item as='a' icon disabled={page === Math.floor(officersCount / paginationSize)} onClick={this.handleFoward}>
                            <Icon name='chevron right' />
                          </Menu.Item>
                        </Menu>
                      </Table.HeaderCell>
                    </Table.Row>
                  }
                </Table.Footer>
              </Table>
            </Segment>
          </Ref>
        </Grid.Column>  
      </Grid>
    );
  }
}

export default OfficersView;