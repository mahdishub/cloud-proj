const transactionService = require("../services/transactionService");

module.exports = {
  getTransactions: async (req, res) => {
    const transactions = await transactionService.getTransactions();
    return res.status(200).json(transactions);
  },

  createTransaction: async(req, res) => {
    const { details, amount, account, type, date } = req.body;

    if (!details || !amount || !account || !type || !date) {
      return res.status(400).json({ message: "Invalid input data." });
    }

    const createdTransaction = await transactionService.createTransaction({
      details,
      amount,
      account,
      type,
      date,
    });

    return res.status(201).json(createdTransaction);
  },

  getTransaction: async(req, res) => {
    const id = parseInt(req.params.id);
    const transaction = await transactionService.getTransaction(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    return res.status(200).json(transaction);
  },

  deleteTransaction: async(req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await transactionService.deleteTransaction(id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    return res.status(204).send();
  },
};
