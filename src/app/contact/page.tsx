'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ContactFormData, ContactFormResponse } from '@/types/contact';

const faqs = [
  {
    question: "What's the typical response time?",
    answer: "I aim to respond to all inquiries within 24-48 hours during business days."
  },
  {
    question: "Do you work internationally?",
    answer: "Yes, I collaborate with clients worldwide and can accommodate different time zones."
  },
  {
    question: "What information should I include?",
    answer: "Please provide project details, timeline, and any specific requirements you have in mind."
  },
  {
    question: "How do we start a project?",
    answer: "After initial contact, we'll schedule a consultation to discuss your needs in detail."
  }
];

interface FloatingLabelInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
  as?: 'input' | 'textarea';
  className?: string;
}

function FloatingLabelInput({
  id,
  name,
  type,
  value,
  onChange,
  label,
  required,
  disabled,
  as = 'input',
  className = '',
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isOccupied = isFocused || value.length > 0;

  const Component = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="relative">
      <Component
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          peer w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 pt-6 pb-2
          text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50
          transition-all duration-300 ${className}
        `}
        placeholder={label}
        rows={as === 'textarea' ? 5 : undefined}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${isOccupied ? 'text-xs top-2 text-blue-400' : 'text-base top-4 text-gray-400'}
          peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-400
        `}
      >
        {label}
      </label>
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    danceStyle: '',
  });
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ContactFormResponse = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: data.message,
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          danceStyle: '',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0.8),rgba(0,0,0,0.8))]" />
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-gold-500/20 via-transparent to-transparent rotate-45 animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-orange-500/20 via-transparent to-transparent -rotate-45 animate-spin-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400 mb-4">
            Let's Create Together
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have a project in mind or want to collaborate? I'd love to hear from you.
            Fill out the form below and let's bring your vision to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Glassmorphic Container */}
            <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl overflow-hidden group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <FloatingLabelInput
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  label="Name"
                  required
                  disabled={loading}
                />

                <FloatingLabelInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  label="Email"
                  required
                  disabled={loading}
                />

                <FloatingLabelInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  label="Phone (optional)"
                  disabled={loading}
                />

                <div className="relative">
                  <select
                    id="danceStyle"
                    name="danceStyle"
                    value={formData.danceStyle}
                    onChange={handleChange}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    disabled={loading}
                    aria-label="Dance Style"
                  >
                    <option value="" className="bg-gray-900">Select a style</option>
                    <option value="ballet" className="bg-gray-900">Ballet</option>
                    <option value="contemporary" className="bg-gray-900">Contemporary</option>
                    <option value="hiphop" className="bg-gray-900">Hip Hop</option>
                    <option value="jazz" className="bg-gray-900">Jazz</option>
                    <option value="other" className="bg-gray-900">Other</option>
                  </select>
                  <label className="absolute left-4 -top-2.5 text-xs text-blue-400 bg-transparent px-1">
                    Dance Style (optional)
                  </label>
                </div>

                <FloatingLabelInput
                  id="message"
                  name="message"
                  type="text"
                  value={formData.message}
                  onChange={handleChange}
                  label="Your Message"
                  required
                  disabled={loading}
                  as="textarea"
                />

                {status.type && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg backdrop-blur-sm ${
                      status.type === 'success' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {status.message}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-lg backdrop-blur-sm bg-white/10 text-white px-8 py-4 border border-white/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">
                    {loading ? 'Sending...' : 'Send Message'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-500/50 to-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}

            {/* Additional Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10 mt-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Other Ways to Connect</h3>
              <div className="space-y-3">
                <p className="text-gray-300">
                  <span className="text-blue-400">Email:</span> contact@hussainmarzooq.com
                </p>
                <p className="text-gray-300">
                  <span className="text-blue-400">Location:</span> Dubai, UAE
                </p>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">LinkedIn</a>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Instagram</a>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">GitHub</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 