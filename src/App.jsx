import React from 'react';
import { Segment, Header, Menu, Icon, Dimmer, Loader } from 'semantic-ui-react';

import AboutModal from './AboutModal';
import PrecinctsView from './PrecinctsView';
import OfficersView from './OfficersView';

import './App.scss';

class App extends React.Component {
  state = { activeItem: 'precincts', isDataLoaded: false };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  componentDidMount() {
    import('./data/allegations.json')
      .then((data) => {
        this.setState({
          data: data.data,
          isDataLoaded: true,
        })
      });
  }

  renderMenu() {
    const { activeItem } = this.state

    return (
      <Menu inverted pointing>
        <Menu.Item
          name='precincts'
          active={activeItem === 'precincts'}
          onClick={this.handleItemClick}
         />
        <Menu.Item
          name='officers'
          active={activeItem === 'officers'}
          onClick={this.handleItemClick}
         />
      </Menu>
    );
  }

  render() {
    const { activeItem, data, isDataLoaded } = this.state;
    return (
      <div>
        <Segment inverted>
          <Header as='h1' color='blue' inverted>
            NYPD Complaints
            <Header.Subheader>
              Visualizations of civilian complaints against New York City police officers, as released by ProPublica&nbsp;
              <AboutModal trigger={<Icon name='info circle' link aria-label='info' fitted />} />
            </Header.Subheader>
          </Header>
        </Segment>
        {  this.renderMenu()  }
        {
          !isDataLoaded &&
          <Dimmer active>
            <Loader inverted></Loader>
          </Dimmer>
        }
        { activeItem === 'precincts' && 
          <PrecinctsView isDataLoaded={isDataLoaded} data={data} />
        }
        {
          activeItem === 'officers' &&
          <OfficersView isDataLoaded={isDataLoaded} data={data} />
        }
      </div>
    );
  }
}

export default App;
