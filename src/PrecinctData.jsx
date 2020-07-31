import React from 'react';
import { Segment, Header, Button, Icon, Grid, Statistic, Table, Divider } from 'semantic-ui-react';

import { toOrdinal } from './utils/ordinals.js'

import './PrecinctData.scss';

class PrecinctData extends React.Component {

  renderOfficersTableData() {
    const { data } = this.props;
    const { officers } = data;
    const sortedOfficers = [...officers].sort((a, b) => b.complaints.size - a.complaints.size);

    return sortedOfficers.map((officer) => {
      return (
        <Table.Row key={officer.unique_mos_id}>
          <Table.Cell>
            <a href={`https://projects.propublica.org/nypd-ccrb/officer/${officer.unique_mos_id}-${officer.first_name.toLowerCase()}-${officer.last_name.toLowerCase()}`} target='_blank' rel='noopener noreferrer'>
              {officer.first_name} {officer.last_name}
            </a>
          </Table.Cell>
          <Table.Cell>{officer.shield_no !== 0 ? officer.shield_no : ''}</Table.Cell>
          <Table.Cell>{officer.command_now}</Table.Cell>
          <Table.Cell>{officer.rank_now}</Table.Cell>
          <Table.Cell>{officer.complaints.size} / { [...officer.complaints].filter(x => data.complaints.has(x)).length }</Table.Cell>
          <Table.Cell>{officer.allegations.size} / { [...officer.allegations].filter(x => data.allegations.has(x)).length } </Table.Cell>
        </Table.Row>
      )
    });
  }

  render() {
    const {
      selectedPrecinct, data,
      filters,
      handleUnselectPrecinct,
    } = this.props;

    const {
      fromDate, toDate, categories, complainant_ethnicity, complainant_gender, mos_ethnicity, mos_gender, complainant_age_incident, board_disposition,
    } = filters;

    return (
      <Segment inverted className='precinct-data'>
        <Segment className='inner-box'>
          <Grid>
            <Grid.Column floated='left' width={2}>
              <Button icon title="Back" onClick={handleUnselectPrecinct}>
                <Icon name='arrow left' />
              </Button>
            </Grid.Column>
            <Grid.Column width={14}>
              <Header as='h3'>{ toOrdinal(selectedPrecinct) } Precinct </Header>
            </Grid.Column>
          </Grid>
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
                Complainant age group: { complainant_age_incident.join(', ') }
              </Header>
            }
            {
              mos_ethnicity.length > 0 &&
              <Header as='h5'>
                Officer gender: { mos_ethnicity.join(', ') }
              </Header>
            }
            {
              mos_gender.length > 0 &&
              <Header as='h5'>
                Officer age group: { mos_gender.join(', ') }
              </Header>
            }
            {
              board_disposition.length > 0 &&
              <Header as='h5'>
                CCRB Conclusion: { board_disposition.join(', ') }
              </Header>
            }
          </div>
          <Statistic.Group widths={3} size='tiny'>
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
          <Table basic='very' size='small' unstackable fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Shield No.</Table.HeaderCell>
                <Table.HeaderCell>Current Command</Table.HeaderCell>
                <Table.HeaderCell>Current Rank</Table.HeaderCell>
                <Table.HeaderCell>Complaints / Complaints in Pct</Table.HeaderCell>
                <Table.HeaderCell>Allegations / Allegations in Pct</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              { this.renderOfficersTableData() }
            </Table.Body>
          </Table>
        </Segment>
      </Segment>
    );
  }
}

export default PrecinctData;