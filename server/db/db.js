const mongoose = require('mongoose');
const { MONGO_DB_URL } = require('../const/_variables');
mongoose.connect(MONGO_DB_URL);

let model = {
    post: {
        link: String,
        post: String
    }
}

for (const m in model) {
    mongoose.model(m, new mongoose.Schema(model[m]))
}

module.exports = {
    getModel: (name) => {
        return mongoose.model(name);
    }
}