const csv = require('csvtojson');
const fs = require('fs');

const path = `${__dirname}/../data/`
const fileRegex = /^allegations_.*\.csv$/

const convertObj = (obj) => {
  return {
    unique_mos_id: obj.unique_mos_id,
    complaint_id: obj.complaint_id,
    first_name: obj.first_name,
    last_name: obj.last_name,
    shield_no: obj.shield_no,
    month_received: Number(obj.month_received),
    year_received: Number(obj.year_received),
    month_received: Number(obj.month_closed),
    year_closed: Number(obj.year_closed),
    command_at_incident: obj.command_at_incident,
    command_now: obj.command_now,
    rank_incident: obj.rank_incident,
    rank_now: obj.rank_now,
    mos_ethnicity: obj.mos_ethnicity,
    mos_gender: obj.mos_gender,
    mos_age_incident: Number(obj.mos_age_incident),
    complainant_ethnicity: obj.complainant_ethnicity,
    complainant_gender: obj.complainant_gender,
    complainant_age_incident: Number(obj.complainant_age_incident),
    fado_type: obj.fado_type,
    allegation: obj.allegation,
    precinct: obj.precinct,
    contact_reason: obj.contact_reason,
    outcome_description: obj.outcome_description,
    board_disposition: obj.board_disposition
  };
}


(async () => {
  const data = [];

  await Promise.all(fs.readdirSync(path).filter((filename) => {
    return fileRegex.test(filename);
  }).map((filename) => {
    const filePath = path + filename;
    return csv().fromFile(filePath).subscribe(
      (obj) => {
        const convertedObj = convertObj(obj);
        data.push(convertedObj);
      },
      () => console.log('error'),
      () => console.log('success')
    );
  }));

  const jsonData = JSON.stringify({
    data: data
  });

  fs.writeFile(`${__dirname}/../src/data/allegations.json`, jsonData, 'utf8', (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
})();