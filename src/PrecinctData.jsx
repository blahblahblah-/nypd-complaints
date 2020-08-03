import React from 'react';
import { Segment, Header, Button, Icon, Grid, Statistic, Table, Divider, Responsive } from 'semantic-ui-react';

import { toOrdinal } from './utils/ordinals';
import { commands } from './utils/searchTerms';
import { sortData } from './utils/dataUtils';

import './PrecinctData.scss';

class PrecinctData extends React.Component {
  state = { sortColumn: 'complaints', sortDirection: 'descending'};

  changeSort(column) {
    const { sortColumn, sortDirection } = this.state;
    const newState = { sortColumn: column, sortDirection: 'ascending'};

    if (column === sortColumn) {
      newState['sortDirection'] = sortDirection === 'ascending' ? 'descending' : 'ascending';
    } else if (['complaints', 'allegations'].includes(column)) {
      newState['sortDirection'] = 'descending';
    }

    this.setState(newState);
  }

  renderOfficersTableData() {
    const { data } = this.props;
    const { sortColumn, sortDirection } = this.state;
    const { officers } = data;
    const sortedOfficers = sortData([...officers], sortColumn, sortDirection);

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
          <Table.Cell>{officer.complaints.size} / { [...officer.complaints].filter(x => data.complaints.has(x)).length }</Table.Cell>
          <Table.Cell>{officer.allegations.size} / { [...officer.allegations].filter(x => data.allegations.has(x)).length } </Table.Cell>
        </Table.Row>
      )
    });
  }

  renderContent() {
    const {
      selectedPrecinct, data, isMobile,
      filters,
      handleUnselectPrecinct,
    } = this.props;
    const { sortColumn, sortDirection } = this.state;
    const {
      fromDate, toDate, categories, complainant_ethnicity, complainant_gender, mos_ethnicity, mos_gender, complainant_age_incident, board_disposition,
    } = filters;

    return (
      <Segment inverted={isMobile} className='inner-box'>
        <Responsive as={Grid} minWidth={Responsive.onlyTablet.minWidth}>
          <Grid.Column floated='left' width={2}>
            <Button icon title="Back" onClick={handleUnselectPrecinct}>
              <Icon name='arrow left' />
            </Button>
          </Grid.Column>
          <Grid.Column width={14}>
            <Header as='h3'>{ toOrdinal(selectedPrecinct) } Precinct </Header>
          </Grid.Column>
        </Responsive>
        <div className='filters'>
          <Header as='h5'>
            Period: {fromDate.getFullYear()}/{(fromDate.getMonth() + 1 + '').padStart(2, '0')} to {toDate.getFullYear()}/{(toDate.getMonth() + 1 + '').padStart(2, '0')}
          </Header>
          {
            categories.length > 0 &&
            <Header as='h5'>
              Allegation type: { categories.map((c) => c.replace(':', ' - ')).join(', ') }
            </Header>
          }
          {
            complainant_ethnicity.length > 0 &&
            <Header as='h5'>
              Complainant ethnicity: { complainant_ethnicity.join(', ') }
            </Header>
          }
          {
            complainant_gender.length > 0 &&
            <Header as='h5'>
              Complainant gender: { complainant_gender.join(', ') }
            </Header>
          }
          {
            complainant_age_incident.length > 0 &&
            <Header as='h5'>
              Complainant age group: { complainant_age_incident.join(', ').replace(/:/gi, '-') }
            </Header>
          }
          {
            mos_ethnicity.length > 0 &&
            <Header as='h5'>
              Officer ethnicity: { mos_ethnicity.join(', ') }
            </Header>
          }
          {
            mos_gender.length > 0 &&
            <Header as='h5'>
              Officer gender: { mos_gender.join(', ') }
            </Header>
          }
          {
            board_disposition.length > 0 &&
            <Header as='h5'>
              CCRB Conclusion: { board_disposition.join(', ') }
            </Header>
          }
        </div>
        <Statistic.Group widths={isMobile ?  2 : 3} size='tiny' inverted={isMobile}>
          <Statistic>
            <Statistic.Value>{ data.officers.length.toLocaleString('en-US') }</Statistic.Value>
            <Statistic.Label>Officers<br />w/ Complaints</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{ data.complaints.size.toLocaleString('en-US') }</Statistic.Value>
            <Statistic.Label>Complaints</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{ data.allegations.size.toLocaleString('en-US') }</Statistic.Value>
            <Statistic.Label>Allegations</Statistic.Label>
          </Statistic>

        </Statistic.Group>
        <Divider />
        <Table basic='very' size='small' unstackable fixed sortable compact inverted={isMobile}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={sortColumn === 'name' ? sortDirection : null}
                onClick={() => this.changeSort('name')}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={sortColumn === 'shield_no' ? sortDirection : null}
                onClick={() => this.changeSort('shield_no')}
              >
                Shield<br />No.
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={sortColumn === 'command_now' ? sortDirection : null}
                onClick={() => this.changeSort('command_now')}
              >
                Current<br />Cmd
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={sortColumn === 'rank_now' ? sortDirection : null}
                onClick={() => this.changeSort('rank_now')}
              >
                Current<br />Rank
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={sortColumn === 'complaints' ? sortDirection : null}
                onClick={() => this.changeSort('complaints')}
              >
                Compl<br />all/pct
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={sortColumn === 'allegations' ? sortDirection : null}
                onClick={() => this.changeSort('allegations')}
              >
                Allegations<br />all/pct
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { this.renderOfficersTableData() }
          </Table.Body>
        </Table>
      </Segment>
    );
  }

  render() {
    const { isMobile } = this.props;

    if (isMobile) {
      return this.renderContent();
    }

    return (
      <Segment inverted className='precinct-data'>
        { this.renderContent() }
      </Segment>
    );
  }
}

export default PrecinctData;