import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const PostTags = sequelize.define('post_tags', {
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});



PostTags.getPostTags = async (post_id) => {
    const postTags = await PostTags.findAll({where: {post_id: post_id}, include: [{
        model:Tags,
        attributes: ['id', 'name']
    }]});
    return postTags
}
PostTags.addTagsToPost = async (post_id, tag_id) => {
    const postTags = await PostTags.create({post_id: post_id, tag_id: tag_id});
    return postTags
}

export default PostTags;
