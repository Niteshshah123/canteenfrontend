import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { orderAPI } from '../services/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId._id,
          productName: item.productId.name,
          price: item.productId.discountPrice || item.productId.price,
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
        address: {
          street: '337/1A, Vengal Village',
          city: 'Chennai',
          state: 'TamilNadu',
          postalCode: '601103',
          country: 'India',
        },
      };

      const response = await orderAPI.placeOrder(orderData);
      
      if (response.data.order) {
        // Simulate payment confirmation
        await orderAPI.confirmPayment({
          orderId: response.data.order._id,
          paymentId: 'PAY_' + Date.now(),
          status: 'paid',
        });

        await clearCart();
        alert('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.filter(item => item.productId !== null).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some delicious items to get started!
          </p>
          <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="space-y-4 mb-8">
          {cartItems.filter(item => item.productId !== null).map((item) => {
            return(
              <Card key={item.productId._id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${API_BASE_URL}${item.productId.imageUrl}`}
                      alt={item.productId.name}
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.productId.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.productId.currency}{' '}
                        {item.productId.discountPrice || item.productId.price}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {item.productId.currency}{' '}
                        {((item.productId.discountPrice || item.productId.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemove(item.productId._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                INR {cartTotal.toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

