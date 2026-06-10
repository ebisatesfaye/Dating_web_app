"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentHistory = exports.verifyPayment = exports.initiatePayment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const initiatePayment = async (req, res) => {
    try {
        const { amount, paymentMethod, phoneNumber } = req.body;
        if (!amount || !paymentMethod || !phoneNumber) {
            return res.status(400).json({ error: 'Amount, payment method, and phone number are required' });
        }
        const feeSetting = await prisma.settings.findUnique({ where: { key: 'membership_fee_etb' } });
        const expectedAmount = feeSetting ? Number(feeSetting.value) : 200;
        if (Number(amount) !== expectedAmount) {
            return res.status(400).json({ error: `Premium subscription amount must be ${expectedAmount} ETB` });
        }
        const transactionId = `TX-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        const payment = await prisma.payment.create({
            data: {
                userId: req.user.id,
                amount: Number(amount),
                paymentMethod: paymentMethod.toUpperCase(),
                transactionId,
                status: client_1.PaymentStatusValue.PENDING,
            },
        });
        res.json({
            message: 'Payment initiated successfully. Enter PIN in the simulated USSD prompt.',
            transactionId,
            paymentId: payment.id,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.initiatePayment = initiatePayment;
const verifyPayment = async (req, res) => {
    try {
        const { transactionId, status } = req.body; // status is 'SUCCESS' or 'FAILED'
        if (!transactionId)
            return res.status(400).json({ error: 'Transaction ID is required' });
        const payment = await prisma.payment.findUnique({
            where: { transactionId },
        });
        if (!payment)
            return res.status(404).json({ error: 'Payment record not found' });
        if (payment.status !== client_1.PaymentStatusValue.PENDING) {
            return res.status(400).json({ error: 'Payment has already been processed' });
        }
        const finalStatus = status === 'SUCCESS' ? client_1.PaymentStatusValue.COMPLETED : client_1.PaymentStatusValue.FAILED;
        const updatedPayment = await prisma.payment.update({
            where: { transactionId },
            data: {
                status: finalStatus,
                verifiedAt: finalStatus === client_1.PaymentStatusValue.COMPLETED ? new Date() : null,
            },
        });
        if (finalStatus === client_1.PaymentStatusValue.COMPLETED) {
            await prisma.user.update({
                where: { id: payment.userId },
                data: { paymentStatus: client_1.PaymentStatus.PAID },
            });
        }
        res.json({
            message: `Payment status updated to ${finalStatus}`,
            payment: updatedPayment,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.verifyPayment = verifyPayment;
const getPaymentHistory = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(payments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPaymentHistory = getPaymentHistory;
