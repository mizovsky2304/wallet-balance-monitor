require("dotenv").config();
const ethers = require("ethers");
const nodemailer = require("nodemailer");
const chalk = require('chalk'); 

// Setting ENV Variables
const wallets = process.env.WALLETS.split(",");
const emailRecipient = process.env.EMAIL;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const networks = {
    "op-sepolia": "https://sepolia.optimism.io",
    "base-sepolia": "https://sepolia.base.org",
    "arbitrum-sepolia": "https://sepolia-rollup.arbitrum.io/rpc",
    "blast": "https://sepolia.blast.io",
    "unichain-sepolia": "https://unichain-sepolia.drpc.org",
};

//Transporter :
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

async function checkBalances() {
    for (const wallet of wallets) {
        console.log("--------------------------------------------------"); // Horizontal line separator
        for (const [networkName, rpc] of Object.entries(networks)) {
            const provider = new ethers.JsonRpcProvider(rpc);
            try {
                const balance = await provider.getBalance(wallet);
                const balanceInEth = ethers.formatEther(balance);
                const balanceRounded = parseFloat(balanceInEth).toFixed(4); // Limit to 4 decimal places

                let logMessage = `Wallet: ${wallet} - ${networkName}: ${balanceRounded} ETH`;

                if (parseFloat(balanceRounded) < 5) {
                    logMessage = chalk.red(logMessage); // Color the line red if balance is low
                    sendEmailAlert(wallet, networkName, balanceRounded);
                }

                console.log(logMessage);

            } catch (error) {
                console.error(`Error checking balance on ${networkName}:`, error);
            }
        }
    }
}

function sendEmailAlert(wallet, network, balance) {
    const mailOptions = {
        from: emailUser,
        to: emailRecipient,
        subject: `⚠️ Low Balance Alert for ${wallet}`,
        text: `The balance of wallet ${wallet} on ${network} has dropped below 5 ETH. Current balance: ${balance} ETH.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}

// Check Balances Every 30 minutes
setInterval(checkBalances, 30 * 60 * 1000);

// Run the script for the first time
checkBalances();
