import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { useAppSelector } from '../../redux/hooks';
import { useAppDispatch } from '../../redux/hooks';
import { Address } from '../../types/common.types';
import { LoadingState } from '../../components/common/LoadingState';
import { applyCoupon } from '../../redux/features/cart/cart.slice';

// Payment method is fixed to COD for now. When a gateway is added later,
// swap the disabled options below for real integrations (Razorpay etc.)
export const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((s) => s.cart.cart);
  const couponMessage = useAppSelector((s) => s.cart.couponMessage);
  const token = useAppSelector((s) => s.auth.token);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(Boolean(token));
  const [useNewAddress, setUseNewAddress] = useState(!token);
  const [address, setAddress] = useState<Address>({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState(cart.couponCode || '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState('');

  useEffect(() => {
    if (!token) return;
    userService.getProfile()
      .then((profile) => {
        const addresses = profile.addresses || [];
        setSavedAddresses(addresses);
        const defaultIndex = addresses.findIndex((savedAddress) => savedAddress.isDefault);
        if (addresses.length > 0) {
          const index = defaultIndex >= 0 ? defaultIndex : 0;
          setSelectedAddressIndex(index);
          setAddress(addresses[index]);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => setUseNewAddress(true))
      .finally(() => setLoadingAddresses(false));
  }, [token]);

  const handleChange = (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress({ ...address, [field]: e.target.value });

  const handleAddressSelect = (index: number) => {
    setSelectedAddressIndex(index);
    setAddress(savedAddresses[index]);
    setUseNewAddress(false);
    setFieldErrors({});
  };

  const startNewAddress = () => {
    setSelectedAddressIndex(null);
    setUseNewAddress(true);
    setAddress({ ...address, label: 'Home', isDefault: savedAddresses.length === 0 });
    setFieldErrors({});
  };

  const addressFields: (keyof Omit<Address, 'isDefault' | 'label'>)[] = [
    'fullName', 'phone', 'line1', 'line2', 'city', 'state', 'pincode',
  ];

  const handlePlaceOrder = async () => {
    const requiredFields: (keyof Address)[] = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
    const errors = requiredFields.reduce<Record<string, string>>((result, field) => {
      if (typeof address[field] !== 'string' || !address[field].trim()) result[field] = 'This field is required.';
      return result;
    }, {});
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setPlacing(true);
    setError('');
    try {
      let orderAddress = address;
      if (useNewAddress && token) {
        const saved = await userService.addAddress(address);
        orderAddress = saved[saved.length - 1] || address;
        setSavedAddresses(saved);
      }
      const order = await orderService.placeOrder(orderAddress);
      navigate(`/profile/orders/${order._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleVerifyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponFeedback('Enter a coupon code first.');
      return;
    }
    setCouponLoading(true);
    setCouponFeedback('');
    try {
      await dispatch(applyCoupon(code)).unwrap();
      setCouponFeedback('Coupon applied successfully.');
    } catch (err: any) {
      setCouponFeedback(typeof err === 'string' ? err : couponMessage || 'This coupon could not be applied.');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__intro">
        <p className="eyebrow">Almost yours</p>
        <h2>Where should we send it?</h2>
        <p>Choose a saved address or add a new one for this order.</p>
      </div>
      {loadingAddresses && <LoadingState label="Loading saved addresses" variant="section" />}
      {!loadingAddresses && savedAddresses.length > 0 && (
        <div className="checkout-page__saved-addresses">
          <div className="checkout-page__section-heading">
            <h3>Saved addresses</h3>
            <button type="button" className="btn btn--text" onClick={startNewAddress}>+ New address</button>
          </div>
          <div className="saved-address-list">
            {savedAddresses.map((savedAddress, index) => (
              <button type="button" key={index}
                className={`saved-address ${!useNewAddress && selectedAddressIndex === index ? 'saved-address--selected' : ''}`}
                onClick={() => handleAddressSelect(index)}>
                <span className="saved-address__topline"><strong>{savedAddress.label || 'Address'}</strong>{savedAddress.isDefault && <small>Default</small>}</span>
                <span>{savedAddress.fullName} · {savedAddress.phone}</span>
                <span>{savedAddress.line1}, {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {(!token || useNewAddress || savedAddresses.length === 0) && (
        <div className="checkout-page__new-address">
          <div className="checkout-page__section-heading">
            <h3>{savedAddresses.length ? 'Add a new address' : 'Shipping address'}</h3>
            {savedAddresses.length > 0 && <button type="button" className="btn btn--text" onClick={() => handleAddressSelect(0)}>Use saved address</button>}
          </div>
          <div className="checkout-page__fields">
            {addressFields.map((field) => (
              <label className={`form-field ${field === 'line1' || field === 'line2' ? 'form-field--wide' : ''}`} key={field}>{field === 'line1' ? 'Address line 1' : field === 'line2' ? 'Address line 2' : field.replace(/^./, (letter) => letter.toUpperCase())}{field !== 'line2' && ' *'}
                <input aria-invalid={Boolean(fieldErrors[field])} placeholder={field} value={address[field]} onChange={handleChange(field)} />
                {fieldErrors[field] && <span className="field-error">{fieldErrors[field]}</span>}
              </label>
            ))}
          </div>
          {token && <p className="checkout-page__save-note">This address will be saved to your account for faster checkout next time.</p>}
        </div>
      )}

      <h2>Payment Method</h2>
      <label className="checkout-page__payment-option">
        <input type="radio" checked readOnly /> Cash on Delivery
      </label>
      <p className="checkout-page__note">
        Online payments (UPI, cards, net banking) will be available soon.
      </p>

      <div className="checkout-page__coupon">
        <div>
          <h3>Have a coupon?</h3>
          <p>Apply your code before placing the order.</p>
        </div>
        <div className="checkout-page__coupon-control">
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
          />
          <button className="btn btn--outline" type="button" onClick={handleVerifyCoupon} disabled={couponLoading}>
            {couponLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {(couponFeedback || cart.couponError) && (
          <p className={couponFeedback === 'Coupon applied successfully.' && !cart.couponError ? 'hint' : 'error'}>
            {couponFeedback || cart.couponError}
          </p>
        )}
      </div>

      <div className="checkout-page__summary">
        <p>Subtotal: ₹{cart.subtotal}</p>
        {!!cart.discount && cart.discount > 0 && <p className="checkout-page__discount">Coupon discount: -₹{cart.discount}</p>}
        <strong>Total: ₹{cart.total ?? cart.subtotal}</strong>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="checkout-page__action">
        <button className="btn btn--primary" onClick={handlePlaceOrder} disabled={placing}>
          {placing ? 'Placing order...' : 'Place Order (COD)'}
        </button>
      </div>
    </div>
  );
};
