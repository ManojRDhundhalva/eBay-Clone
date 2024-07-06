const pool = require("../db");
const queries = require("../queries/bankDetails");

const getBankAccount = async (req, resp) => {
  try {
    const results = await pool.query(queries.ifExistAccount, [req.user.id]);

    if (results.rows.length !== 1) {
      return resp.status(201).json({ message: "Account not found" });
    }

    const results1 = await pool.query(queries.getBankAccountByUserId, [
      req.user.id,
    ]);
    const data = results1.rows[0];
    return resp.status(200).json(data);
  } catch (err) {
    console.log("Error in getBankAccount: ", err);
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const updateBankAccount = async (req, resp) => {
  const {
    account_number,
    account_holder_first_name,
    account_holder_last_name,
    account_IFSC_code,
    account_branch,
    account_branch_address,
    seller_latitude,
    seller_longitude,
    seller_location,
    seller_city,
    seller_state,
    seller_country,
    seller_pincode,
  } = req.body;

  try {
    const sellerExistsResult = await pool.query(queries.ifSellerExist, [
      req.user.id,
    ]);

    if (sellerExistsResult.rows.length === 1) {
      await pool.query(queries.updateBankAccountByAccountNumber, [
        account_holder_first_name,
        account_holder_last_name,
        account_IFSC_code,
        account_branch,
        account_branch_address,
        account_number,
      ]);
      await pool.query(queries.updateSellerBySellerUserId, [
        seller_latitude,
        seller_longitude,
        seller_location,
        seller_city,
        seller_state,
        seller_country,
        seller_pincode,
        req.user.id,
      ]);
      return resp.status(200).json({ message: "Account Updated Successfully" });
    } else {
      const accountExistsResult = await pool.query(
        queries.ifExistGivenAccount,
        [account_number]
      );

      if (accountExistsResult.rows.length) {
        return resp.status(201).json({ message: "Account Already Exists" });
      }
      await pool.query(queries.createBankAccountByAccountNumber, [
        account_number,
        account_holder_first_name,
        account_holder_last_name,
        account_IFSC_code,
        account_branch,
        account_branch_address,
      ]);

      await pool.query(queries.createSellerByAccountNumber, [
        req.user.id,
        account_number,
        seller_latitude,
        seller_longitude,
        seller_location,
        seller_city,
        seller_state,
        seller_country,
        seller_pincode,
      ]);

      return resp.status(200).json({ message: "Account Created Successfully" });
    }
  } catch (err) {
    console.log("Error in updateBankAccount: ", err);
    return resp
      .status(500)
      .json({ message: "Error in Account Update, While Inserting Data" });
  }
};

const checkAccountExist = async (req, resp) => {
  try {
    const results = await pool.query(queries.ifExistAccount, [req.user.id]);

    if (results.rows.length !== 1) {
      return resp.status(200).json({ isAccount: false });
    }
    return resp.status(200).json({ isAccount: true });
  } catch (err) {
    console.log("Error in getBankAccount: ", err);
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getBankAccount,
  updateBankAccount,
  checkAccountExist,
};
