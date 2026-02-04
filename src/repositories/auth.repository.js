const { User } = require("../models");
const crudRepository = require("./crud.repository");

const baseRepository = crudRepository(User);

const authRepository = {
  ...baseRepository,
  findByEmail: async (email) => {
    // We explicitly select the password field as it's excluded by default in the model
    return User.findOne({ email }).select("+password");
  },
  // Alias for read method to match expected API
  findById: async (id) => {
    return baseRepository.read(id);
  },
};

module.exports = authRepository;
