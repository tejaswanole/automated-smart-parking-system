import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        if (form.password !== form.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        });
        toast.success("Account created successfully!");
      }
      navigate("/dashboard");
    } catch (error: any) {
      console.log("error");
      toast.error(error.response?.data?.message || "An error occurred");
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white border-opacity-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-500">
              {isLogin ? "Sign in to your ParkSmart account" : "Join ParkSmart community"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full ring-1 ring-gray-300 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
                  placeholder="Full Name"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full ring-1 ring-gray-300 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
                placeholder="Email Address"
                disabled={loading}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="w-full ring-1 ring-gray-300 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
                  placeholder="Phone Number"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="w-full ring-1 ring-gray-300 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
                placeholder="Password"
                disabled={loading}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full  ring-1 ring-gray-300 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
                  placeholder="Confirm Password"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  confirmPassword: ""
                });
              }}
              className="text-green-500 hover:text-green-400 transition-colors"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <div className="text-center text-gray-200 text-sm">
              <p className="text-gray-500">By continuing, you agree to our</p>
              <div className="mt-2 space-x-2">
                <a href="#" className="text-green-500 hover:text-green-400">Terms of Service</a>
                <span className="text-gray-500">and</span>
                <a href="#" className="text-green-500 hover:text-green-400">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}