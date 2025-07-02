const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');
const sequelize = require('../libs/sequelize');
const { Op } = require('sequelize')

class IncomesService {
    async createIncome(income) {
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Crear el ingreso
            const newIncome = await models.Incomes.create(income, { transaction: t });
    
            // 2️⃣ Restar saldo de la cuenta origen (cuentaId)
            const accountIncome = await models.Accounts.findByPk(newIncome.cuentaId, { transaction: t });
            if (!accountIncome) {
                throw boom.notFound('Cuenta origen no encontrada');
            }
    
            await accountIncome.update(
                { saldo: accountIncome.saldo - newIncome.valor }, // 🔥 Se RESTA en la cuenta origen
                { transaction: t }
            );
            console.log(`✅ Se restó ${newIncome.valor} de la cuenta origen`);
    
            // 3️⃣ Sumar saldo a la cuenta destino (si existe)
            if (newIncome.destinoId) {
                const accountDestino = await models.Accounts.findByPk(newIncome.destinoId, { transaction: t });
                if (!accountDestino) {
                    throw boom.notFound('Cuenta destino no encontrada');
                }
    
                await accountDestino.update(
                    { saldo: accountDestino.saldo + newIncome.valor }, // ✅ Se SUMA en la cuenta destino
                    { transaction: t }
                );
                console.log(`✅ Se sumó ${newIncome.valor} a la cuenta destino`);
            }
    
            // 4️⃣ Retornar la transacción completa
            return newIncome;
        });
    }    

    async getIncomes(userId) {
        return await models.Incomes.findAll({
            where: {
                [Op.or]: [
                    { userId },
                    { '$accountInicio.public$': true }
                ]
            },
            include: ['accountInicio', 'category', 'accountDestino']
        });
    }

    async getIncome(userId, id) {
        const income = await models.Incomes.findOne({
            where: {
                id,
                [Op.or]: [
                    { userId },
                    { '$accountInicio.public$': true }
                ]
            },
            include: ['accountInicio', 'category', 'accountDestino']
        });
        if (!income) throw boom.notFound('No se encontró el ingreso');
        return income;
    }

    async updateIncome(userId, id, changes) {
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Buscar el ingreso
            const income = await models.Incomes.findOne({
                where: { id },
                transaction: t
            });
            if (!income) {
                throw boom.notFound('No se encontró el ingreso');
            }
    
            // 2️⃣ Obtener las cuentas
            const accountIncome = await models.Accounts.findByPk(income.cuentaId, { transaction: t });
            if (!accountIncome) {
                throw boom.notFound('Cuenta origen no encontrada');
            }
    
            // 3️⃣ Revertir el impacto anterior
            await accountIncome.update(
                { saldo: accountIncome.saldo + income.valor }, // 🔥 Se regresa el valor original a la cuenta de origen
                { transaction: t }
            );
    
            if (income.destinoId) {
                const accountDestino = await models.Accounts.findByPk(income.destinoId, { transaction: t });
                if (accountDestino) {
                    await accountDestino.update(
                        { saldo: accountDestino.saldo - income.valor }, // 🔥 Se revierte la suma en la cuenta destino
                        { transaction: t }
                    );
                }
            }
    
            // 4️⃣ Aplicar los cambios
            const newValor = changes.valor ?? income.valor;
            const newDestinoId = changes.destinoId ?? income.destinoId;
    
            await income.update(changes, { transaction: t });
    
            // 5️⃣ Aplicar el nuevo impacto
            await accountIncome.update(
                { saldo: accountIncome.saldo - newValor }, // ✅ Se resta el nuevo valor en la cuenta de origen
                { transaction: t }
            );
    
            if (newDestinoId) {
                const accountDestino = await models.Accounts.findByPk(newDestinoId, { transaction: t });
                if (!accountDestino) {
                    throw boom.notFound('Cuenta destino no encontrada');
                }
    
                await accountDestino.update(
                    { saldo: accountDestino.saldo + newValor }, // ✅ Se suma el nuevo valor en la cuenta destino
                    { transaction: t }
                );
            }
    
            return income;
        });
    }

    async deleteIncome(userId, id) {
        return await sequelize.transaction(async (t) => {
            // 1️⃣ Buscar el ingreso
            const income = await models.Incomes.findOne({
                where: { id },
                transaction: t
            });
            if (!income) {
                throw boom.notFound('No se encontró el ingreso');
            }
    
            // 2️⃣ Obtener la cuenta de origen
            const accountIncome = await models.Accounts.findByPk(income.cuentaId, { transaction: t });
            if (!accountIncome) {
                throw boom.notFound('Cuenta origen no encontrada');
            }
    
            // 3️⃣ Revertir impacto antes de eliminar
            await accountIncome.update(
                { saldo: accountIncome.saldo + income.valor }, // 🔥 Se regresa el valor a la cuenta origen
                { transaction: t }
            );
    
            if (income.destinoId) {
                const accountDestino = await models.Accounts.findByPk(income.destinoId, { transaction: t });
                if (accountDestino) {
                    await accountDestino.update(
                        { saldo: accountDestino.saldo - income.valor }, // 🔥 Se revierte la suma en la cuenta destino
                        { transaction: t }
                    );
                }
            }
    
            // 4️⃣ Eliminar el ingreso
            await income.destroy({ transaction: t });
    
            return { message: 'El ingreso se eliminó correctamente' };
        });
    }
}

module.exports = IncomesService;
