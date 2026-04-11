function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function getSort(query, defaultField = 'created_at') {
  const sortBy = query.sortBy || defaultField;
  const order = String(query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return [sortBy, order];
}

module.exports = {
  getPagination,
  getSort,
};
