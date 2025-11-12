import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-black mb-2">Contact Us</h1>
          <p className="text-gray-600">We'd love to hear from you. Get in touch with us!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <FiMail className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-600">contact@torunhut.com</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <FiPhone className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-600">+880 1533 696 047</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-black text-white p-3 rounded-full">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Address</h3>
                  <p className="text-gray-600">CUET Campus, Chittagong, Bangladesh</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-black mb-6">Send us a message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                  type="email"
                  name="email"
                  placeholder="youremail@mail.com"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Your message..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn bg-black text-white hover:bg-gray-800 border-none w-full"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

