import React from 'react';
import { Segment, Header, Button, Icon, Grid, Statistic, Table, Divider, Responsive } from 'semantic-ui-react';

import { toOrdinal } from './utils/ordinals';
import { commands } from './utils/searchTerms';
import { sortData } from './utils/dataUtils';

import FiltersDisplay from './FiltersDisplay';

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
        <FiltersDisplay filters={filters} />
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