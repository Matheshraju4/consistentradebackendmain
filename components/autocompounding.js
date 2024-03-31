async function autoCompoundingCalculatorfordays(
  principalAmount,

  TotalNumberOfDays,
  perDayInterest
) {
  let acutualPrincipalAmount = principalAmount;
  let FinalAnount = 0;
  let tabledata = [];
  let perdaytarget = [];

  for (let i = 1; i <= TotalNumberOfDays; i++) {
    let perviousamount = principalAmount;
    FinalAnount = principalAmount * (1 + perDayInterest);

    // console.log(`Return At Day ${i} = ${FinalAnount}`);
    tabledata[i - 1] = FinalAnount;
    principalAmount = FinalAnount;
    perdaytarget[i - 1] = calculateDifference(principalAmount, perviousamount);
  }

  function calculateDifference(currentamount, perviousamount) {
    return (currentamount - perviousamount).toFixed(2);
  }
  const response = {
    initialInvestment: acutualPrincipalAmount,
    NumberofDays: TotalNumberOfDays,
    interestRate: perDayInterest,
    FinalAmount: FinalAnount,
  };

  return [response, tabledata, perdaytarget];
}

module.exports = autoCompoundingCalculatorfordays;
