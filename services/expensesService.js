const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const sequelize = require('./../libs/sequelize')
const { Op } = require('sequelize')

class ExpensesService {
    async createExpense(expense) {
        expense.valor = Number(expense.valor)
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Crear el gasto
            const newExpense = await models.Expenses.create(expense, { transaction: t });
    
            // 2️⃣ Restar saldo de la cuenta origen
            const accountExpense = await models.Accounts.findByPk(newExpense.cuentaId, { transaction: t });
            if (!accountExpense) {
                throw boom.notFound('Cuenta origen no encontrada');
            }
    
            await accountExpense.update(
                { saldo: Number(accountExpense.saldo) - Number(newExpense.valor) },
                { transaction: t }
            );
    
            // 3️⃣ Sumar saldo a la cuenta destino (si existe)
            if (newExpense.destinoId) {
                const accountDestino = await models.Accounts.findByPk(newExpense.destinoId, { transaction: t });
                if (!accountDestino) {
                    throw boom.notFound('Cuenta destino no encontrada');
                }
    
                await accountDestino.update(
                    { saldo: Number(accountDestino.saldo) + Number(newExpense.valor) },
                    { transaction: t }
                );
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
        // Asegurar que el valor sea número
        newExpenseData.valor = Number(newExpenseData.valor);
        if (isNaN(newExpenseData.valor)) {
            throw boom.badRequest('El valor debe ser un número válido');
        }

        return await sequelize.transaction(async (t) => {
            const expense = await models.Expenses.findByPk(expenseId, { transaction: t });
            if (!expense) {
                throw boom.notFound('Gasto no encontrado');
            }

            // Revertir saldos antiguos
            const oldAccount = await models.Accounts.findByPk(expense.cuentaId, { transaction: t });
            if (oldAccount) {
                await oldAccount.update(
                    { saldo: Number(oldAccount.saldo) + Number(expense.valor) },
                    { transaction: t }
                );
            }

            if (expense.destinoId) {
                const oldDestino = await models.Accounts.findByPk(expense.destinoId, { transaction: t });
                if (oldDestino) {
                    await oldDestino.update(
                        { saldo: Number(oldDestino.saldo) - Number(expense.valor) },
                        { transaction: t }
                    );
                }
            }

            // Actualizar el gasto
            await expense.update({
                cuentaId: newExpenseData.cuentaId,
                destinoId: newExpenseData.destinoId,
                valor: newExpenseData.valor,
                description: newExpenseData.description,
                fecha: newExpenseData.fecha,
            }, { transaction: t });

            // Aplicar nuevos saldos
            const newAccount = await models.Accounts.findByPk(newExpenseData.cuentaId, { transaction: t });
            if (newAccount) {
                await newAccount.update(
                    { saldo: Number(newAccount.saldo) - Number(newExpenseData.valor) },
                    { transaction: t }
                );
            }

            if (newExpenseData.destinoId) {
                const newDestino = await models.Accounts.findByPk(newExpenseData.destinoId, { transaction: t });
                if (newDestino) {
                    await newDestino.update(
                        { saldo: Number(newDestino.saldo) + Number(newExpenseData.valor) },
                        { transaction: t }
                    );
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
                    { saldo: Number(accountExpense.saldo) + Number(expense.valor) },
                    { transaction: t }
                );
            }
    
            // 3️⃣ Restar saldo de la cuenta destino (si existe)
            if (expense.destinoId) {
                const accountDestino = await models.Accounts.findByPk(expense.destinoId, { transaction: t });
                if (accountDestino) {
                    await accountDestino.update(
                        { saldo: Number(accountDestino.saldo) - Number(expense.valor) },
                        { transaction: t }
                    );
                }
            }
    
            // 4️⃣ Eliminar el gasto
            await expense.destroy({ transaction: t });
    
            console.log(`🗑️ Gasto eliminado correctamente`);
        });
    }

    
}

module.exports = ExpensesService