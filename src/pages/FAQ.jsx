import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD) for regular orders and bKash, Nagad, and Rocket for preorder items. All payment methods are secure and verified.',
    },
    {
      question: 'How long does shipping take?',
      answer: 'For CUET Campus deliveries, orders typically arrive within 2-3 business days. For deliveries across Bangladesh, it takes 5-7 business days. Preorder items may take longer as they are custom-made.',
    },
    {
      question: 'What is the return policy?',
      answer: 'We offer returns within 7 days of delivery for unused items in original packaging. Customized or preorder items cannot be returned unless there is a manufacturing defect.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can also check your order status in your profile page.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can request cancellation within 24 hours of placing the order. After that, if the order is already being processed, cancellation may not be possible. Contact us for assistance.',
    },
    {
      question: 'Do you offer customizations?',
      answer: 'Yes! We offer custom name and number printing on jerseys and other items. Select the customization option when adding items to your cart.',
    },
    {
      question: 'What sizes are available?',
      answer: 'We offer sizes from XS to XXL. Check our size guide in the cart page for detailed measurements to find your perfect fit.',
    },
    {
      question: 'Are preorder items refundable?',
      answer: 'Preorder items are custom-made and cannot be refunded unless there is a manufacturing defect. Please ensure all details are correct before placing your order.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-black mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our products and services</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-lg text-black">{faq.question}</span>
                {openIndex === index ? (
                  <FiChevronUp className="text-xl text-gray-600" />
                ) : (
                  <FiChevronDown className="text-xl text-gray-600" />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 text-gray-600"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;

