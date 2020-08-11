import React from 'react';
import { Segment, Header, Menu, Icon, Dimmer, Loader, Responsive } from 'semantic-ui-react';
import { BrowserRouter as Router, Switch, Route, Redirect, NavLink } from "react-router-dom";

import AboutModal from './AboutModal';
import PrecinctsView from './PrecinctsView';
import OfficersView from './OfficersView';
import OverallView from './OverallView';

import './App.scss';

class App extends React.Component {
  state = { isDataLoaded: false };

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
    return (
      <Menu inverted pointing>
        <Menu.Item as={NavLink}
          exact
          to='/'
          name='precincts'
          onClick={this.handleItemClick}
         />
        <Menu.Item as={NavLink}
          to='/officers'
          name='officers'
          onClick={this.handleItemClick}
         />
        <Menu.Item as={NavLink}
          to='/overall'
          name='overall'
         />
      </Menu>
    );
  }

  render() {
    const { data, isDataLoaded } = this.state;
    return (
      <Router>
        <Responsive as={Segment} inverted minWidth={Responsive.onlyTablet.minWidth}>
          <Header as='h1' color='blue' inverted>
            NYPD Complaints
            <Header.Subheader>
              Visualization of civilian complaints against New York City police officers, as released by ProPublica&nbsp;
              <AboutModal trigger={<Icon name='info circle' link aria-label='info' fitted />} />
            </Header.Subheader>
          </Header>
        </Responsive>
        <Responsive as={Segment} inverted {...Responsive.onlyMobile}>
          <Header as='h3' color='blue' inverted>
            NYPD Complaints <AboutModal trigger={<Icon name='info circle' link aria-label='info' fitted />} />
          </Header>
        </Responsive>
        {  this.renderMenu()  }
        {
          !isDataLoaded &&
          <Dimmer active>
            <Loader inverted></Loader>
          </Dimmer>
        }
        {
          isDataLoaded &&
          <Switch>
            <Route path="/officers" render={() => (<OfficersView isDataLoaded={isDataLoaded} data={data} />)} />
            <Route path="/overall" render={() => (<OverallView isDataLoaded={isDataLoaded} data={data} />)} />
            <Route exact path="/" render={() => (<PrecinctsView isDataLoaded={isDataLoaded} data={data} />)} />
            <Redirect to="/" />
          </Switch>
        }
      </Router>
    );
  }
}

export default App;
