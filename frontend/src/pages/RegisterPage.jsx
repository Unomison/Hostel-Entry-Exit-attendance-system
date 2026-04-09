import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    phone: '',
    hostelBlock: '',
    roomNo: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);       // base64 string sent to backend
      setPhotoPreview(reader.result); // shown as preview
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!photo) {
      toast.error('Please upload your passport photo');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rollNo: formData.rollNo,
        phone: formData.phone,
        hostelBlock: formData.hostelBlock,
        roomNo: formData.roomNo,
        photo: photo,
      });

      toast.success('Registration successful! Please login.');
      navigate('/login');

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👨‍🎓</div>
          <h1 className="text-2xl font-bold text-white">Student Registration</h1>
          <p className="text-slate-400 text-sm mt-1">Create your hostel attendance account</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-full bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <div className="text-3xl">📷</div>
                    <p className="text-slate-400 text-xs mt-1">Upload Photo</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-slate-500 text-xs mt-2">
                {photoPreview ? '✅ Photo selected' : 'Click to upload passport photo *'}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Institute Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@college.ac.in"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Roll No */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Roll Number *</label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="e.g. 2021CSE001"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                maxLength={10}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Hostel Block + Room */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Hostel Block *</label>
                <input
                  type="text"
                  name="hostelBlock"
                  value={formData.hostelBlock}
                  onChange={handleChange}
                  placeholder="e.g. A, B, C"
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Room Number *</label>
                <input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? '⏳ Registering... (uploading photo)' : 'Register'}
            </button>

            <p className="text-center text-slate-500 text-sm">
              Already registered?{' '}
              <Link to="/login" className="text-blue-400 hover:underline">Login here</Link>
            </p>

          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;