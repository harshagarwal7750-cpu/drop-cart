"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const totalPrice = cart.reduce(
    (total: number, item: any) => total + item.price,
    0
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = () => {
    if (!name || !address || !pincode) {
      alert("Please fill all details");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: totalPrice * 100,
      currency: "INR",
      name: "DropCart",
      description: "Order Payment",
      handler: function (response: any) {
        alert("Payment Successful! ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: name,
      },
      theme: {
        color: "#7c3aed",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white">

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Address Form */}
      <div className="mb-10 space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 bg-black border border-gray-700 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Address"
          className="w-full p-3 bg-black border border-gray-700 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          type="text"
          placeholder="Pincode"
          className="w-full p-3 bg-black border border-gray-700 rounded"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />

      </div>

      {/* Cart Items */}
      <div className="mb-10">

        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        {cart.map((item: any) => {

          const images = JSON.parse(item.images || "[]");
          const image = images[0];

          return (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-700 py-4"
            >

              <div className="flex items-center gap-4">

                {image && (
                  <img
                    src={image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}

                <div>
                  <p>{item.name}</p>
                  <p className="text-sm opacity-70">₹{item.price}</p>
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Total */}

      <div className="flex justify-between items-center text-xl font-bold mb-8">
        <span>Total</span>
        <span>₹{totalPrice}</span>
      </div>

      {/* Payment Button */}

      <button
        onClick={handlePayment}
        className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-lg text-lg"
      >
        Pay Now
      </button>

    </div>
  );
}