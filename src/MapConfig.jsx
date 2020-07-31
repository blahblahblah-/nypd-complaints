import React from 'react';
import { Segment, Form, Menu, Dropdown, Button } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';

import { minDate, maxDate, categories, ethnicities, genders, officerGenders, ageGroups, conclusions } from './utils/searchTerms';

import 'react-datepicker/dist/react-datepicker.css';
import './MapConfig.scss';

class MapConfig extends React.Component {
  categoryOptions() {
    const { selectedCategories } = this.props;

    return categories.flatMap((c) => {
      const primary = {
        'key': c.name,
        'text': c.name,
        'value': c.name
      }
      const seconadary = c.subcategories.map((s) => {
        return {
          'key': `${c.name}:${s}`,
          'text': `${c.name} - ${s}`,
          'value': `${c.name}:${s}`,
          'disabled': selectedCategories.includes(c.name), // Disable if top-level is already selected
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
    const { mode, fromDate, toDate,
      selectedCategories, complainant_ethnicity, complainant_gender, complainant_age_incident, mos_ethnicity, mos_gender, board_disposition,
      allegationsCount, complaintsCount, officersCount,
      handleFromDateChange, handleToDateChange, handleModeClick, handleCategoryFilterChange, handleFilterChange, handleReset } = this.props;

    return (
      <Segment inverted className='map-config'>
        <Form inverted size='mini'>
          <Menu inverted fluid widths={3} size='mini'>
            <Menu.Item name='officers' content={`Officers with Complaints (${officersCount})`} active={mode === 'officers'}
              onClick={handleModeClick} />
            <Menu.Item name='complaints' content={`Complaints (${complaintsCount})`} active={mode === 'complaints'}
              onClick={handleModeClick} />
            <Menu.Item name='allegations' content={`Allegations (${allegationsCount})`} active={mode === 'allegations'}
              onClick={handleModeClick} />
          </Menu>
          <Form.Group widths='equal'>
            <Form.Field>
              <DatePicker
                name='fromYear'
                minDate={minDate}
                maxDate={maxDate}
                selected={fromDate}
                onChange={handleFromDateChange}
                selectsStart
                showYearDropdown
                showMonthYearPicker
                dateFormat="yyyy/MM"
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
                selected={toDate}
                onChange={handleToDateChange}
                selectsEnd
                showYearDropdown
                showMonthYearPicker
                dateFormat="yyyy/MM"
              />
            </Form.Field>
          </Form.Group>
          <Form.Field>
            <Dropdown
              name='category'
              placeholder='Filter by Allegation Type'
              fluid
              multiple
              search
              selection
              options={this.categoryOptions()}
              onChange={handleCategoryFilterChange}
              value={selectedCategories}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Complainant Ethnicity'
              name='complainant_ethnicity'
              fluid
              multiple
              search
              selection
              options={this.options(ethnicities)}
              onChange={handleFilterChange}
              value={complainant_ethnicity}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Complainant Gender'
              name='complainant_gender'
              fluid
              multiple
              search
              selection
              options={this.options(genders)}
              onChange={handleFilterChange}
              value={complainant_gender}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Complainant Age Group'
              name='complainant_age_incident'
              fluid
              multiple
              search
              selection
              options={this.ageGroupOptions()}
              onChange={handleFilterChange}
              value={complainant_age_incident}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Officers Ethnicity'
              name='mos_ethnicity'
              fluid
              multiple
              search
              selection
              options={this.options(ethnicities)}
              onChange={handleFilterChange}
              value={mos_ethnicity}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder='Filter by Officers Gender'
              name='mos_gender'
              fluid
              multiple
              search
              selection
              options={this.officerGenderOptions()}
              onChange={handleFilterChange}
              value={mos_gender}
            />
          </Form.Field>
          <Form.Field>
          <Dropdown
              placeholder='Filter by CCRB conclusions'
              name='board_disposition'
              fluid
              multiple
              search
              selection
              options={this.options(conclusions)}
              onChange={handleFilterChange}
              value={board_disposition}
            />
          </Form.Field>
          <Form.Field>
            <Button inverted onClick={handleReset}>Reset</Button>
          </Form.Field>
        </Form>
      </Segment>
    );
  }
}

export default MapConfig;