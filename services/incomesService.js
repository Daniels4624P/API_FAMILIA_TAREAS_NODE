const boom = require('@hapi/boom');
const { models, sequelize } = require('../libs/sequelize');

class IncomesService {
    async createIncome(income) {
        return await sequelize.transaction(async (t) => {
            const newIncome = await models.Incomes.create(income, { transaction: t });

            const accountIncome = await models.Accounts.findByPk(newIncome.cuentaId, { transaction: t });
            if (!accountIncome) {
                throw boom.notFound('Cuenta origen no encontrada');
            }

            await accountIncome.update(
                { saldo: accountIncome.saldo + newIncome.valor },
                { transaction: t }
            );
            console.log(`✅ Se sumó ${newIncome.valor} a la cuenta origen`);

            if (newIncome.destinoId) {
                const accountDestino = await models.Accounts.findByPk(newIncome.destinoId, { transaction: t });
                if (!accountDestino) {
                    throw boom.notFound('Cuenta destino no encontrada');
                }

                await accountDestino.update(
                    { saldo: accountDestino.saldo + newIncome.valor },
                    { transaction: t }
                );
                console.log(`✅ Se sumó ${newIncome.valor} a la cuenta destino`);
            }

            return newIncome;
        });
    }

    async getIncomes(userId) {
        return await models.Incomes.findAll({
            where: { userId },
            include: ['accountInicio', 'category', 'accountDestino']
        });
    }

    async getIncome(userId, id) {
        const income = await models.Incomes.findOne({
            where: { userId, id },
            include: ['accountInicio', 'category', 'accountDestino']
        });
        if (!income) throw boom.notFound('No se encontró el ingreso');
        return income;
    }

    async updateIncome(userId, id, changes) {
        return await sequelize.transaction(async (t) => {
            const income = await models.Incomes.findOne({ where: { id }, transaction: t });
            if (!income) throw boom.notFound('No se encontró el ingreso');

            const accountIncome = await models.Accounts.findByPk(income.cuentaId, { transaction: t });
            if (!accountIncome) throw boom.notFound('Cuenta origen no encontrada');

            const accountDestino = income.destinoId
                ? await models.Accounts.findByPk(income.destinoId, { transaction: t })
                : null;

            // Calculamos la diferencia de valor
            const valorOriginal = income.valor;
            const valorNuevo = changes.valor ?? income.valor;
            const diferencia = valorNuevo - valorOriginal;

            // Ajustamos saldo en la cuenta de origen
            await accountIncome.update(
                { saldo: accountIncome.saldo + diferencia },
                { transaction: t }
            );

            // Ajustamos saldo en la cuenta destino si existe
            if (accountDestino) {
                await accountDestino.update(
                    { saldo: accountDestino.saldo + diferencia },
                    { transaction: t }
                );
            }

            await income.update(changes, { transaction: t });

            console.log(`✅ Se actualizó el ingreso ${id}, diferencia: ${diferencia}`);
            return income;
        });
    }

    async deleteIncome(userId, id) {
        return await sequelize.transaction(async (t) => {
            const income = await models.Incomes.findOne({ where: { id }, transaction: t });
            if (!income) throw boom.notFound('No se encontró el ingreso');

            const accountIncome = await models.Accounts.findByPk(income.cuentaId, { transaction: t });
            if (!accountIncome) throw boom.notFound('Cuenta origen no encontrada');

            const accountDestino = income.destinoId
                ? await models.Accounts.findByPk(income.destinoId, { transaction: t })
                : null;

            // Restar saldo en cuenta origen
            await accountIncome.update(
                { saldo: accountIncome.saldo - income.valor },
                { transaction: t }
            );

            // Restar saldo en cuenta destino si existe
            if (accountDestino) {
                await accountDestino.update(
                    { saldo: accountDestino.saldo - income.valor },
                    { transaction: t }
                );
            }

            await income.destroy({ transaction: t });

            console.log(`✅ Se eliminó el ingreso ${id}`);
            return { message: 'El ingreso se eliminó correctamente' };
        });
    }
}

module.exports = IncomesService;
