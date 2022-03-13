const vendingMachine = (vendingMachineInit) => {
  const inputCash = 0;

  const COKE_PRICE = 1100;
  const WATER_PRICE = 600;
  const COFFEE_PRICE = 700;

  let cokeStock = vendingMachineInit.cokeStock;
  let waterStock = vendingMachineInit.waterStock;
  let coffeeStock = vendingMachineInit.coffeeStock;

  const stockState = {
    coke: cokeStock > 0 ? true : false,
    water: waterStock > 0 ? true : false,
    coffee: coffeeStock > 0 ? true : false,
  };

  let coinAmount_100 = vendingMachineInit.coinAmount_100;
  let coinAmount_500 = vendingMachineInit.coinAmount_500;

  const usableCash = [100, 500, 1000, 5000, 10000];

  let paymentProcess = "none";

  function checkStock() {
    const remainCharge = 100 * coinAmount_100 + 500 * coinAmount_500;
    if (usableCash[usableCash.length - 1] > remainCharge) {
      stockState.coke = stockState.water = stockState.coffee = false;
    } else {
      stockState.coke = cokeStock > 0 ? true : false;
      stockState.water = waterStock > 0 ? true : false;
      stockState.coffee = coffeeStock > 0 ? true : false;
    }
  }

  function showVendingMachineState() {
    let result = "";
    result +=
      `[콜라 ${
        !stockState.coke
          ? "X"
          : paymentProcess === "none"
          ? " "
          : paymentProcess === "card"
          ? "O"
          : paymentProcess === "cash" && inputCash >= COKE_PRICE
          ? "O"
          : "X"
      }] [물 ${
        !stockState.water
          ? "X"
          : paymentProcess === "none"
          ? " "
          : paymentProcess === "card"
          ? "O"
          : paymentProcess === "cash" && inputCash >= WATER_PRICE
          ? "O"
          : "X"
      }] [커피 ${
        !stockState.coffee
          ? "X"
          : paymentProcess === "none"
          ? " "
          : paymentProcess === "card"
          ? "O"
          : paymentProcess === "cash" && inputCash >= COFFEE_PRICE
          ? "O"
          : "X"
      }]` + " ";

    result += `[잔액: ${inputCash}]` + "\n";

    console.log(result);
  }

  function returnRemainCharge() {
    const fs = require("fs");
    const returnRemainChargeButton = fs
      .readFileSync("returnRemainChargeButton.txt")
      .toString()
      .trim()
      .split("\n");
    if (returnRemainChargeButton[0] === "") return;

    let count100 = 0;
    let count500 = 0;
    if (inputCash > 0 && paymentProcess === "cash") {
      for (; inputCash >= usableCash[0]; ) {
        if (inputCash / usableCash[1] > 1) {
          inputCash = inputCash - usableCash[1];
          count500++;
        } else {
          inputCash = inputCash - usableCash[0];
          count100++;
        }
      }

      coinAmount_100 -= count100;
      coinAmount_500 -= count500;
      console.log(`500원 ${count500}개 및 100원 ${count100}개 반환`);
      paymentProcess = "none";
    }
  }

  function cashInput() {
    const fs = require("fs");
    const cash = fs.readFileSync("cash.txt").toString().trim().split("\n");
    if (cash[0] === "") return;

    if (!stockState.coke && !stockState.water && !stockState.coffee) {
      console.log(`${cash[0]}원 반환`);
      return;
    }

    if (paymentProcess === "card") {
      console.log(`${cash[0]}원 반환`);
      return;
    }

    if (!usableCash.includes(Number(cash[0]))) {
      console.log(`${cash[0]}원 반환`);
      return;
    }

    if (Number(cash[0]) === usableCash[0]) {
      coinAmount_100++;
    } else if (Number(cash[0]) === usableCash[1]) {
      coinAmount_500++;
    }

    paymentProcess = "cash";

    inputCash += Number(cash[0]);
  }

  function cardInput() {
    const fs = require("fs");
    const card = fs.readFileSync("card.txt").toString().trim().split("\n");
    if (card[0] === "") return;

    if (!stockState.coke && !stockState.water && !stockState.coffee) return;

    if (paymentProcess !== "none") return;

    if (card[0] === "error") {
      console.log("카드 결제 에러");
      paymentProcess = "none";
    } else if (card[0] === "success") {
      console.log("카드 결제 승인");
    }

    paymentProcess = "card";
  }

  function userSelectDrink() {
    const fs = require("fs");
    const select = fs.readFileSync("select.txt").toString().trim().split("\n");
    if (select[0] === "") return;
    if (paymentProcess === "none") return;

    switch (paymentProcess) {
      case "card": {
        if (select[0] === "coke" && cokeStock > 0) {
          cokeStock--;
          console.log("콜라 출고");
        } else if (select[0] === "water" && waterStock > 0) {
          waterStock--;
          console.log("물 출고");
        } else if (select[0] === "coffee" && coffeeStock > 0) {
          coffeeStock--;
          console.log("커피 출고");
        }
        paymentProcess = "none";
        break;
      }
      case "cash": {
        if (select[0] === "coke" && cokeStock > 0 && inputCash >= COKE_PRICE) {
          inputCash -= COKE_PRICE;
          cokeStock--;
          console.log("콜라 출고");
        } else if (
          select[0] === "water" &&
          waterStock > 0 &&
          inputCash >= WATER_PRICE
        ) {
          inputCash -= WATER_PRICE;
          waterStock--;
          console.log("물 출고");
        } else if (
          select[0] === "coffee" &&
          coffeeStock > 0 &&
          inputCash >= COFFEE_PRICE
        ) {
          inputCash -= COFFEE_PRICE;
          coffeeStock--;
          console.log("커피 출고");
        }

        if (inputCash <= 0) {
          paymentProcess = "none";
        }
        break;
      }
    }
  }

  const SHOW_VENDING_MACHINE_STATE_INTERVAL = 1000;
  const RETURN_REMAIN_CHARGE_INTERVAL = 1000;
  const CASH_INPUT_INTERVAL = 1000;
  const CARD_INPUT_INTERVAL = 1000;
  const USER_SELECT_INTERVAL = 1000;

  setInterval(() => {
    checkStock();
    showVendingMachineState();
  }, SHOW_VENDING_MACHINE_STATE_INTERVAL);

  setInterval(() => returnRemainCharge(), RETURN_REMAIN_CHARGE_INTERVAL);
  setInterval(() => cashInput(), CASH_INPUT_INTERVAL);
  setInterval(() => cardInput(), CARD_INPUT_INTERVAL);
  setInterval(() => userSelectDrink(), USER_SELECT_INTERVAL);
};

const vendingMachineInit = {
  cokeStock: 10,
  waterStock: 20,
  coffeeStock: 30,
  coinAmount_100: 40,
  coinAmount_500: 50,
};

vendingMachine(vendingMachineInit);
