import React from 'react';
import { Grid, Segment, Table } from 'semantic-ui-react';

class OfficersView extends React.Component {
  render() {
    return (
      <Grid>
        <Grid.Column width={12} floated='right'>
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
              </Table.Body>
            </Table>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default OfficersView;