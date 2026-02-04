function crudRepository(model) {
  return {
    create: async (data) => {
      try {
        const instance = await model(data);
        return await instance.save();
      } catch (error) {
        throw error;
      }
    },
    reads: async (page = 1) => {
      try {
        const limit = 20;
        const skip = (page - 1) * limit;

        const data = await model
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        return data;
      } catch (error) {
        throw error;
      }
    },

    update: async (id, data) => {
      try {
        const instance = await model.findByIdAndUpdate(id, data, { new: true });
        return instance;
      } catch (error) {
        throw error;
      }
    },
    delete: async (id) => {
      try {
        const instance = await model.findByIdAndDelete(id);
        return instance;
      } catch (error) {
        throw error;
      }
    },
    read: async (id) => {
      try {
        const record = await model.findById(id);

        if (!record) {
          throw new Error("Record not found");
        }

        return record;
      } catch (error) {
        throw error;
      }
    },
  };
}

module.exports = crudRepository;
