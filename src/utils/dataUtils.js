export const filterData = (data, filters) => {
  const primaryCategories = filters.categories.filter((c) => c.indexOf(':') === -1);
  const secondaryCategories = filters.categories.filter((c) => c.indexOf(':') !== -1);

  const primaryConclusions = filters.board_disposition.filter((c) => c.indexOf(':') === -1);
  const secondaryConclusions = filters.board_disposition.filter((c) => c.indexOf(':') !== -1);

  return data.filter((d) => {
    const date = new Date(`${d.year_received}/${d.month_received}/01`);
    return date >= filters.fromDate && date <= filters.toDate;
  }).filter((d) => {
    return filters.categories.length === 0 || primaryCategories.includes(d.fado_type) || secondaryCategories.some((c) => {
      const array = c.split(':');
      const primary = array[0];
      const secondary = array[1];
      return d.fado_type === primary && d.allegation === secondary;
    });
  }).filter((d) => {
    return ['complainant_ethnicity', 'complainant_gender', 'mos_ethnicity', 'mos_gender', 'command_at_incident', 'command_now', 'rank_incident', 'rank_now'].every((name) => {
      return !filters[name] || filters[name].length === 0 || filters[name].includes(d[name]);
    })
  }).filter((d) => {
    return filters.complainant_age_incident.length === 0 || filters.complainant_age_incident.some((ageGroup) => {
      const array = ageGroup.split(':');
      const min = array[0];
      const max = array[1];

      return d.complainant_age_incident >= min && d.complainant_age_incident <= max;
    })
  }).filter((d) => {
    const array = d.board_disposition.split(' (');
    const primaryConclusion = array[0];
    const secondaryConclusion = array[1]?.slice(0, -1);

    return filters.board_disposition.length === 0 || primaryConclusions.includes(primaryConclusion) || secondaryConclusions.some((c) => {
      const array = c.split(':');
      const primary = array[0];
      const secondary = array[1];
      return primaryConclusion === primary && secondaryConclusion === secondary;
    });
  })
};

export const sortData = (data, sortColumn, sortDirection) => {
  return data.sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];
    let result = 0;

    if (['allegations', 'complaints'].includes(sortColumn)) {
      aVal = a[sortColumn].size;
      bVal = b[sortColumn].size;
    } else if (sortColumn === 'name') {
      aVal = `${a.last_name}, ${a.first_name}`;
      bVal = `${b.last_name}, ${b.first_name}`;
    }

    if (aVal > bVal) {
      result = 1;
    } else if (bVal > aVal) {
      result = -1;
    }

    if (sortDirection === 'descending') {
      return result * -1;
    }
    return result;
  })
};