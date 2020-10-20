import React from 'react';
import { Segment, Form, Menu, Dropdown, Button, Icon, Divider, Header } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';

import {
  minDate, maxDate, categories, ethnicities, genders,
  officerGenders, ageGroups, commands, ranks, precincts, conclusions
} from './utils/searchTerms';

import 'react-datepicker/dist/react-datepicker.css';
import './FilterPanel.scss';

const ReadonlyInput = ({ name, value, onClick }) => (
  <input name={name} onClick={onClick} value={value} readonly={true} />
);

class FilterPanel extends React.Component {
  categoryOptions() {
    const { filters } = this.props;
    const filteredCategories = filters.categories;

    return categories.flatMap((c) => {
      const primary = {
        'key': c.name,
        'text': c.name,
        'value': c.name
      }
      const seconadary = c.subcategories.filter((s) => !filteredCategories?.includes(c.name)).map((s) => {
        return {
          'key': `${c.name}:${s}`,
          'text': `${c.name} - ${s}`,
          'value': `${c.name}:${s}`,
        }
      });
      seconadary.unshift(primary);
      return seconadary;
    })
  }

  officerGenderOptions() {
    return officerGenders.map((v) => {
      return {
        'key': v,
        'text': v,
        'value': v[0],
      };
    });
  }

  ageGroupOptions() {
    return ageGroups.map((v) => {
      return {
        'key': v,
        'text': v.replace(':', ' to '),
        'value': v,
      };
    });
  }

  commandOptions() {
    return Object.keys(commands).map((v) => {
      return {
        'key': v,
        'text': commands[v],
        'value': v,
      };
    });
  }

  conclusionOptions() {
    const { filters } = this.props;
    const filteredConclusions = filters.board_disposition;

    return conclusions.flatMap((c) => {
      const primary = {
        'key': c.name,
        'text': c.name,
        'value': c.name
      }
      const seconadary = c?.subcategories?.filter((s) => !filteredConclusions?.includes(c.name)).map((s) => {
        return {
          'key': `${c.name}:${s}`,
          'text': `${c.name} - ${s}`,
          'value': `${c.name}:${s}`,
        }
      }) || [];
      seconadary.unshift(primary);
      return seconadary;
    })
  }

  options(values) {
    return values.map((v) => {
      return {
        'key': v,
        'text': v,
        'value': v,
      };
    });
  }

  render() {
    const {
      mode, filters, displayProPublicaLink,
      allegationsCount, complaintsCount, officersCount, showHeader,
      handleFromDateChange, handleToDateChange, handleModeClick, handleFilterChange, handleReset
    } = this.props;

    return (
      <Segment inverted className='filter-panel'>
        {
          showHeader &&
          <Divider horizontal inverted>
            <Header size='small' inverted>Filters</Header>
          </Divider>
        }
        <Form inverted size='mini'>
        {
          handleModeClick &&
          <Menu inverted fluid widths={3} size='mini'>
            <Menu.Item name='officers' content={`Officers with Complaints (${officersCount})`} active={mode === 'officers'}
              onClick={handleModeClick} />
            <Menu.Item name='complaints' content={`Complaints (${complaintsCount})`} active={mode === 'complaints'}
              onClick={handleModeClick} />
            <Menu.Item name='allegations' content={`Allegations (${allegationsCount})`} active={mode === 'allegations'}
              onClick={handleModeClick} />
          </Menu>
        }
        {
          !handleModeClick && officersCount !== undefined &&
          <div className='summary'>
            <h5>Officers with Complaints: {officersCount}</h5>
            <h5>Complaints: {complaintsCount}</h5>
            <h5>Allegations: {allegationsCount}</h5>
          </div>
        }
          <Form.Group widths='equal'>
            <Form.Field>
              <DatePicker
                name='fromYear'
                minDate={minDate}
                maxDate={maxDate}
                selected={filters.fromDate}
                onChange={handleFromDateChange}
                selectsStart
                showYearDropdown
                showMonthYearPicker
                dateFormat="yyyy/MM"
                customInput={<ReadonlyInput />}
              />
            </Form.Field>
            <Form.Field className='to'>
              <h5>to</h5>
            </Form.Field>
            <Form.Field>
              <DatePicker
                name='toYear'
                minDate={minDate}
                maxDate={maxDate}
                selected={filters.toDate}
                onChange={handleToDateChange}
                selectsEnd
                showYearDropdown
                showMonthYearPicker
                dateFormat="yyyy/MM"
                customInput={<ReadonlyInput />}
              />
            </Form.Field>
          </Form.Group>
          <Form.Field>
            <Dropdown
              name='categories'
              placeholder='Filter by Allegation Type'
              fluid
              multiple
              search
              selection
              options={this.categoryOptions()}
              onChange={handleFilterChange}
              value={filters.categories}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Complainant Ethnicity'
              name='complainant_ethnicity'
              fluid
              multiple
              selection
              options={this.options(ethnicities)}
              onChange={handleFilterChange}
              value={filters.complainant_ethnicity}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Complainant Gender'
              name='complainant_gender'
              fluid
              multiple
              selection
              options={this.options(genders)}
              onChange={handleFilterChange}
              value={filters.complainant_gender}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Complainant Age Group'
              name='complainant_age_incident'
              fluid
              multiple
              selection
              options={this.ageGroupOptions()}
              onChange={handleFilterChange}
              value={filters.complainant_age_incident}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Officer Ethnicity'
              name='mos_ethnicity'
              fluid
              multiple
              selection
              options={this.options(ethnicities)}
              onChange={handleFilterChange}
              value={filters.mos_ethnicity}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Officer Gender'
              name='mos_gender'
              fluid
              multiple
              selection
              options={this.officerGenderOptions()}
              onChange={handleFilterChange}
              value={filters.mos_gender}
            />
          </Form.Field>
          {
            filters.command_at_incident &&
            <Form.Field>
              <Dropdown
                placeholder='Filter by Officer Command at Incident'
                name='command_at_incident'
                fluid
                multiple
                search
                selection
                options={this.commandOptions()}
                onChange={handleFilterChange}
                value={filters.command_at_incident}
              />
            </Form.Field>
          }
          { filters.command_now &&
            <Form.Field>
              <Dropdown
                placeholder='Filter by Officer Current Command'
                name='command_now'
                fluid
                multiple
                search
                selection
                options={this.commandOptions()}
                onChange={handleFilterChange}
                value={filters.command_now}
              />
            </Form.Field>
          }
          { filters.rank_incident &&
            <Form.Field>
              <Dropdown
                placeholder='Filter by Officer Rank at Incident'
                name='rank_incident'
                fluid
                multiple
                search
                selection
                options={this.options(ranks)}
                onChange={handleFilterChange}
                value={filters.rank_incident}
              />
            </Form.Field>
          }
          { filters.rank_now &&
            <Form.Field>
              <Dropdown
                placeholder='Filter by Officer Current Rank'
                name='rank_now'
                fluid
                multiple
                search
                selection
                options={this.options(ranks)}
                onChange={handleFilterChange}
                value={filters.rank_now}
              />
            </Form.Field>
          }
          { filters.precinct &&
            <Form.Field>
              <Dropdown
                placeholder='Filter by Incident Precinct'
                name='precinct'
                fluid
                multiple
                search
                selection
                options={this.options(precincts)}
                onChange={handleFilterChange}
                value={filters.precinct}
              />
            </Form.Field>
          }
          <Form.Field>
            <Dropdown
              placeholder='Filter by CCRB conclusions'
              name='board_disposition'
              fluid
              multiple
              selection
              options={this.conclusionOptions()}
              onChange={handleFilterChange}
              value={filters.board_disposition}
            />
          </Form.Field>
          <Form.Field>
            <Button inverted onClick={handleReset}>Reset</Button>
          </Form.Field>
          { displayProPublicaLink &&
             <Form.Field>
              Search by Name or Badge Number on <a href='https://projects.propublica.org/nypd-ccrb/' target='_blank' rel="noopener noreferrer">ProPublica <Icon name='external' size='small' link /></a>.
            </Form.Field>
          }
        </Form>
      </Segment>
    );
  }
}

export default FilterPanel;