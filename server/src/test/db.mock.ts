// Mock database for testing

const mockDb = {
  // Mock data storage
  _data: {
    users: [],
    roles: [],
    permissions: [],
    user_roles: [],
    role_permissions: [],
    templates: [],
    response_formats: [],
    conversations: [],
    widget_configs: [],
  },

  // Reset all data
  _reset() {
    Object.keys(this._data).forEach((table) => {
      this._data[table] = [];
    });
  },

  // Mock knex query builder
  select: jest.fn().mockImplementation(function () {
    return this;
  }),
  where: jest.fn().mockImplementation(function () {
    return this;
  }),
  whereIn: jest.fn().mockImplementation(function () {
    return this;
  }),
  whereNotNull: jest.fn().mockImplementation(function () {
    return this;
  }),
  first: jest.fn().mockImplementation(function () {
    return Promise.resolve(null);
  }),
  insert: jest.fn().mockImplementation(function () {
    return Promise.resolve([1]);
  }),
  update: jest.fn().mockImplementation(function () {
    return Promise.resolve(1);
  }),
  delete: jest.fn().mockImplementation(function () {
    return Promise.resolve(1);
  }),
  join: jest.fn().mockImplementation(function () {
    return this;
  }),
  leftJoin: jest.fn().mockImplementation(function () {
    return this;
  }),
  count: jest.fn().mockImplementation(function () {
    return Promise.resolve([{ count: 0 }]);
  }),
  orderBy: jest.fn().mockImplementation(function () {
    return this;
  }),
  limit: jest.fn().mockImplementation(function () {
    return this;
  }),
  offset: jest.fn().mockImplementation(function () {
    return this;
  }),
  distinct: jest.fn().mockImplementation(function () {
    return this;
  }),
  clone: jest.fn().mockImplementation(function () {
    return this;
  }),
  transaction: jest.fn().mockImplementation(() => ({
    commit: jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
    insert: jest.fn().mockResolvedValue([1]),
    update: jest.fn().mockResolvedValue(1),
    delete: jest.fn().mockResolvedValue(1),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(null),
  })),
  raw: jest.fn().mockImplementation((query) => query),
  schema: {
    createTableIfNotExists: jest
      .fn()
      .mockImplementation(() => Promise.resolve()),
  },
  destroy: jest.fn().mockImplementation(() => Promise.resolve()),
  fn: {
    now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP"),
  },
};

// Helper to create a table query builder
const createTableQueryBuilder = (tableName: string) => {
  const builder = Object.assign({}, mockDb);

  // Override first to return data from the mock storage
  builder.first = jest.fn().mockImplementation(() => {
    const items = mockDb._data[tableName] || [];
    return Promise.resolve(items[0] || null);
  });

  return builder;
};

// Mock the db function to return the query builder
const db = jest.fn().mockImplementation((tableName: string) => {
  return createTableQueryBuilder(tableName);
});

// Copy all properties from mockDb to db
Object.assign(db, mockDb);

export { db };
