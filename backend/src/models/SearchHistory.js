const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        query: {
            type: String,
            required: true,
            trim: true,
        },
        searchType: {
            type: String,
            enum: ['keyword', 'semantic'],
            default: 'keyword',
            index: true,
        },
        resultsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
