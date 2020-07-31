export const filterData = (data, filters) => {
  const primaryCategories = filters.categories.filter((c) => c.indexOf(':') === -1);
  const secondaryCategories = filters.categories.filter((c) => c.indexOf(':') !== -1);

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
    return ['complainant_ethnicity', 'complainant_gender', 'mos_ethnicity', 'mos_gender', 'command_at_incident', 'command_now', 'rank_incident', 'rank_now', 'board_disposition'].every((name) => {
      return !filters[name] || filters[name].length === 0 || filters[name].includes(d[name]);
    })
  }).filter((d) => {
    return filters.complainant_age_incident.length === 0 || filters.complainant_age_incident.some((ageGroup) => {
      const array = ageGroup.split(':');
      const min = array[0];
      const max = array[1];

      return d.complainant_age_incident >= min && d.complainant_age_incident <= max;
    })
  })
}