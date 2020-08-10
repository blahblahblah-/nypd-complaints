import React from 'react';
import { Segment, Form, Dropdown } from 'semantic-ui-react';

import { modes, categories } from './utils/graphConfigs';

import './GraphConfigPanel.scss';

class GraphConfigPanel extends React.Component {
  transformToOptions(obj) {
    const { mode } = this.props;
    return Object.keys(obj).filter((k) => mode === 'officers' || !['complaints_count', 'allegations_count'].includes(k)).map((k) => {
      const o = obj[k];
      return {
        key: k,
        text: o,
        value: k,
      }
    });
  }

  render() {
    const { mode, primaryCategory, secondaryCategory, handleValueChange, handleLimitChange, limit, maxLimit } = this.props;

    return (
      <Segment inverted className='graph-config-panel'>
        <Form inverted size='mini'>
          <Form.Field>
            <label>y-axis values</label>
            <Dropdown
              name='mode'
              fluid
              selection
              options={this.transformToOptions(modes)}
              onChange={handleValueChange}
              value={mode}
            />
          </Form.Field>
          <Form.Field>
            <label>x-axis category</label>
            <Dropdown
              name='primaryCategory'
              fluid
              selection
              options={this.transformToOptions(categories)}
              onChange={handleValueChange}
              value={primaryCategory}
            />
          </Form.Field>
          <Form.Field>
            <label>Stacked bars category (optional)</label>
            <Dropdown
              name='secondaryCategory'
              selection
              clearable
              disabled={['complaints_count', 'allegations_count'].includes(primaryCategory)}
              options={this.transformToOptions(categories)}
              onChange={handleValueChange}
              value={secondaryCategory}
            />
          </Form.Field>
          <Form.Field>
            <label>x-axis Category Bars Limit: {limit}</label>
            <input
              type='range'
              min='1'
              max={maxLimit}
              name='limit'
              onChange={handleLimitChange}
              value={limit}
              className='category-bars'
            />
          </Form.Field>
        </Form>
      </Segment>
    );
  }
}

export default GraphConfigPanel;