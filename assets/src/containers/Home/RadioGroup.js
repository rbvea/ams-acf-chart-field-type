import React, { Component }  from 'react'
import { Radio } from 'rebass'

export default class RadioGroup extends Component {
  /**
   *  Maps redux set_type action
   */
  set_type(e) {
    this.props.save_type(
      e.target.value,
      this.props.post_id,
      this.props.name,
      this.props
    )
  }
  render() {
    const { type } = this.props;
    return (
      <form onChange={this.set_type.bind(this)}>
        <Radio
          type="radio"
          checked={type == 'pie'}
          label="Pie Chart"
          aria-label="Pie Chart"
          name="pie"
          value="pie"
          readOnly={true}
          group="type"
        >
        </Radio>
        <Radio
          label="Line Chart"
          aria-label="Line Chart"
          name="line"
          readOnly={true}
          checked={type == 'line'}
          value="line"
        >
        </Radio>
        <Radio
          aria-label="Bar Chart"
          label="Bar Chart"
          name="bar"
          readOnly={true}
          checked={type == 'bar'}
          value="bar"
        >
        </Radio>
      </form>
    )
  }
}