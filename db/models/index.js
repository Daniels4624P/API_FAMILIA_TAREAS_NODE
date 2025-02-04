const { User, userSchema } = require('./userModel')
const { Proyect, proyectSchema } = require('./proyectModel')
const { Folder, folderSchema } = require('./folderModel')
const { Task, taskSchema } = require('./taskModel')
const { HystoryTask, hystoryTaskSchema } = require('./hystoryTasksModel')

const setupModels = (sequelize) => {
    User.init(userSchema, User.config(sequelize))
    Proyect.init(proyectSchema, Proyect.config(sequelize))
    Folder.init(folderSchema, Folder.config(sequelize))
    Task.init(taskSchema, Task.config(sequelize))
    HystoryTask.init(hystoryTaskSchema, HystoryTask.config(sequelize))

    User.associate(sequelize.models)
    Folder.associate(sequelize.models)
    Proyect.associate(sequelize.models)
    Task.associate(sequelize.models)
    HystoryTask.associate(sequelize.models)
}

module.exports = setupModels