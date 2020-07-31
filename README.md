# NYPD Complaints

A frontend-only React app, providing visualization of civilian complaints against New York City police officers as provided by ProPublica.

Project was started with using [Create React App](https://create-react-app.dev/docs/getting-started/). Uses [Mapbox](https://www.mapbox.com) for maps, [Semantic UI React](https://react.semantic-ui.com/) for UI elements.

See it live at https://www.nypdcomplaints.com.

## Running locally

`````
$ brew install yarn
$ yarn install
`````

* Sign up for an account with [Mapbox](https://www.mapbox.com), get a token and add it to an `.env` file as `REACT_APP_MAPBOX_TOKEN`.

* Download datasets from [ProPublica](https://www.propublica.org/datastore/dataset/civilian-complaints-against-new-york-city-police-officers)
* Download [NYC Police Precincts map data](https://data.cityofnewyork.us/Public-Safety/Police-Precincts/78dh-3ptz)

`````
$ node scripts/generateDataJson.js
$ yarn start
`````


