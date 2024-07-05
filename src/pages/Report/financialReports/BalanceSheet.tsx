import React, { useEffect, useState } from 'react';
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const BalanceSheet = () => {
  const id = localStorage.getItem('driverId');
  const [balanceSheet, setBalanceSheet] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchBalanceSheetData = async () => {
      try {
        // Fetching assets data
        const cashOnHand = 5000; // Example value, replace with actual query
        const receivables = 2000; // Example value, replace with actual query
        const vehicleValue = 20000; // Example value, replace with actual query
        const otherAssets = 1000; // Example value, replace with actual query

        const totalAssets = cashOnHand + receivables + vehicleValue + otherAssets;

        // Fetching liabilities data
        const loanForVehicle = 10000; // Example value, replace with actual query
        const payables = 3000; // Example value, replace with actual query
        const otherLiabilities = 2000; // Example value, replace with actual query

        const totalLiabilities = loanForVehicle + payables + otherLiabilities;

        // Calculating equity
        const equity = totalAssets - totalLiabilities;

        setBalanceSheet({
          cashOnHand,
          receivables,
          vehicleValue,
          otherAssets,
          totalAssets,
          loanForVehicle,
          payables,
          otherLiabilities,
          totalLiabilities,
          equity,
        });
      } catch (error) {
        console.error('Error fetching balance sheet data:', error);
      }
    };

    fetchBalanceSheetData();
  }, [db, id]);

  if (!balanceSheet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Balance Sheet for Driver {id}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Details</th>
              <th className="py-2 px-4 border-b text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100">
              <td className="py-2 px-4 border-b font-semibold" colSpan="3">Assets</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Cash on Hand</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.cashOnHand}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Receivables</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.receivables}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Vehicle Value</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.vehicleValue}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Other Assets</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.otherAssets}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="py-2 px-4 border-b font-semibold">Total Assets</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right font-bold">${balanceSheet.totalAssets}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="py-2 px-4 border-b font-semibold" colSpan="3">Liabilities</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Loan for Vehicle</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.loanForVehicle}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Payables</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.payables}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Other Liabilities</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right">${balanceSheet.otherLiabilities}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="py-2 px-4 border-b font-semibold">Total Liabilities</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right font-bold">${balanceSheet.totalLiabilities}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="py-2 px-4 border-b font-semibold" colSpan="3">Equity</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Driver's Equity</td>
              <td className="py-2 px-4 border-b"></td>
              <td className="py-2 px-4 border-b text-right font-bold">${balanceSheet.equity}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalanceSheet;
