const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const sequelize = require('./../libs/sequelize')
const { Op } = require('sequelize')

class ExpensesService {
    async createExpense(expense) {
        return await sequelize.transaction(async (t) => {
            // Crear el gasto
            const newExpense = await models.Expenses.create(expense, { transaction: t });
    
            // Buscar la cuenta de origen
            const accountExpense = await models.Accounts.findByPk(newExpense.cuentaId, { transaction: t });
            if (!accountExpense) {
                throw boom.notFound('Cuenta origen no encontrada');
            }
    
            if (newExpense.public) {
                // Buscar la cuenta destino
                const accountDestinoExpense = await models.Accounts.findByPk(newExpense.destinoId, { transaction: t });
                if (!accountDestinoExpense) {
                    throw boom.notFound('Cuenta destino no encontrada');
                }
    
                // Calcular nuevos saldos
                const newSaldo = accountExpense.saldo - newExpense.valor;
                const newSaldoDestino = accountDestinoExpense.saldo + newExpense.valor;
    
                // Actualizar ambas cuentas
                await accountExpense.update({ saldo: newSaldo }, { transaction: t });
                await accountDestinoExpense.update({ saldo: newSaldoDestino }, { transaction: t });
    
                console.log(`✅ Se restó ${newExpense.valor} de la cuenta origen y se sumó a la cuenta destino`);
            } else {
                // Si no es pública, solo actualizar la cuenta de origen
                const newSaldo = accountExpense.saldo - newExpense.valor;
                await accountExpense.update({ saldo: newSaldo }, { transaction: t });
    
                console.log(`✅ Se restó ${newExpense.valor} de la cuenta origen`);
            }
    
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
