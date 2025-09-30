import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-gray-200 text-lg mb-8">
              The page you're looking for doesn't exist.
            </p>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
