// Import required modules
const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

// Database connection setup
const sequelize = new Sequelize("postgres://postgres:postgres@my-postgresql-instance.cxdomsh2itks.us-east-1.rds.amazonaws.com:5432/cloudproj", {
  dialect: "postgres",
  logging: false,
});

// Define the Transaction model
const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  details: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "transaction", // Table name in PostgreSQL
  timestamps: false, // No createdAt or updatedAt fields
});

// Initialize the database connection
const initializeDatabase = async () => {
  await sequelize.authenticate();
  console.log("Database authenticated successfully!");
};

// Lambda handler
exports.handler = async (event, context) => {
  try {
    // Initialize database
    await initializeDatabase();

    const path = event.path; // Request path
    const httpMethod = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : null;

    // API logic
    if (path === "/transaction" && httpMethod === "GET") {
      const transactions = await Transaction.findAll();
      return buildResponse(200, transactions.map((t) => t.toJSON()));
    }

    if (path === "/transaction" && httpMethod === "POST") {
      const { details, amount, account, type, date } = body;
      const newTransaction = await Transaction.create({ details, amount, account, type, date });
      return buildResponse(201, newTransaction.toJSON());
    }

    if (path.startsWith("/transaction/") && httpMethod === "GET") {
      const id = path.split("/").pop();
      const transaction = await Transaction.findByPk(id);
      return transaction
        ? buildResponse(200, transaction.toJSON())
        : buildResponse(404, { message: "Transaction not found" });
    }

    if (path.startsWith("/transaction/") && httpMethod === "DELETE") {
      const id = path.split("/").pop();
      const result = await Transaction.destroy({ where: { id } });
      return result
        ? buildResponse(204, null)
        : buildResponse(404, { message: "Transaction not found" });
    }

    return buildResponse(400, { message: "Invalid request" });
  } catch (error) {
    console.error("Error:", error);
    return buildResponse(500, { message: "Internal Server Error" });
  }
};

// Helper function to build a Lambda response
const buildResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};