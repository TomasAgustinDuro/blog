import { DataTypes, where } from "sequelize";
import sequelize from "../config/database.js";

const Comments = sequelize.define('comments', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, 
{timestamps: false})


// Metodos GET
Comments.getAllComments = async function (){
    const comments = await this.findAll();
    return comments;
}
Comments.getSpecificComments = async function (id){
    const comment = await this.findByPk(id);
    return comment;
}

// Metodos POST
Comments.insertComment = async (content) => {
    const comment = await Comments.create({
        name: content.name,
        content: content.content,
        date : new Date(),
        post_id: 1
    })

    return comment
}

Comments.deleteComments = async (id) => {
    const comment =  await Comments.findByPk(id)

    if(!comment) {
        throw new Error('Comentario no encontrado')
    }

    await Comments.destroy({
        where: {
            id:id
        }
    })
}

export default Comments