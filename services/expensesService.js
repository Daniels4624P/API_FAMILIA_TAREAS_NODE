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

    async updateExpense(userId, id, changes) {
        return await sequelize.transaction(async (t) => {
            const expense = await models.Expenses.findOne({
                where: { userId, id },
                transaction: t
            });
    
            if (!expense) {
                throw boom.notFound('No se encontró el gasto');
            }
    
            const accountExpense = await models.Accounts.findByPk(expense.cuentaId, { transaction: t });
            if (!accountExpense) {
                throw boom.notFound('No se encontró la cuenta asociada al gasto');
            }
    
            const diferencia = expense.valor - (changes.valor ?? expense.valor);
            await accountExpense.update(
                { saldo: accountExpense.saldo + diferencia },
                { transaction: t }
            );
    
            await expense.update(changes, { transaction: t });
    
            return expense;
        });
    }
    
    async deleteExpense(userId, id) {
        return await sequelize.transaction(async (t) => {
            const expense = await models.Expenses.findOne({
                where: { userId, id },
                transaction: t
            });
    
            if (!expense) {
                throw boom.notFound('No se encontró el gasto');
            }
    
            const accountExpense = await models.Accounts.findByPk(expense.cuentaId, { transaction: t });
            if (!accountExpense) {
                throw boom.notFound('No se encontró la cuenta asociada al gasto');
            }
    
            await accountExpense.update(
                { saldo: accountExpense.saldo + expense.valor },
                { transaction: t }
            );
    
            await expense.destroy({ transaction: t });
    
            return { message: 'El gasto se eliminó correctamente' };
        });
    }
    
}

module.exports = ExpensesService
