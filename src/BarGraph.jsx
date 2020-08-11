import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

import { modes, categories } from './utils/configs';

class BarGraph extends React.Component {
  getMargin() {
    const { isMobile, secondaryCategory } = this.props;

    if (isMobile) {
      return {top: 0, right: 0, bottom: 450, left: 50 }
    }

    return {top: 0, right: secondaryCategory ? 160 : 50, bottom: 150, left: 80 };
  }

  render() {
    const { isMobile, mode, primaryCategory, secondaryCategory, graphData, secondaryKeys } = this.props;
    return (
      <ResponsiveBar
        data={graphData}
        keys={secondaryCategory ? secondaryKeys : ['value']}
        indexBy={primaryCategory}
        margin={this.getMargin()}
        padding={0.2}
        colors={{ 'scheme': 'category10' }}
        labelSkipWidth={16}
        labelSkipHeight={16}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -50,
          legendOffset: 110,
          legendPosition: 'middle',
          legend: categories[primaryCategory],
        }}
        axisLeft={{
          legendOffset: isMobile ? -40 : -60,
          tickRotation: isMobile ? -50 : 0,
          legendPosition: 'middle',
          legend: isMobile ? "" : modes[mode],
        }}
        legends={secondaryCategory && (!isMobile || secondaryKeys.length <= 11) ? [
          {
            anchor: isMobile ? "bottom" : "bottom-right",
            direction: "column",
            justify: false,
            translateX: isMobile ? 0 : 133,
            translateY: isMobile ? 340 : 0,
            itemsSpacing: 2,
            itemDirection: "left-to-right",
            itemWidth: 127,
            itemHeight: 20,
            symbolSize: 20,
            effects: [
              {
                  on: "hover",
                  style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1
                  }
              }
            ]
          }
        ] : []}
      />
    )
  }
}

export default BarGraph;