import { useEffect, useState } from "react";
import Layout from "../components/common/Layout";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser, updateUserProfile } from "../services/userService";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getCurrentUser();
      const u = data?.user ?? user;
      setForm({ name: u.name ?? "", phone: u.phone ?? "" });
    }
    load();
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await updateUserProfile({ name: form.name, phone: form.phone });
      if (data?.user) updateUser(data.user);
      alert("Profile updated");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
          <h1 className="text-2xl font-bold text-black mb-4">Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-sm mb-2">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 ring-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30" />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-2">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 ring-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30" />
            </div>
            <div className="flex justify-end gap-3">
              <button disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 font-bold text-white rounded-lg">{loading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
