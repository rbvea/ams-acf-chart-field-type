import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


import DocumentMeta from 'react-document-meta';
import Dropzone from 'react-dropzone';
import csv from 'csv';
import styles from './home.scss';
import request from 'reqwest-without-xhr2';

/* components */
@connect(
  state => state.app
)
export class Home extends Component {
  constructor(props) {
    console.log(props)
    super(props)
  }
  handleFiles(files) {
    const reader = new FileReader()
    reader.onload = () => {
      csv.parse(reader.result, (err, res) => {
        if(err)
          throw err
        request({
          url: `/acf-chart/update/${this.props.id}`,
          method: 'POST',
          data: {
            json: JSON.stringify(res)
          }
        })
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log(err)
          })
      })
    }
    files.forEach(file => {
      reader.readAsText(file)
    })
  }
  render() {
    return (
      <section>
        <Dropzone onDrop={this.handleFiles.bind(this)} accept="text/csv">
          <div className="drop-text">Drop csv files here or click to trigger form.</div>
        </Dropzone>
      </section>
    );
  }
}
