import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Layout from "../components/common/Layout";
import { useAuth } from "../hooks/useAuth";
import { getWalletTransactions } from "../services/authService";

export default function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'credits' | 'debits'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['wallet-transactions', currentPage],
    queryFn: () => getWalletTransactions(currentPage, 20),
  });

  const transactions = transactionsData?.transactions || [];
  const totalPages = transactionsData?.totalPages || 1;

  const filteredTransactions = transactions.filter((transaction: any) => {
    if (activeTab === 'credits') return transaction.type === 'credit';
    if (activeTab === 'debits') return transaction.type === 'debit';
    return true;
  });

  const totalCredits = transactions
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  if (!user) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-white">Please log in to view your wallet</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <h1 className="text-3xl font-bold text-black mb-2">Wallet</h1>
            <p className="text-gray-500">Manage your in-app currency and transactions</p>
          </div>

          {/* Balance Card */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-black mb-2">Coin Balance</h2>
              <div className="text-5xl font-bold text-green-400 mb-4">
                {user.wallet.coins.toLocaleString()} Coins
              </div>
              <div className="flex justify-center space-x-8 text-sm">
                <div>
                  <span className="text-gray-500">Total Earned:</span>
                  <span className="text-green-500 ml-2">+{totalCredits.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Spent:</span>
                  <span className="text-red-500 ml-2">-{totalDebits.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-semibold text-black mb-4 md:mb-0">Transaction History</h2>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500  ring-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
                />
                <div className="flex bg-white bg-opacity-10 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${activeTab === 'all'
                        ? 'bg-white  text-black font-extrabold'
                        : 'text-gray-500 '
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('credits')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${activeTab === 'credits'
                        ? 'bg-white  text-black font-extrabold'
                        : 'text-gray-500 '
                      }`}
                  >
                    Credits
                  </button>
                  <button
                    onClick={() => setActiveTab('debits')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${activeTab === 'debits'
                        ? 'bg-white  text-black font-extrabold'
                        : 'text-gray-500 '
                      }`}
                  >
                    Debits
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white border-opacity-20">
                        <th className="text-left py-3 px-4 text-gray-800 font-medium">Description</th>
                        <th className="text-left py-3 px-4 text-gray-800 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-gray-800 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-gray-800 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction: any, index: number) => (
                        <tr key={index} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-gray-800 font-medium">{transaction.description}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'credit'
                                ? 'bg-green-500 bg-opacity-20 text-green-300'
                                : 'bg-red-500 bg-opacity-20 text-red-300'
                              }`}>
                              {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                              }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} coins
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-700 text-sm">
                            {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-20 transition-colors"
                    >
                      Previous
                    </button>

                    <span className="text-white">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-20 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-xl text-gray-500 mb-2">No transactions found</p>
                <p className="text-gray-400">Start using parking services to earn coins!</p>
              </div>
            )}
          </div>

          {/* How to Earn */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <h2 className="text-xl font-semibold text-black mb-4">How to Earn Coins</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
                <div className="text-3xl mb-2">🚗</div>
                <h3 className="text-gray-500 font-medium mb-2">Check-in at Parking</h3>
                <p className="text-gray-400 text-sm">Earn 10 coins for each verified parking visit</p>
              </div>
              <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="text-gray-500 font-medium mb-2">Submit Requests</h3>
                <p className="text-gray-400 text-sm">Earn 50 coins when your parking request is approved</p>
              </div>
              <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
                <div className="text-3xl mb-2">🎁</div>
                <h3 className="text-gray-500 font-medium mb-2">Daily Bonus</h3>
                <p className="text-gray-400 text-sm">Log in daily to earn bonus coins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}