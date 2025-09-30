import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout";
import { useAuth } from "../hooks/useAuth";
import { getWalletTransactions } from "../services/authService";
import { getUserRequests } from "../services/requestService";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: requests } = useQuery({
    queryKey: ['user-requests'],
    queryFn: () => getUserRequests(),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['wallet-transactions', 1],
    queryFn: () => getWalletTransactions(1, 5),
  });

  if (!user) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-white">Please log in to view your dashboard</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const recentTransactions = transactionsData?.transactions?.slice(0, 5) || [];
  const recentRequests = requests?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-black">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user.name}!</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{user.wallet.coins.toLocaleString()}</div>
                <div className="text-gray-500 text-sm">Total Coins</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-3  border border-black border-opacity-20">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                  <span className="text-2xl">🚗</span>
                </div>
                <div className="ml-4">
                  <p className="text-black text-sm">Parking Visits</p>
                  <p className="text-gray-500 text-2xl font-bold">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-3  border border-black border-opacity-20">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-black text-sm">Active Requests</p>
                  <p className="text-gray-500 text-2xl font-bold">
                    {recentRequests.filter((r: any) => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-3  border border-black border-opacity-20">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-black text-sm">Approved Requests</p>
                  <p className="text-gray-500 text-2xl font-bold">
                    {recentRequests.filter((r: any) => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-3  border border-black border-opacity-20">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-black text-sm">Coins Earned</p>
                  <p className="text-gray-500 text-2xl font-bold">
                    {recentTransactions
                      .filter((t: any) => t.type === 'credit')
                      .reduce((sum: number, t: any) => sum + t.amount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
              <h2 className="text-xl font-semibold text-black mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/parkings"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">🚗</div>
                  <div className="font-medium">Find Parking</div>
                </Link>
                <Link
                  to="/requests"
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">📝</div>
                  <div className="font-medium">Make Request</div>
                </Link>
                <Link
                  to="/wallet"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-medium">View Wallet</div>
                </Link>
                <Link
                  to="/parkings"
                  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">📍</div>
                  <div className="font-medium">Nearby</div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
              <h2 className="text-xl font-semibold text-black mb-4">Recent Wallet Activity</h2>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-white bg-opacity-5 rounded-lg"
                    >
                      <div>
                        <p className="text-black font-medium">{transaction.description}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} coins
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent transactions</p>
              )}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Recent Requests</h2>
              <Link
                to="/requests"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All →
              </Link>
            </div>
            
            {recentRequests.length > 0 ? (
              <div className="space-y-3">
                {recentRequests.map((request: any) => (
                  <div key={request._id} className="flex justify-between items-center p-3 bg-white bg-opacity-5 rounded-lg">
                    <div>
                      <p className="text-black font-medium">{request.title}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white  ${
                      request.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 ' :
                      request.status === 'approved' ? 'bg-green-500 bg-opacity-20 ' :
                      'bg-red-500 bg-opacity-20 text-red-300'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300">No recent requests</p>
            )}
          </div>

          {/* User Info */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <h2 className="text-xl font-semibold text-black mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-sm">Name</label>
                <p className="text-black font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Email</label>
                <p className="text-black font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Phone</label>
                <p className="text-black font-medium">{user.phone}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Role</label>
                <p className="text-black font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}