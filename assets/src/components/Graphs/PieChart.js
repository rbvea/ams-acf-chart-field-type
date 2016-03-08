import React, { Component } from 'react';
import { VictoryPie } from 'victory';

/**
 *  Wrapper around VictoryPie
 */
export default class PieChart extends Component {
  render() {
    let {
      data,
      width
    } = this.props

    if(!data) {
      return (
        <div></div>
      )
    }

    // clone array
    data = [...data]

    const dates = data.shift()

    // transform data to VictoryPie.data
    const pie_data = data.map((datum, i) => {
      const x = datum[0]
      const y = parseInt(datum[datum.length - 1]) // use most recent data
      return { x , y }
    })

    return (
      <VictoryPie
        data={pie_data}
      >
      </VictoryPie>
    )
  }
}
