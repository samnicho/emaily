const mongoose = require('mongoose');
const { Schema } = mongoose;

// create new instance of a mongoose Schema
// MongoDB allows records to have any properties and each record in a collection to have different properties
// mongoose tightens this up with Schemas which allow data 'models' to be created, telling MongoDB what to expect from the data
const userSchema = new Schema({
    googleId: String,
    credits: {
        type: Number,
        default: 0
    }
});

// now use this Schema to create a new collection in Mongo called 'users'
mongoose.model('users', userSchema);
