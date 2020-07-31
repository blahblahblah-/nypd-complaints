import React from 'react';
import { Modal, Divider } from 'semantic-ui-react';

class AboutModal extends React.Component {
  render() {
    return(
      <Modal basic
        trigger={this.props.trigger}
        closeIcon dimmer="blurring" closeOnDocumentClick closeOnDimmerClick>
        <Modal.Header>
          About
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>
              Shortly after 50-a—the statue in New York state shielding police disciplinary records from the public, was repealed, ProPublica
              <a href='https://www.propublica.org/article/nypd-civilian-complaint-review-board-editors-note' target='_blank' rel="noopener noreferrer">published over 12,000
              records</a> of civilian complaints filed against New York City police officers on July 26, 2020.
            </p>
            <p>
              <em>NYPD Complaints</em> was a project started to complement and augment the <a href='https://projects.propublica.org/nypd-ccrb/' target='_blank' rel="noopener noreferrer">ProPublica project</a> with
              data visualizations and query tools to let us further understand more about who the alleged abuses were coming from and the communities they affected.
            </p>
            <p>
              ProPublica obtained these records from the Civilian Complaint Review Board (CCRB). It's important to note that this data only
              includes closed cases of officers that <em>are still on the force</em>, and had <em>at least one substantiated allegation</em> against them.
            </p>
            <Divider />
            <p>
              Uses <a href='https://www.propublica.org/datastore/dataset/civilian-complaints-against-new-york-city-police-officers' target='_blank' rel="noopener noreferrer">
              Civilian Complaints Against New York City Police Officers              
              </a> dataset provided by ProPublica, published in July 2020.
            </p>
            <p>
              Precinct map data provided by <a href='https://data.cityofnewyork.us/Public-Safety/Police-Precincts/78dh-3ptz' target='_blank' rel="noopener noreferrer">NYC Open Data</a>.
            </p>
            <p>
              Created by <a href='https://sunny.ng' target='_blank' rel="noopener noreferrer">Sunny Ng</a>.
            </p>
            <p>
              Source code on <a href='https://github.com/blahblahblah-/nypd-complaints' target='_blank' rel="noopener noreferrer">Github</a>.
            </p>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    )
  }
}

export default AboutModal;