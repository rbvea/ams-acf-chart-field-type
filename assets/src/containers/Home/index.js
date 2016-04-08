import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as actionCreators from '../../actions/app.js';

import DocumentMeta from 'react-document-meta';
import Dropzone from 'react-dropzone';
import csv from 'csv';
import styles from './home.scss';
import request from 'reqwest-without-xhr2';
import classnames from 'classnames';
import { Radio, Button, Divider, Checkbox, Overlay, Close } from 'rebass';
import DataTable from '../../components/Table/DataTable.js';
import RadioGroup from './RadioGroup.js';
import Form from '../../components/Form/AxisForm.js';
import { initialGraph } from '../../models/graph.js';

import qs from 'qs';

import Graph from '../Graph';

/**
 *  Home Component
 *
 *  Houses Graphs/DataTable/Controls if not in edit state
 *         Upload component if in edit state
 */
@connect(
  state => state.app,
  dispatch => bindActionCreators(actionCreators, dispatch)
)
export class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: null,
      edit: false,
      overlay_open: false
    }
  }

  static childContextTypes = {
    rebass: React.PropTypes.object
  }

  /**
   *  Calculate which graph to pull in
   */
  componentDidMount() {
    const section = ReactDOM.findDOMNode(this)
    let parent = section.parentNode;
    while(!parent.classList.contains('acf-chart')) {
      parent = parent.parentNode;
    }
    const location = qs.parse(window.location.search.replace('?', ''))
    const id_param = parent.getAttribute('data-id');
    const id = location.post || id_param
    parent.setAttribute(`data-id`, id)
    const name = parent.getAttribute('data-name')
    this.props.init_data(id, name)
    this.setState({id, name})
  }

  /**
   *  @function saveImage
   *  @description parses with fabric and posts
   */
  saveImage(e) {
    e.preventDefault()
    this.setState({overlay_open: true})
    require(['fabric-webpack', 'notie'], ({fabric}, notie) => {
      const {
        Canvas
      } = fabric;

      const elm = ReactDOM.findDOMNode(this)
      const svg = elm.querySelector('.Overlay svg')

      const can = new Canvas();

      let {
        height,
        width
      } = svg.style;

      height = parseInt(height.replace('px', ''))
      width = parseInt(width.replace('px', ''))

      can.setWidth(width);
      can.setHeight(height);

      const id = elm.parentNode.getAttribute('id')
      fabric.parseSVGDocument(svg, (layers) => {
        layers.forEach(layer => can.add(layer))
        let data = can.toDataURL()
        if(data === 'data:,') {
          notie.alert(3, 'Failed to parse svg', 2);
          return
        }

        data = data.replace('data:image/png;base64,', '')

        request({
          method: 'POST',
          url: `/acf-chart/thumbnail/${this.state.id}/${this.state.name}/`,
          data: {
            base64: data
          }
        })
        .then(() => {
          notie.alert(1, 'Success!', 2)
          this.setState({overlay_open: false})
        })
        .fail(() => notie.alert(2, 'An error occurred', 2))
      })
    })
  }

  /**
   *  Configure Rebass
   */
  getChildContext() {
    return {
      rebass: {
        colors: {
          primary: '#4088DD',
          success: '#77CD19',
          error: '#CD051E',
          info: '#AAA'
        },
        inverted: '#FDFDFD',
        Button: {
          textTransform: 'uppercase',
          letteSpacing: '0.05em'
        }
      }
    }
  }

  /**
   *  @param files {array}
   */
  handleFiles(files) {
    const reader = new FileReader()
    reader.onload = () => {
      csv.parse(reader.result, (err, res) => {
        if(err) {
          throw err
        }
        const graph = Object.assign({data: res, type: 'line'}, initialGraph);
        const json = JSON.stringify(graph)

        request({
          url: `/acf-chart/update/${this.state.id}/${this.state.name}/`,
          method: 'POST',
          data: {
            json
          }
        })
        .then(() => {
          this.props.create_graph(graph, this.state.id, this.state.name)
          this.setState({
            edit: false
          })
          this.saveImage()
        })
        .catch(err => {
          console.log(err)
        })
      })
    }
    const file = files.shift()
    reader.readAsText(file)
  }

  /**
   *  Manages edit function
   */
  toggleEdit(e) {
    e.preventDefault()
    this.setState({
      edit: !this.state.edit
    })
  }

  save_graph(graph, e) {
    e.preventDefault()
    this.props.save_graph(graph, this.state.id, this.state.name)
  }

  toggleOverlay(e) {
    e.preventDefault()
    this.setState({overlay_open: !this.state.overlay_open})
  }

  render() {

    const {
      graphs
    } = this.props

    if(!graphs || !this.state.name) {
      return <div></div>
    }

    const post_graphs = graphs[this.state.id]

    if(!post_graphs || !post_graphs[this.state.name]) {
      return <div>loading</div>
    }

    const graph = post_graphs[this.state.name]

    let {
      type,
      data,
      colors,
      currentColumn
    } = post_graphs[this.state.name]

    if(!type) {
      type = 'line'
    }

    const main = data && !this.state.edit ? (
      <div>
        <h3 for="pie">Chart</h3>
        <RadioGroup
          post_id={this.state.id}
          name={this.state.name}
          type={type}
          {...this.props}
        >
        </RadioGroup>
        <Graph
          graph={graph}
          disableAnimation={true}
          id={this.state.id}
        >
        </Graph>

        <DataTable
          name={this.state.name}
          id={this.state.id}
          graph={graph}
          type={type}
          currentColumn={currentColumn}
          {...this.props}
        ></DataTable>

        <Form
          display={graph.type == 'pie' ? 'none' : 'block'}
          graph={graph}
          name={this.state.name}
          id={this.state.id}
          {...this.props}>
        </Form>

        <Divider/>

        <h1>Update Graph</h1>

        <Button
          theme='success'
          style={{ marginRight: '8px' }}
          onClick={this.saveImage.bind(this)}>Save as thumbnail
        </Button>

        <Button
          theme='success'
          onClick={this.save_graph.bind(this, graph)}>Save Graph
        </Button>

      </div>
    ) : (
      <Dropzone onDrop={this.handleFiles.bind(this)} accept="text/csv">
        <div className="drop-text">
          Drop csv files here or click to trigger form.
        </div>
      </Dropzone>
    )

    return (
      <section>
        {main}
        <Divider/>
        <Button
          backgroundColor={this.state.edit === true ? 'white': 'primary'}
          color={this.state.edit === true ? 'primary': 'white'}
          style={{ marginRight: '8px' }}
          onClick={this.toggleEdit.bind(this)}>Edit data
        </Button>
        <Overlay
          style={{
            backgroundColor: '#FDFDFD',
            textAlign: 'center'
          }}
          open={this.state.overlay_open}
          dark={true}
          box={true}
        >
          <div style={{border: '2px double #111111'}}>
            <Graph
              graph={graph}
              disableAnimation={true}
              width={1080}
              id={this.state.id}
            >
            <h1 style={{textAlign: 'center'}}>Generating graph...</h1>
            </Graph>
            <Close
              style={{position: 'absolute', right: '10px', top: '10px'}}
              onClick={this.toggleOverlay.bind(this)}>
            </Close>
          </div>
        </Overlay>
        <Button onClick={this.toggleOverlay.bind(this)}>Test</Button>
      </section>
    );

  }
}
