import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const bangladeshDistricts = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga','Cox’s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokathi','Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore','Nawabganj','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon'
];

const Shipping = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { shippingType, setShippingType, shippingDetails, setShippingDetails } = useCart();

  const [activeTab, setActiveTab] = useState(shippingType === 'bd' ? 'bd' : 'cuet');
  const [cuet, setCuet] = useState({ name: '', phone: '', studentId: '', department: '', email: '', hallName: '', roomNumber: '' });
  const [bd, setBd] = useState({ name: '', phone: '', email: '', district: '', address: '' });

  useEffect(() => {
    if (!currentUser) {
      toast.info('Please login to continue');
      navigate('/login');
      return;
    }
    if (shippingDetails) {
      if (shippingType === 'cuet') setCuet({ ...cuet, ...shippingDetails });
      if (shippingType === 'bd') setBd({ ...bd, ...shippingDetails });
    } else if (currentUser) {
      setCuet((s) => ({ ...s, name: currentUser.displayName || s.name, email: currentUser.email || s.email }));
      setBd((s) => ({ ...s, name: currentUser.displayName || s.name, email: currentUser.email || s.email }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateCuet = () => {
    const required = ['name','phone','studentId','department','email','hallName'];
    for (const key of required) {
      if (!cuet[key] || String(cuet[key]).trim() === '') return false;
    }
    return true;
  };

  const validateBd = () => {
    const required = ['name','phone','email','district','address'];
    for (const key of required) {
      if (!bd[key] || String(bd[key]).trim() === '') return false;
    }
    return true;
  };

  const onContinue = () => {
    if (activeTab === 'cuet') {
      if (!validateCuet()) {
        toast.error('Please fill all required fields for CUET');
        return;
      }
      setShippingType('cuet');
      setShippingDetails(cuet);
    } else {
      if (!validateBd()) {
        toast.error('Please fill all required fields for All Over Bangladesh');
        return;
      }
      setShippingType('bd');
      setShippingDetails(bd);
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Shipping Details</h1>
          <p className="text-gray-600">Choose your shipping location and fill in details</p>
        </motion.div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="tabs tabs-boxed bg-gray-100 p-1 mb-6">
            <button className={`tab ${activeTab === 'cuet' ? 'tab-active bg-black text-white' : ''}`} onClick={() => setActiveTab('cuet')}>CUET Campus</button>
            <button className={`tab ${activeTab === 'bd' ? 'tab-active bg-black text-white' : ''}`} onClick={() => setActiveTab('bd')}>All Over Bangladesh</button>
          </div>

          {activeTab === 'cuet' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name *</label>
                  <input className="input input-bordered w-full" value={cuet.name} onChange={(e) => setCuet({ ...cuet, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone *</label>
                  <input className="input input-bordered w-full" value={cuet.phone} onChange={(e) => setCuet({ ...cuet, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Student ID *</label>
                  <input className="input input-bordered w-full" value={cuet.studentId} onChange={(e) => setCuet({ ...cuet, studentId: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Department *</label>
                  <input className="input input-bordered w-full" value={cuet.department} onChange={(e) => setCuet({ ...cuet, department: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Email *</label>
                  <input className="input input-bordered w-full" value={cuet.email} onChange={(e) => setCuet({ ...cuet, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Hall Name *</label>
                  <input className="input input-bordered w-full" value={cuet.hallName} onChange={(e) => setCuet({ ...cuet, hallName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Room Number (optional)</label>
                <input className="input input-bordered w-full" value={cuet.roomNumber} onChange={(e) => setCuet({ ...cuet, roomNumber: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name *</label>
                  <input className="input input-bordered w-full" value={bd.name} onChange={(e) => setBd({ ...bd, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone *</label>
                  <input className="input input-bordered w-full" value={bd.phone} onChange={(e) => setBd({ ...bd, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Email *</label>
                  <input className="input input-bordered w-full" value={bd.email} onChange={(e) => setBd({ ...bd, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">District *</label>
                  <select className="select select-bordered w-full" value={bd.district} onChange={(e) => setBd({ ...bd, district: e.target.value })}>
                    <option value="">Select district</option>
                    {bangladeshDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Full Address *</label>
                <input className="input input-bordered w-full" value={bd.address} onChange={(e) => setBd({ ...bd, address: e.target.value })} />
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button onClick={() => navigate('/cart')} className="btn btn-outline border-black text-black">Back to Cart</button>
            <button onClick={onContinue} className="btn bg-black text-white hover:bg-gray-800 border-none">Continue to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;


