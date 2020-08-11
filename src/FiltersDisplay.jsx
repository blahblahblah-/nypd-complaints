import React from 'react';
import { Header } from 'semantic-ui-react';

import { categories, additionalCategories } from './utils/configs';

import './FiltersDisplay.scss';

class FiltersDisplay extends React.Component {
  render() {
    const { filters } = this.props;
    const { fromDate, toDate } = filters;
    const str = [`Period: ${fromDate.getFullYear()}/${(fromDate.getMonth() + 1 + '').padStart(2, '0')} to ${toDate.getFullYear()}/${(toDate.getMonth() + 1 + '').padStart(2, '0')}`];
    const strs = str.concat(Object.keys(filters)
      .filter((k) => !['fromDate', 'toDate'].includes(k) && filters[k].length)
      .map((k) => `${additionalCategories[k] || categories[k]}: ${filters[k].join(', ').replace(/:/gi, ' - ')}`));

    return (
      <div className='filter-display'>
        { strs.map((s, i) => (<Header as='h5' key={i}>{ s }</Header>)) }
      </div>
    )
  }
}

export default FiltersDisplay;