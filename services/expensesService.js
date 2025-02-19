const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const sequelize = require('./../libs/sequelize')
const { Op } = require('sequelize')

class ExpensesService {
    async createExpense(expense) {
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Crear el gasto
            const newExpense = await models.Expenses.create(expense, { transaction: t });
    
            // 2️⃣ Restar saldo de la cuenta origen
            const accountExpense = await models.Accounts.findByPk(newExpense.cuentaId, { transaction: t });
            if (!accountExpense) {
                throw boom.notFound('Cuenta origen no encontrada');
            }
    
            await accountExpense.update(
                { saldo: accountExpense.saldo - newExpense.valor },
                { transaction: t }
            );
            console.log(`✅ Se restó ${newExpense.valor} de la cuenta origen`);
    
            // 3️⃣ Sumar saldo a la cuenta destino (si existe)
            if (newExpense.destinoId) {
                const accountDestino = await models.Accounts.findByPk(newExpense.destinoId, { transaction: t });
                if (!accountDestino) {
                    throw boom.notFound('Cuenta destino no encontrada');
                }
    
                await accountDestino.update(
                    { saldo: accountDestino.saldo + newExpense.valor },
                    { transaction: t }
                );
                console.log(`✅ Se sumó ${newExpense.valor} a la cuenta destino`);
            }
    
            // 4️⃣ Retornar la transacción completa
            return newExpense;
        });
    }

    

    async getExpenses(userId) {
        const expenses = await models.Expenses.findAll({
            where: {
                [Op.or]: [
                    { userId },
                    { '$accountInicio.public$': true }
                ]
            },
            include: ['accountInicio', 'category', 'accountDestino']
        })
        return expenses
    }

    async getExpense(userId, id) {
        const expense = await models.Expenses.findOne({
            where: {
                id,
                [Op.or]: [
                    { userId },
                    { '$accountInicio.public$': true }
                ]
            },
            include: ['accountInicio', 'category', 'accountDestino']
        })
        if (!expense) {
            throw boom.notFound('No se encontro el gasto')
        }
        return expense
    }

    async updateExpense(expenseId, newExpenseData) {
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Buscar el gasto actual
            const expense = await models.Expenses.findByPk(expenseId, { transaction: t });
            if (!expense) {
                throw boom.notFound('Gasto no encontrado');
            }
    
            // 2️⃣ Revertir saldo de la cuenta origen
            const accountExpense = await models.Accounts.findByPk(expense.cuentaId, { transaction: t });
            if (accountExpense) {
                await accountExpense.update(
                    { saldo: accountExpense.saldo + expense.valor },
                    { transaction: t }
                );
                console.log(`🔄 Se devolvió ${expense.valor} a la cuenta origen`);
            }
    
            // 3️⃣ Revertir saldo de la cuenta destino
            if (expense.destinoId) {
                const accountDestino = await models.Accounts.findByPk(expense.destinoId, { transaction: t });
                if (accountDestino) {
                    await accountDestino.update(
                        { saldo: accountDestino.saldo - expense.valor },
                        { transaction: t }
                    );
                    console.log(`🔄 Se restó ${expense.valor} de la cuenta destino`);
                }
            }
    
            // 4️⃣ Aplicar los nuevos valores del gasto
            expense.cuentaId = newExpenseData.cuentaId;
            expense.destinoId = newExpenseData.destinoId;
            expense.valor = newExpenseData.valor;
            expense.description = newExpenseData.description;
            expense.fecha = newExpenseData.fecha;
    
            await expense.save({ transaction: t });
    
            // 5️⃣ Aplicar saldo actualizado a cuenta origen
            const newAccountExpense = await models.Accounts.findByPk(newExpenseData.cuentaId, { transaction: t });
            if (newAccountExpense) {
                await newAccountExpense.update(
                    { saldo: newAccountExpense.saldo - newExpenseData.valor },
                    { transaction: t }
                );
                console.log(`✅ Se restó ${newExpenseData.valor} de la cuenta origen`);
            }
    
            // 6️⃣ Aplicar saldo actualizado a cuenta destino (si existe)
            if (newExpenseData.destinoId) {
                const newAccountDestino = await models.Accounts.findByPk(newExpenseData.destinoId, { transaction: t });
                if (newAccountDestino) {
                    await newAccountDestino.update(
                        { saldo: newAccountDestino.saldo + newExpenseData.valor },
                        { transaction: t }
                    );
                    console.log(`✅ Se sumó ${newExpenseData.valor} a la cuenta destino`);
                }
            }
    
            console.log(`✏️ Gasto actualizado correctamente`);
        });
    }

    
    async deleteExpense(expenseId) {
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Buscar el gasto
            const expense = await models.Expenses.findByPk(expenseId, { transaction: t });
            if (!expense) {
                throw boom.notFound('Gasto no encontrado');
            }
    
            // 2️⃣ Devolver saldo a la cuenta origen
            const accountExpense = await models.Accounts.findByPk(expense.cuentaId, { transaction: t });
            if (accountExpense) {
                await accountExpense.update(
                    { saldo: accountExpense.saldo + expense.valor },
                    { transaction: t }
                );
                console.log(`✅ Se devolvió ${expense.valor} a la cuenta origen`);
            }
    
            // 3️⃣ Restar saldo de la cuenta destino (si existe)
            if (expense.destinoId) {
                const accountDestino = await models.Accounts.findByPk(expense.destinoId, { transaction: t });
                if (accountDestino) {
                    await accountDestino.update(
                        { saldo: accountDestino.saldo - expense.valor },
                        { transaction: t }
                    );
                    console.log(`✅ Se restó ${expense.valor} de la cuenta destino`);
                }
            }
    
            // 4️⃣ Eliminar el gasto
            await expense.destroy({ transaction: t });
    
            console.log(`🗑️ Gasto eliminado correctamente`);
        });
    }

    
}

module.exports = ExpensesService
